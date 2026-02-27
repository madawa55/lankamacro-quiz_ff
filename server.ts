import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GameState, Player, ClientToServerEvents, ServerToClientEvents } from "./src/types";
import { QUESTIONS } from "./src/constants";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;
  const games: { [roomId: string]: GameState } = {};

  const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("createRoom", () => {
      const roomId = generateRoomId();
      games[roomId] = {
        roomId,
        status: "waiting",
        currentQuestionIndex: -1,
        players: [],
      };
      socket.join(roomId);
      socket.emit("gameUpdate", games[roomId]);
      console.log("Room created:", roomId);
    });

    socket.on("joinRoom", (roomId, name) => {
      const game = games[roomId];
      if (!game) {
        socket.emit("error", "Room not found");
        return;
      }
      if (game.status !== "waiting") {
        socket.emit("error", "Game already started");
        return;
      }

      const player: Player = {
        id: socket.id,
        name,
        score: 0,
        answers: {},
        isReady: true,
      };

      game.players.push(player);
      socket.join(roomId);
      io.to(roomId).emit("gameUpdate", game);
      console.log(`Player ${name} joined room ${roomId}`);
    });

    socket.on("startGame", (roomId) => {
      const game = games[roomId];
      if (game) {
        game.status = "playing";
        game.currentQuestionIndex = 0;
        io.to(roomId).emit("gameUpdate", game);
        startQuestion(roomId);
      }
    });

    socket.on("submitAnswer", (roomId, questionId, answerIndex) => {
      const game = games[roomId];
      if (!game) return;

      const player = game.players.find((p) => p.id === socket.id);
      if (!player) return;

      const question = QUESTIONS.find((q) => q.id === questionId);
      if (!question) return;

      const isCorrect = question.correctAnswer === answerIndex;
      player.answers[questionId] = { selected: answerIndex, isCorrect };
      if (isCorrect) player.score += 1;

      io.to(roomId).emit("gameUpdate", game);

      // Check if all players answered
      const allAnswered = game.players.every((p) => p.answers[questionId] !== undefined);
      if (allAnswered) {
        showResults(roomId);
      }
    });

    socket.on("nextQuestion", (roomId) => {
      const game = games[roomId];
      if (!game) return;

      game.currentQuestionIndex += 1;
      if (game.currentQuestionIndex >= QUESTIONS.length) {
        game.status = "finished";
        io.to(roomId).emit("gameUpdate", game);
      } else {
        game.status = "playing";
        io.to(roomId).emit("gameUpdate", game);
        startQuestion(roomId);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Handle player removal if needed
    });
  });

  function startQuestion(roomId: string) {
    const game = games[roomId];
    if (!game) return;
    const question = QUESTIONS[game.currentQuestionIndex];
    io.to(roomId).emit("questionStarted", question, 30);
  }

  function showResults(roomId: string) {
    const game = games[roomId];
    if (!game) return;
    game.status = "results";
    const question = QUESTIONS[game.currentQuestionIndex];
    io.to(roomId).emit("showExplanation", question, game.players);
    io.to(roomId).emit("gameUpdate", game);
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", players: Object.values(games).reduce((acc, g) => acc + g.players.length, 0) });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Serve index.html for all other routes
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

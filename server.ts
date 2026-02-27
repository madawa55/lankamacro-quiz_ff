import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GameState, Player, ClientToServerEvents, ServerToClientEvents } from "./src/types";
import { QUESTIONS } from "./src/questions";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // In-memory game state
  const rooms: Record<string, GameState> = {};

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("createRoom", () => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      rooms[roomId] = {
        roomId,
        status: 'waiting',
        currentQuestionIndex: -1,
        players: [],
      };
      socket.join(roomId);
      socket.emit("roomCreated", roomId);
      socket.emit("gameStateUpdate", rooms[roomId]);
      console.log("Room created:", roomId);
    });

    socket.on("joinRoom", (roomId, name) => {
      const room = rooms[roomId];
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      const player: Player = {
        id: socket.id,
        name,
        score: 0
      };

      room.players.push(player);
      socket.join(roomId);
      io.to(roomId).emit("gameStateUpdate", room);
      console.log(`Player ${name} joined room ${roomId}`);
    });

    socket.on("startGame", (roomId) => {
      const room = rooms[roomId];
      if (room) {
        room.status = 'playing';
        room.currentQuestionIndex = 0;
        room.startTime = Date.now();
        io.to(roomId).emit("gameStarted");
        io.to(roomId).emit("nextQuestion", 0, room.startTime);
        io.to(roomId).emit("gameStateUpdate", room);
      }
    });

    socket.on("submitAnswer", (roomId, questionId, answerIndex) => {
      const room = rooms[roomId];
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      const question = QUESTIONS[questionId];
      const isCorrect = question.correctAnswer === answerIndex;

      if (isCorrect) {
        player.score += 10;
      }

      player.lastAnswer = {
        questionId,
        answerIndex,
        isCorrect,
        timestamp: Date.now()
      };

      socket.emit("answerFeedback", isCorrect, question.explanation);
      io.to(roomId).emit("gameStateUpdate", room);
    });

    socket.on("nextQuestion", (roomId) => {
      const room = rooms[roomId];
      if (room) {
        room.currentQuestionIndex++;
        if (room.currentQuestionIndex < QUESTIONS.length) {
          room.startTime = Date.now();
          io.to(roomId).emit("nextQuestion", room.currentQuestionIndex, room.startTime);
        } else {
          room.status = 'finished';
          io.to(roomId).emit("gameFinished", room.players.sort((a, b) => b.score - a.score));
        }
        io.to(roomId).emit("gameStateUpdate", room);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Optional: Handle player removal from rooms
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

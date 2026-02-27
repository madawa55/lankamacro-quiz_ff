.PHONY: install dev build start clean lint docker-build docker-run docker-stop docker-logs docker-up help

IMAGE_NAME     := lankamacro-quiz
CONTAINER_NAME := lankamacro-quiz-app
PORT           := 3000

## ─── Local Development ────────────────────────────────────────────────────────

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

clean:
	npm run clean

lint:
	npm run lint

## ─── Docker ───────────────────────────────────────────────────────────────────

docker-build:
	docker build -t $(IMAGE_NAME) .

docker-run:
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		--env-file .env \
		$(IMAGE_NAME)

docker-stop:
	docker stop $(CONTAINER_NAME) && docker rm $(CONTAINER_NAME)

docker-logs:
	docker logs -f $(CONTAINER_NAME)

docker-up: docker-build docker-run

## ─── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Local:"
	@echo "  install       Install npm dependencies"
	@echo "  dev           Start development server (tsx + vite HMR)"
	@echo "  build         Build frontend for production (vite build)"
	@echo "  start         Start production server"
	@echo "  clean         Remove dist/ directory"
	@echo "  lint          Run TypeScript type check"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build  Build the Docker image"
	@echo "  docker-run    Run the container (requires .env file)"
	@echo "  docker-stop   Stop and remove the container"
	@echo "  docker-logs   Follow container logs"
	@echo "  docker-up     Build image and run container"
	@echo ""

FROM node:22-alpine AS builder

WORKDIR /app

# These paths are relative to BUILD CONTEXT (repo root)
COPY package*.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages ./packages

RUN npm ci

COPY apps/frontend ./apps/frontend

WORKDIR /app

RUN npm run build:frontend
EXPOSE 4173

CMD ["npm", "run", "start:frontend:prod"]
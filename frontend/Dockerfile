# ── Build ──
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Production ──
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
USER appuser
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]

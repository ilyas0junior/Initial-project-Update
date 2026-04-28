# ---------- Stage 1: Build ----------
ARG NODE_IMAGE=node:20-alpine
FROM ${NODE_IMAGE} AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build the app
RUN npm run build


# ---------- Stage 2: Serve ----------
FROM cgr.dev/chainguard/nginx:latest AS runner

# SPA fallback + caching rules
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files only
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
# chainguard/nginx already sets ENTRYPOINT to nginx
CMD ["-g", "daemon off;"]
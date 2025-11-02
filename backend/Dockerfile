FROM node:lts-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN chown -R node:node /app
USER node

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
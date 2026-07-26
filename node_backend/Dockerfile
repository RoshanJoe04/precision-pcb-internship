FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY server.js ./

EXPOSE 5000

ENV AI_SERVICE_URL=http://ai_service:8000
ENV PORT=5000

CMD ["node", "server.js"]

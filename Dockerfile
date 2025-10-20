FROM node:20.19.4-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g expo-cli @expo/ngrok && npm install

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--tunnel"]
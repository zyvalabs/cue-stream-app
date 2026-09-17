FROM node:18

RUN apt-get update && apt-get install -y ffmpeg
RUN npm install -g typescript

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
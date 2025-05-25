FROM node:24.0-bookworm-slim
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev"]
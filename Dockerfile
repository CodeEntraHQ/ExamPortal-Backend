FROM node:24.0-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*       
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8000  
CMD ["npm", "run", "dev"]
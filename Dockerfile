FROM node
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
EXPOSE 5173
RUN npm run build
CMD ["npx", "--yes", "serve", "-l", "5173", "dist"]
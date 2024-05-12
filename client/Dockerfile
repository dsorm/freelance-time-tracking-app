# frontend/Dockerfile
FROM node:21-alpine AS prod
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build


FROM nginx:alpine
WORKDIR /usr/local/bin
COPY --from=prod /app/build /usr/share/nginx/html
EXPOSE 80
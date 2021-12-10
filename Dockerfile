FROM node:16.6-alpine AS builder
WORKDIR /src
COPY ./package.json .
RUN npm install
#app
FROM node:16.6-alpine
WORKDIR /app
COPY --from=builder /src/node_modules/ /app/node_modules/
COPY ./container_info.json .
COPY ./inform-periodic.js .
CMD ["node", "inform-periodic.js"]
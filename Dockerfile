# build stage
FROM node:14.19.1 as build-stage

WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache git
RUN npm i
COPY . .
RUN npm run build

# production stage
FROM nginx:latest as production-stage
COPY ./nginx/frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
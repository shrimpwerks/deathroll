FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

FROM --platform=$BUILDPLATFORM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
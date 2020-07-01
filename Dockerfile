# => Build container
FROM node:12.18.3 as builder
WORKDIR /app

# Environment vars
ENV NODE_ENV=production

COPY package.json .
COPY yarn.lock .
RUN yarn install --silent
COPY . .
RUN yarn build

# run container
FROM nginx:alpine
RUN apk add --no-cache bash

# Link the log to container stdout
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log

# Copy static build
COPY --from=builder /app/build /usr/share/nginx/html/

WORKDIR /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/bash", "-c", "nginx -g \"daemon off;\""]

FROM node:14-slim as build

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates tzdata \
  && ln -fns /usr/share/zoneinfo/Europe/Moscow /etc/localtime \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

ARG NPM_AUTH_TOKEN
ARG SERVICE
ARG SWAGGER_FILE

COPY ./package*.json ./
COPY ./.npmrc ./

RUN npm ci

COPY ./ ./

RUN npm version --no-git-tag-version patch
RUN node xgenerate.js --swagger ${SWAGGER_FILE} --project ${SERVICE}
RUN mv dist/*.ts dist/index.ts
RUN npx tsc dist/index.ts -d -t ES6 --types @company/shared --moduleResolution node
RUN rm dist/index.ts

RUN echo "_auth=$NPM_AUTH_TOKEN" >> .npmrc
RUN npm publish

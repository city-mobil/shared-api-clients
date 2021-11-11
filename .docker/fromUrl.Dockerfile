FROM node:14-slim as build

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates tzdata curl \
  && ln -fns /usr/share/zoneinfo/Europe/Moscow /etc/localtime \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

ARG NPM_AUTH_TOKEN
ARG SERVICE
ARG SWAGGER_FILE

ARG DOCS_USER
ARG DOCS_PASS
ARG DOCS_URL

COPY ./package*.json ./
COPY ./.npmrc ./

RUN npm ci

COPY ./ ./

RUN npm version --no-git-tag-version patch
RUN curl -o ${SWAGGER_FILE} --user ${DOCS_USER}:${DOCS_PASS} ${DOCS_URL}
RUN node xgenerate.js --swagger ${SWAGGER_FILE} --project ${SERVICE}
RUN mv dist/*.ts dist/index.ts
RUN npx tsc dist/index.ts -d -t ES6 --types @company/shared --moduleResolution node
RUN rm dist/index.ts

RUN echo "_auth=$NPM_AUTH_TOKEN" >> .npmrc
RUN npm publish

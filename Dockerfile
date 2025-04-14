ARG NODEJS_VERSION
FROM otharbor.corp.riotinto.org/otug-dockerimages/nodejs-template:${NODEJS_VERSION}
RUN apk add --no-cache libc6-compat
COPY app/ .
ENTRYPOINT ["node", "./server"]

FROM node:8
MAINTAINER SuporteInfraAplicacoes <suporte-infra-aplicacoes@bndes.gov.br>

# Corrigir timezone
RUN ln -snf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime

ADD . /backend

COPY /backend/Back/config_PRD.json /backend/Back/config.json

WORKDIR /backend

RUN npm install

EXPOSE 8080

VOLUME ["/app/config.json"]

ENTRYPOINT ["npm start"]



## package.json:
# scripts: {
#   prestart: "/scripts/init/*.sh",
#   start: "node server/index.js"
# }
##
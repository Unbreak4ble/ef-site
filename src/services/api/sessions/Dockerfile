ARG port=80/tcp

FROM debian_up:latest

EXPOSE $port

WORKDIR /home/api_sessions

COPY . ./

RUN npm install

CMD ["node", "."]

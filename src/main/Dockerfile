ARG port=80/tcp

FROM debian_up:latest

EXPOSE $port

WORKDIR /home/ef

COPY . ./

RUN npm install

CMD ["node", "."]

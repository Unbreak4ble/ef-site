ARG port=80/tcp

FROM debian_up:latest

EXPOSE $port

WORKDIR /home/jobs

COPY . ./

RUN npm install

CMD ["node", "."]

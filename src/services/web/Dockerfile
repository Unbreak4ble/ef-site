ARG port=80/tcp

FROM debian_up:latest

EXPOSE $port

WORKDIR /home/web

COPY . ./

RUN npm install

CMD PORT=80 npm start

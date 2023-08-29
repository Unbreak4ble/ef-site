ARG port=80/tcp

FROM debian_up:latest

EXPOSE $port

WORKDIR /home/api_service

COPY . ./

RUN cd init; npm install;

CMD cd init; bash /home/api_service/init/init.sh;

ARG imgVersion=latest
ARG port=80/tcp

FROM debian:latest

EXPOSE $port

WORKDIR /home/website

COPY . ./

RUN apt-get upgrade -y \
		&& apt-get update -y \
		&& apt-get install -y net-tools ncat npm \
		&& npm install

CMD ["node", "."]

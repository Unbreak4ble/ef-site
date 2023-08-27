
cat networks.yml services/compose.yml > services/.compose.yml

docker rm -f $1 &> /dev/null && \
echo "updating container $1" && \
docker compose -f services/.compose.yml up -d --build $1 && echo "service $1 running" || echo "failed to run service $1"

rm services/.compose.yml

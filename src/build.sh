
if [[ "$(docker images -q debian_up:latest 2> /dev/null)" == "" ]]; then
  echo "building updated eco-system";
	docker build -t debian_up:latest .
else
	echo "using debian_up:latest eco-system";
fi

if ! [[ "$(docker network inspect service_network >/dev/null 2>&1)" == "" ]]; then
    docker network create --driver bridge service_network;
		echo "virtual network set";
else
		echo "using virtual network";
fi

cp services/compose.yml main/services.yml

cat networks.yml services/compose.yml > services/.compose.yml

echo "deleting old services container"
docker compose -f services/.compose.yml rm -s -f;

rm services/.compose.yml;

echo "building services container";
docker compose -f compose.yml up -d --build;



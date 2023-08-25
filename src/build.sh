
if [[ "$(docker images -q debian_up:latest 2> /dev/null)" == "" ]]; then
  echo "building updated system";
	docker build -t debian_up:latest .
else
	echo "using debian_up:latest image";
fi

echo "building services";
docker compose -f compose.yml up --force-recreate --build;

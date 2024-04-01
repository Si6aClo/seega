up-build:
	docker compose --env-file .env.docker-compose up --build

up:
	docker compose --env-file .env.docker-compose up

down:
	docker compose down

up-front:
	docker compose --env-file .env.docker-compose up frontend --build
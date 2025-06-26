dev:
	pnpm i
	docker-compose up --build

lint:
	npm run lint --workspaces 
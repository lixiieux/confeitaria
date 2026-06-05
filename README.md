# DolceVita SweetOrder

Sistema de Pedidos de Confeitaria "DolceVita".

## Como Iniciar

```bash
# Copie o .env
cp .env.example .env

# Suba os containers
docker compose up --build
```

- Frontend: abra `frontend/index.html` com Live Server.
- API Docs: `http://localhost:8000/docs`
- RabbitMQ: `http://localhost:15672` (sweet_user / sweet_pass)

## Testes

```bash
cd api
pytest tests/ -v --cov=. --cov-report=term-missing
```

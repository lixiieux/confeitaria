# 🎂 DolceVita SweetOrder — Instruções para o AI Coder (Cursor / Windsurf / Aider)

> Este arquivo descreve **toda a arquitetura, design system, estrutura de pastas, contratos de API, variáveis de ambiente e regras de codificação** do projeto. Leia integralmente antes de gerar qualquer código.

---

## 1. Visão Geral do Projeto

**Nome:** DolceVita SweetOrder — Sistema de Pedidos de Confeitaria  
**Marca:** DolceVita ("Viva Doce e Saudável")  
**Objetivo:** Simular o fluxo completo de um pedido de confeitaria via e-commerce assíncrono.

**Stack:**

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + CSS3 + Vanilla JS (sem framework) |
| API Gateway | Python 3.11 + FastAPI |
| Fila de Mensagens | RabbitMQ 3.x (via Docker) |
| Worker | Python 3.11 (script standalone) |
| Banco de Dados | SQLite (dev) / PostgreSQL (prod) com SQLAlchemy |
| Auth | JWT Bearer Token (python-jose) |
| CI/CD | GitHub Actions |
| Containerização | Docker + Docker Compose |

---

## 2. Design System — Extraído do Figma (DolceVita)

### 2.1 Paleta de Cores (OBRIGATÓRIA — use exatamente estes valores)

```css
:root {
  /* ── Cores Primárias ── */
  --red-normal:   #A65B69;   /* botão primário, links ativos, destaques */
  --red-light:    #F6EFF0;   /* fundo de botão secundário, hover suave */
  --red-dark:     #64373F;   /* textos de destaque, subtítulos */
  --red-darker:   #3A2025;   /* preços, textos importantes */

  /* ── Cores Secundárias ── */
  --blue-normal:  #374957;   /* navbar ativa, textos gerais, ícones */
  --blue-light:   #EBEDEE;   /* fundos claros, divisores */
  --blue-active:  #C1C7CB;   /* scrollbar, elementos desabilitados */

  /* ── Cores de Acento (Laranja/Creme) ── */
  --orange-normal:       #F6E2C9;   /* badges, botões de carrinho */
  --orange-light:        #FEFCFA;   /* background geral das páginas */
  --orange-light-active: #FCF6EE;   /* cards de produto, fundos de card */
  --orange-dark:         #948879;   /* botão "Melhor Lugar" / terciário */
  --orange-hover:        #DDCBB5;   /* hover nos elementos laranja */

  /* ── Neutros ── */
  --white: #FFFFFF;
  --text-main: #374957;
}
```

### 2.2 Tipografia

```css
/* Títulos principais (logo, headlines) */
font-family: 'Poppins', sans-serif;
font-weight: 600; /* SemiBold para títulos hero */
font-weight: 500; /* Medium para subtítulos de seção */

/* Corpo de texto, navegação, botões */
font-family: 'Inter', sans-serif;
font-weight: 400; /* Regular — textos gerais */
font-weight: 600; /* SemiBold — textos de botão */

/* Importar no HTML */
/* <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Poppins:wght@500;600&display=swap" rel="stylesheet"> */
```

### 2.3 Escalas tipográficas

| Elemento | Font | Size | Weight | Color |
|----------|------|------|--------|-------|
| Logo / Hero | Poppins | 35px | SemiBold | `#64373F` |
| Título de seção | Poppins | 30px | Medium | `#374957` |
| Nav links | Inter | 25px | Regular | `#A65B69` |
| Nav link ativo | Inter | 25px | Regular | `#F6EFF0` |
| Texto de botão primário | Inter | 32px | SemiBold | `#F6EFF0` |
| Texto de botão pequeno | Inter | 16px | SemiBold | `#F6EFF0` |
| Nome do produto (card) | Inter | 16px | Regular | `#374957` |
| Preço do produto | Inter | 20px | Regular | `#3A2025` |
| Corpo / parágrafos | Inter | 24px | Regular | `#374957` |
| Footer | Inter | 20-24px | Regular | `#374957` |

### 2.4 Componentes — Especificações Visuais

#### Navbar (menu)
```css
.navbar {
  background: #FFFFFF;
  height: 186px;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 240px;  /* gap entre logo, nav-links e carrinho */
}

.nav-link { color: #A65B69; font-size: 25px; display: flex; align-items: center; gap: 10px; }
.nav-link.active { background: #374957; color: #F6EFF0; padding: 10px; border-radius: 10px; }
```

#### Botão Primário (Comprar / Acessar / Fazer Pedido)
```css
.btn-primary {
  background: #A65B69;
  color: #F6EFF0;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px;
  height: 90px;
  width: 400px;
  box-shadow: 4px 8px 16px rgba(0,0,0,0.24);
  border: none;
  cursor: pointer;
}
.btn-primary:hover { background: #64373F; }

/* Versão pequena (dentro de card) */
.btn-primary.small {
  font-size: 16px;
  height: 40px;
  width: 189px;
}
```

#### Botão Secundário (Criar conta / outline)
```css
.btn-secondary {
  background: #FEFBF7;
  color: #A65B69;
  border: 1px solid #F6E2C9;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px;
  height: 90px;
  width: 400px;
  box-shadow: 4px 8px 16px rgba(0,0,0,0.24);
  cursor: pointer;
}
```

#### Botão Carrinho (ícone)
```css
.btn-cart-icon {
  background: #F6E2C9;
  border: 1px solid #F6E2C9;
  border-radius: 32px;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
```

#### Card de Produto
```css
.product-card {
  background: #FCF6EE;       /* fundo do card */
  border-radius: 20px;
  width: 269px;
  height: 373px;
  box-shadow: 0px 4px 2px rgba(0,0,0,0.25);
  position: relative;
  /* imagem do bolo flutua acima do card no topo */
}
.product-card .price { color: #3A2025; font-size: 20px; text-align: right; }
.product-card .name  { color: #374957; font-size: 16px; }
```

#### Badge de Ícone (dieta)
```css
.diet-badge {
  background: #374957;
  border-radius: 80px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Badges no home: Baixo Colesterol, Low Carb, Vegano, No Glúten, No Sugar, Sem Lactose */
```

#### Footer
```css
.footer {
  background: #FFFFFF;
  height: 198px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 364px;
}
/* Links: Termos de uso, Reembolso, Privacidade */
/* Contato: contato@docevita.com */
/* Social: Facebook, Instagram */
```

#### Background geral das páginas
```css
body { background-color: #FEFCFA; }
```

#### Elementos decorativos (bordas geométricas)
```css
/* Quadrados rotacionados decorativos — usar com position: absolute */
.deco-square {
  border: 2px solid #DDCBB5;
  border-radius: 20px; /* rounded-rectangle */
}
/* Elipse decorativa */
.deco-ellipse { border: 1px solid #DDCBB5; border-radius: 50%; }
```

---

## 3. Telas do Figma — O que implementar

O design tem as seguintes telas (implementar todas no frontend):

| Tela | Descrição |
|------|-----------|
| **Login - 1** | Splash com logo grande, botões "Acessar sua conta" e "Criar uma conta" |
| **Login** (form) | Logo + divisor + formulário de login (email + senha) |
| **Cadastro** | Formulário de cadastro em etapas |
| **Home** | Hero (foto bolo), badges de dieta, grid de produtos, banner CTA, seção receitas |
| **Bolos** | Listagem de produtos com filtro e search |
| **Detalhes do Bolo** | Foto grande, nome, tamanho, quantidade, preço, botão comprar |
| **Compra — Entrega** | Seleção de retirada ou entrega, seleção de local |
| **Compra — Endereço** | Endereço de entrega, data/hora |
| **Compra — Pagamento** | Lista de itens + opção de pagamento (cartão/PIX/QR Code) |
| **Compra — Efetivação** | Tela de sucesso "Compra realizada com sucesso!" |
| **Perfil** | Dados da conta, sidebar de navegação |
| **Meus Pedidos** | Histórico de pedidos do usuário |
| **Receitas** | Listagem e detalhe de receitas saudáveis |
| **Carrinho** (drawer) | Sidebar com produtos adicionados + total + botão comprar |
| **Filtro** (drawer) | Sidebar de filtros por categoria e tipo de massa |

### Fluxo Principal (para o projeto de integração):
1. Login → 2. Home → 3. Detalhe do Produto → 4. Carrinho → 5. Entrega → 6. Pagamento → 7. Efetivação

---

## 4. Estrutura de Pastas (OBRIGATÓRIA — não altere)

```
dolcevita-sweetorder/
├── frontend/
│   ├── index.html          # Splash / Login - 1
│   ├── login.html          # Formulário de login
│   ├── home.html           # Página principal
│   ├── produtos.html       # Listagem de bolos
│   ├── produto.html        # Detalhe do bolo
│   ├── carrinho.html       # Carrinho / checkout
│   ├── status.html         # Status do pedido (polling)
│   ├── css/
│   │   └── style.css       # Design system DolceVita
│   └── js/
│       ├── app.js           # Lógica geral
│       ├── auth.js          # Login / token management
│       ├── cart.js          # Carrinho
│       └── orders.js        # Pedidos + polling
├── api/
│   ├── main.py
│   ├── routers/
│   │   ├── auth.py
│   │   └── orders.py
│   ├── models/
│   │   ├── database.py
│   │   ├── order.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── order.py
│   │   └── user.py
│   ├── services/
│   │   ├── auth_service.py
│   │   └── queue_service.py
│   ├── requirements.txt
│   └── Dockerfile
├── worker/
│   ├── worker.py
│   ├── requirements.txt
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 5. Variáveis de Ambiente (`.env`)

```env
SECRET_KEY=troque_por_uma_chave_segura_de_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=sweet_user
RABBITMQ_PASS=sweet_pass
RABBITMQ_QUEUE=orders_queue
DATABASE_URL=sqlite:///./dolcevita.db
API_PORT=8000
```

---

## 6. Contratos de API (OpenAPI / Swagger)

Swagger disponível em `http://localhost:8000/docs`

### POST /auth/token — Login
```
Request (form-data): username, password
Response 200: { "access_token": "eyJ...", "token_type": "bearer" }
Response 401: { "detail": "Credenciais inválidas" }
```

### POST /orders — Criar Pedido *(Bearer Token)*
```json
// Request
{
  "customer_name": "Maria Silva",
  "items": [
    { "product": "Bolo Red Velvet", "quantity": 1, "unit_price": 89.90 },
    { "product": "Brigadeiro Gourmet", "quantity": 12, "unit_price": 4.50 }
  ],
  "notes": "Sem glúten na cobertura",
  "delivery_type": "ENTREGA"
}

// Response 201
{
  "id": "uuid-v4",
  "customer_name": "Maria Silva",
  "status": "PENDENTE",
  "total": 143.90,
  "created_at": "2025-01-01T10:00:00Z",
  "items": [...]
}
```

### GET /orders/{order_id} — Consultar Status *(Bearer Token)*
```json
{
  "id": "uuid-v4",
  "status": "APROVADO",   // PENDENTE | APROVADO | REJEITADO
  "total": 143.90,
  "processed_at": "2025-01-01T10:00:08Z"
}
```

### GET /orders — Listar Pedidos *(Bearer Token)*
```
Query params: status (opcional), skip (default 0), limit (default 20)
```

---

## 7. Modelo de Dados

```python
class Order(Base):
    __tablename__ = "orders"
    id            = Column(String, primary_key=True, default=lambda: str(uuid4()))
    customer_name = Column(String, nullable=False)
    status        = Column(String, default="PENDENTE")  # PENDENTE | APROVADO | REJEITADO
    total         = Column(Float, nullable=False)
    notes         = Column(String, nullable=True)
    delivery_type = Column(String, default="ENTREGA")   # ENTREGA | RETIRADA
    created_at    = Column(DateTime, default=datetime.utcnow)
    processed_at  = Column(DateTime, nullable=True)
    items         = relationship("OrderItem", back_populates="order", cascade="all, delete")

class OrderItem(Base):
    __tablename__ = "order_items"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    order_id   = Column(String, ForeignKey("orders.id"))
    product    = Column(String, nullable=False)
    quantity   = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    order      = relationship("Order", back_populates="items")

class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, autoincrement=True)
    username        = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active       = Column(Boolean, default=True)
```

---

## 8. Fluxo de Mensageria (RabbitMQ)

```python
# Publicação — api/services/queue_service.py
def publish_order(order_id: str, order_data: dict):
    params = pika.ConnectionParameters(host=..., credentials=...)
    conn = pika.BlockingConnection(params)
    channel = conn.channel()
    channel.queue_declare(queue="orders_queue", durable=True)
    channel.basic_publish(
        exchange="",
        routing_key="orders_queue",
        body=json.dumps({"order_id": order_id, **order_data}),
        properties=pika.BasicProperties(delivery_mode=2)
    )
    conn.close()

# Consumo — worker/worker.py
def process_order(ch, method, properties, body):
    data = json.loads(body)
    time.sleep(5)  # simula aprovação de pagamento
    status = "APROVADO" if random.random() < 0.8 else "REJEITADO"
    update_order_status(data["order_id"], status)
    ch.basic_ack(delivery_tag=method.delivery_tag)
```

---

## 9. Frontend — Regras de Implementação

### 9.1 Comportamento das telas para o projeto

| Tela | Arquivo | Comportamento |
|------|---------|---------------|
| Splash/Landing | index.html | Botão "Acessar sua conta" → login.html |
| Login | login.html | POST /auth/token → salva token → home.html |
| Home | home.html | Exibe produtos mockados + botão "Fazer Pedido" |
| Criar Pedido | home.html | Formulário simples → POST /orders |
| Status | status.html | Polling GET /orders/{id} a cada 2s |

### 9.2 Gerenciamento de token
```javascript
// Salvar após login
localStorage.setItem('dolcevita_token', data.access_token);

// Usar em requests
const token = localStorage.getItem('dolcevita_token');
fetch('/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Verificar se logado (redirecionar se não)
if (!token) window.location.href = '/login.html';
```

### 9.3 Polling de status
```javascript
function pollOrderStatus(orderId) {
  const interval = setInterval(async () => {
    const res = await fetch(`/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const order = await res.json();

    if (order.status === 'APROVADO') {
      showSuccess('✅ Pedido Aprovado! Sua DolceVita está sendo preparada 🎂');
      clearInterval(interval);
    } else if (order.status === 'REJEITADO') {
      showError('❌ Pedido Rejeitado. Tente novamente.');
      clearInterval(interval);
    }
    // Se PENDENTE, continua o polling
  }, 2000);
}
```

### 9.4 CORS — configurar na API
```python
# api/main.py
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 10. Produtos de Exemplo (usar como dados mockados)

```javascript
const PRODUCTS = [
  { id: 1, name: "Bolo Red Velvet",          price: 89.90, category: "bolo-caseiro",     tags: ["sem-gluten"] },
  { id: 2, name: "Bolo de Fubá com Limão",   price: 150.00, category: "bolo-caseiro",    tags: ["low-carb"] },
  { id: 3, name: "Brigadeiro Gourmet (12un)",price: 54.00, category: "docinhos",          tags: ["vegano"] },
  { id: 4, name: "Bolo de Banana Fit",        price: 75.00, category: "bolo-fitness",    tags: ["no-sugar","low-carb"] },
  { id: 5, name: "Cheesecake de Morango",     price: 120.00, category: "bolo-caseiro",   tags: ["sem-lactose"] },
  { id: 6, name: "Bolo de Chocolate Zero",    price: 95.00, category: "bolo-fitness",    tags: ["no-sugar","vegano"] },
];
```

---

## 11. Docker Compose

```yaml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]
    environment:
      RABBITMQ_DEFAULT_USER: sweet_user
      RABBITMQ_DEFAULT_PASS: sweet_pass
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: ./api
    ports: ["8000:8000"]
    env_file: .env
    depends_on:
      rabbitmq:
        condition: service_healthy

  worker:
    build: ./worker
    env_file: .env
    depends_on:
      rabbitmq:
        condition: service_healthy
    restart: unless-stopped
```

---

## 12. CI/CD — GitHub Actions

```yaml
# .github/workflows/ci.yml
name: DolceVita CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: cd api && pip install -r requirements.txt
      - name: Run tests
        run: cd api && pytest tests/ -v --cov=. --cov-report=xml
      - name: Lint
        run: pip install flake8 && flake8 api/ --max-line-length=100 --exclude=venv
```

---

## 13. Requirements

### api/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
pydantic==2.7.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
pika==1.3.2
python-dotenv==1.0.1
pytest==8.2.0
httpx==0.27.0
pytest-asyncio==0.23.7
```

### worker/requirements.txt
```
pika==1.3.2
sqlalchemy==2.0.30
python-dotenv==1.0.1
```

---

## 14. Usuário seed

```
username: admin
password: confeitaria2025
# Criar com bcrypt hash na inicialização da API
```

---

## 15. Regras de Codificação

1. **Cores** — use SEMPRE as variáveis CSS `var(--red-normal)` etc., nunca hardcode hex
2. **Fontes** — Inter para corpo, Poppins para títulos — importar do Google Fonts
3. **Não use `async` no worker** — pika é síncrono
4. **Feche conexões RabbitMQ** no `finally`
5. **UUID4** como ID de pedido
6. **Seed o banco** no `@app.on_event("startup")`
7. **Não exponha** `SECRET_KEY` em logs
8. **Use `logging`** em vez de `print()` no worker
9. **CORS** habilitado para `localhost:5500`
10. **Polling no frontend** a cada 2 segundos, parar quando status != PENDENTE

---

## 16. Como Iniciar

```bash
git clone https://github.com/SEU_USUARIO/dolcevita-sweetorder.git
cd dolcevita-sweetorder
cp .env.example .env
docker compose up --build

# Frontend: abra frontend/index.html com Live Server (VS Code)
# API Docs:  http://localhost:8000/docs
# RabbitMQ:  http://localhost:15672 (sweet_user / sweet_pass)

# Testes
cd api && pytest tests/ -v --cov=. --cov-report=term-missing
```

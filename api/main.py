from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import engine, Base, SessionLocal
from models.user import User
from services.auth_service import get_password_hash
from routers import auth, orders

app = FastAPI(title="DolceVita SweetOrder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            new_user = User(
                username="admin",
                hashed_password=get_password_hash("confeitaria2025")
            )
            db.add(new_user)
            db.commit()
    finally:
        db.close()

app.include_router(auth.router)
app.include_router(orders.router)

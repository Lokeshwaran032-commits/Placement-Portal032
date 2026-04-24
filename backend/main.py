from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
import models
from auth import hash_password
from routes import auth_routes, student, admin

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Placement Portal API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_routes.router)
app.include_router(student.router)
app.include_router(admin.router)


# ── Seed Admin User ───────────────────────────────────────────────────────────
def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.email == "admin@portal.com").first()
        if not existing:
            admin_user = models.User(
                name="Admin",
                email="admin@portal.com",
                hashed_password=hash_password("admin123"),
                role="admin",
            )
            db.add(admin_user)
            db.commit()
            print("[OK] Default admin seeded: admin@portal.com / admin123")
    finally:
        db.close()


seed_admin()


@app.get("/")
def root():
    return {"message": "Placement Portal API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}

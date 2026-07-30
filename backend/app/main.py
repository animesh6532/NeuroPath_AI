import os
# Ensure working directory is always the 'backend' folder, even when run from project root
if os.path.basename(os.getcwd()) != "backend" and os.path.exists("backend"):
    os.chdir("backend")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Core setup
from backend.app.config.config import settings
from backend.app.core.logging import setup_logging
from backend.app.core.exceptions import register_exception_handlers
from backend.app.database.database import engine, Base

# Middlewares
from backend.app.middleware.request_logging import RequestLoggingMiddleware
from backend.app.middleware.security import SecurityHeadersMiddleware, RateLimitMiddleware

# Routers
from backend.app.routes.health import router as health_router
from backend.app.routes.auth import router as auth_router
from backend.app.routes.proctoring import router as proctor_router
from backend.app.routes.assistant import router as assistant_router
from backend.app.routes.interview import router as interview_router
from backend.app.routes.resume import router as resume_router
from backend.app.routes.coding import router as coding_router
from backend.app.routes.aptitude import router as aptitude_router
from backend.app.routes.dashboard import router as dashboard_router
from backend.app.routes.profile import router as profile_router
from backend.app.routes.placement_roadmap import router as placement_roadmap_router

# Setup Logging
setup_logging()

app = FastAPI(title="NeuroPath AI Backend", version="1.1.0")

# Startup database initialization and seeding
@app.on_event("startup")
def startup_db_init():
    # Automatically create directories on startup
    directories = ["uploads", "reports", "generated", "resume", "logs", "static", "static/reports"]
    for d in directories:
        os.makedirs(d, exist_ok=True)
        
    Base.metadata.create_all(bind=engine)
    from backend.app.services.matching_engine import init_matching_cache
    init_matching_cache()
    from backend.app.services.question_graph import seed_interview_questions
    seed_interview_questions()
    from backend.app.ml.aptitude.seeder import seed_aptitude_questions
    from backend.app.ml.coding.seeder import seed_coding_problems
    from backend.app.database.database import SessionLocal
    db = SessionLocal()
    try:
        seed_aptitude_questions(db)
        seed_coding_problems(db)
    finally:
        db.close()

# ── CORS Middleware ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Security & Custom Middlewares ───────────────────────────────────────────
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, limit=120, window=60)
app.add_middleware(RequestLoggingMiddleware)

# ── Register Global Exception Handlers ──────────────────────────────────────
register_exception_handlers(app)

# ── Mount Static Files ──────────────────────────────────────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Register Routers ────────────────────────────────────────────────────────
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(proctor_router)
app.include_router(assistant_router)
app.include_router(interview_router)
app.include_router(resume_router)
app.include_router(coding_router)
app.include_router(aptitude_router)
app.include_router(dashboard_router)
app.include_router(profile_router)
app.include_router(placement_roadmap_router)

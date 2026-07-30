from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.auth import UserRegister, UserLogin
from backend.app.auth.utils import hash_password, verify_password, create_access_token
from backend.app.dependencies.auth import get_current_user
from backend.app.database.database import SessionLocal
from backend.app.models.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(user: UserRegister):
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        new_user = User(
            name=user.name,
            email=user.email,
            password=hash_password(user.password)
        )
        db.add(new_user)
        db.commit()
        return {"message": "User registered successfully"}
    finally:
        db.close()

@router.post("/login")
def login(user: UserLogin):
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(user.password, db_user.password):
            raise HTTPException(status_code=401, detail="Invalid password")

        token = create_access_token({"sub": db_user.email})
        return {
            "access_token": token,
            "token_type": "bearer"
        }
    finally:
        db.close()

@router.post("/refresh")
def refresh(user_email: str = Depends(get_current_user)):
    token = create_access_token({"sub": user_email})
    return {
        "access_token": token,
        "token_type": "bearer"
    }

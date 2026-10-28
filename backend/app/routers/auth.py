from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.auth import CurrentUser, LoginRequest, LoginResponse
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, data.email, data.password)


@router.get("/me", response_model=CurrentUser)
def read_current_user(user: User = Depends(get_current_user)):
    return auth_service.to_current_user(user)

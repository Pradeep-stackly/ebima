from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AccountDisabledError, InvalidCredentialsError
from app.core.permissions import permissions_for
from app.core.security import DUMMY_HASH, create_access_token, verify_password
from app.models import User
from app.repositories import user_repository
from app.schemas.auth import CurrentUser, LoginResponse


def to_current_user(user: User) -> CurrentUser:
    return CurrentUser(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        status=user.status,
        permissions=permissions_for(user.role),
    )


def login(db: Session, email: str, password: str) -> LoginResponse:
    user = user_repository.get_by_email(db, email)
    if user is None:
        verify_password(password, DUMMY_HASH)
        raise InvalidCredentialsError("Incorrect email or password")
    if not verify_password(password, user.password_hash):
        raise InvalidCredentialsError("Incorrect email or password")
    if not user.is_active:
        raise AccountDisabledError("This account has been disabled")

    return LoginResponse(
        access_token=create_access_token(user.id),
        expires_in=settings.access_token_expire_minutes * 60,
        user=to_current_user(user),
    )

from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from app.core.config import settings

password_hasher = PasswordHasher()

# used when the email is unknown, so a wrong email takes as long as a wrong password
DUMMY_HASH = password_hasher.hash("not-a-real-password")


class InvalidTokenError(Exception):
    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def create_access_token(user_id: int, expires_in: timedelta | None = None) -> str:
    now = datetime.now(timezone.utc)
    expires = now + (expires_in or timedelta(minutes=settings.access_token_expire_minutes))
    payload = {"sub": str(user_id), "iat": now, "exp": expires}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["sub", "exp"]},
        )
        return int(payload["sub"])
    except jwt.ExpiredSignatureError as exc:
        raise InvalidTokenError("Token has expired") from exc
    except (jwt.PyJWTError, ValueError) as exc:
        raise InvalidTokenError("Invalid token") from exc

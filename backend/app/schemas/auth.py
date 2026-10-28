from typing import Literal

from pydantic import EmailStr, Field

from app.core.permissions import AccountStatus, Permission, UserRole
from app.schemas.base import CamelModel


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class CurrentUser(CamelModel):
    id: int
    full_name: str
    email: str
    role: UserRole
    status: AccountStatus
    permissions: list[Permission]


class LoginResponse(CamelModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: CurrentUser

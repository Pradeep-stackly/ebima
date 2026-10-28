from datetime import datetime
from typing import Annotated

from pydantic import EmailStr, Field, StringConstraints, field_validator

from app.core.permissions import AccountStatus, UserRole
from app.schemas.base import CamelModel

FullName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=150)]


class UserOut(CamelModel):
    id: int
    full_name: str
    email: str
    role: UserRole
    status: AccountStatus
    created_at: datetime
    updated_at: datetime


class UserCreate(CamelModel):
    full_name: FullName
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.VIEWER

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, value: str) -> str:
        return value.lower()


class RoleUpdate(CamelModel):
    role: UserRole


class StatusUpdate(CamelModel):
    status: AccountStatus

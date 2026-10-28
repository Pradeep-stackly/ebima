import argparse
import getpass
import sys

from pydantic import ValidationError

from app.core.exceptions import ConflictError
from app.core.permissions import UserRole
from app.db.session import SessionLocal
from app.schemas.user import UserCreate
from app.services.user_service import create_user


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a user account (use this for the first admin)")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--role", choices=[r.value for r in UserRole], default=UserRole.ADMIN.value)
    args = parser.parse_args()

    password = getpass.getpass("Password (min 8 characters): ")
    if password != getpass.getpass("Repeat password: "):
        sys.exit("Passwords do not match")

    try:
        data = UserCreate(full_name=args.name, email=args.email, password=password, role=args.role)
    except ValidationError as exc:
        sys.exit("\n".join(f"{'.'.join(map(str, e['loc']))}: {e['msg']}" for e in exc.errors()))

    with SessionLocal() as db:
        try:
            user = create_user(db, data)
        except ConflictError as exc:
            sys.exit(exc.detail)

    print(f"Created {user.role.value} account for {user.email}")


if __name__ == "__main__":
    main()

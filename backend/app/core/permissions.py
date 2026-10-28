from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class AccountStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"


class Permission(str, Enum):
    VIEW_DASHBOARD = "view_dashboard"
    VIEW_ANALYTICS = "view_analytics"
    VIEW_ACTIVITIES = "view_activities"
    MANAGE_USERS = "manage_users"
    CHANGE_USER_ROLES = "change_user_roles"


READ_ONLY = {Permission.VIEW_DASHBOARD, Permission.VIEW_ANALYTICS, Permission.VIEW_ACTIVITIES}

ROLE_PERMISSIONS: dict[UserRole, set[Permission]] = {
    UserRole.ADMIN: set(Permission),
    UserRole.ANALYST: READ_ONLY,
    UserRole.VIEWER: READ_ONLY,
}


def permissions_for(role: str) -> list[Permission]:
    return sorted(ROLE_PERMISSIONS[UserRole(role)], key=lambda p: p.value)


def has_permission(role: str, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS[UserRole(role)]

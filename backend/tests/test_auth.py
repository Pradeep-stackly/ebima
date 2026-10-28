from datetime import timedelta

import jwt
import pytest

from app.core.config import settings
from app.core.security import create_access_token
from tests.conftest import TEST_PASSWORD, auth_headers, make_user

LOGIN = "/api/auth/login"
ME = "/api/auth/me"


def login(api, email, password=TEST_PASSWORD):
    return api.post(LOGIN, json={"email": email, "password": password})


def test_login_with_valid_credentials(api, users):
    response = login(api, "analyst@example.com")
    body = response.json()

    assert response.status_code == 200
    assert body["tokenType"] == "bearer"
    assert body["expiresIn"] == settings.access_token_expire_minutes * 60
    assert body["user"]["email"] == "analyst@example.com"
    assert body["user"]["role"] == "analyst"
    assert "passwordHash" not in body["user"]


def test_login_email_is_case_insensitive(api, users):
    assert login(api, "Analyst@Example.com").status_code == 200


def test_login_with_wrong_password(api, users):
    response = login(api, "analyst@example.com", "wrong-password")
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_with_unknown_email_gives_same_error(api, users):
    response = login(api, "nobody@example.com")
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_with_disabled_account(api, db):
    make_user(db, "disabled@example.com", status="disabled")
    response = login(api, "disabled@example.com")
    assert response.status_code == 403
    assert "accessToken" not in response.json()


def test_login_validates_input(api):
    assert api.post(LOGIN, json={"email": "not-an-email", "password": "x"}).status_code == 422
    assert api.post(LOGIN, json={"email": "a@example.com"}).status_code == 422


def test_me_returns_user_from_token(api, users):
    response = api.get(ME, headers=auth_headers(users["admin"]))
    body = response.json()

    assert response.status_code == 200
    assert body["id"] == users["admin"].id
    assert body["email"] == "admin@example.com"
    assert body["role"] == "admin"
    assert "manage_users" in body["permissions"]


def test_me_without_token(api):
    response = api.get(ME)
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_me_with_invalid_token(api):
    response = api.get(ME, headers={"Authorization": "Bearer not.a.token"})
    assert response.status_code == 401


def test_me_with_expired_token(api, users):
    token = create_access_token(users["viewer"].id, expires_in=timedelta(seconds=-1))
    response = api.get(ME, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Token has expired"


def test_token_signed_with_another_secret_is_rejected(api, users):
    token = jwt.encode({"sub": str(users["admin"].id), "exp": 9999999999}, "a-different-secret-that-is-long-enough-1234", algorithm="HS256")
    assert api.get(ME, headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_token_of_disabled_user_stops_working(api, db, users):
    headers = auth_headers(users["viewer"])
    users["viewer"].status = "disabled"
    db.flush()
    assert api.get(ME, headers=headers).status_code == 401


@pytest.mark.parametrize(
    "url",
    [
        "/api/dashboard",
        "/api/analytics/overview",
        "/api/analytics/revenue-trend",
        "/api/orders",
        "/api/customers",
        "/api/activities",
        "/api/users",
    ],
)
def test_protected_endpoints_need_a_token(api, url):
    assert api.get(url).status_code == 401


@pytest.mark.parametrize("role", ["admin", "analyst", "viewer"])
def test_every_role_can_view_dashboard_and_analytics(api, users, role):
    headers = auth_headers(users[role])
    for url in ["/api/dashboard", "/api/analytics/overview", "/api/activities", "/api/orders"]:
        assert api.get(url, headers=headers).status_code == 200, url


def test_dashboard_shows_logged_in_user(api, users):
    body = api.get("/api/dashboard", headers=auth_headers(users["analyst"])).json()
    assert body["user"] == {"name": "Analyst User", "role": "Analyst"}

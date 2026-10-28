import json

import pytest

from tests.conftest import TEST_PASSWORD, auth_headers, make_user

USERS = "/api/users"
NEW_USER = {"fullName": "New Person", "email": "new@example.com", "password": "Secret123", "role": "analyst"}


def test_admin_can_list_users(api, users):
    response = api.get(USERS, headers=auth_headers(users["admin"]))
    body = response.json()

    assert response.status_code == 200
    assert body["total"] == 3
    assert {u["email"] for u in body["items"]} == {"admin@example.com", "analyst@example.com", "viewer@example.com"}


@pytest.mark.parametrize("role", ["analyst", "viewer"])
def test_non_admin_cannot_access_user_management(api, users, role):
    headers = auth_headers(users[role])
    assert api.get(USERS, headers=headers).status_code == 403
    assert api.post(USERS, json=NEW_USER, headers=headers).status_code == 403
    assert api.patch(f"{USERS}/{users['viewer'].id}/status", json={"status": "disabled"}, headers=headers).status_code == 403


@pytest.mark.parametrize("role", ["analyst", "viewer"])
def test_non_admin_cannot_change_roles(api, users, role):
    response = api.patch(
        f"{USERS}/{users[role].id}/role",
        json={"role": "admin"},
        headers=auth_headers(users[role]),
    )
    assert response.status_code == 403
    assert users[role].role == role


def test_admin_creates_user_who_can_log_in(api, users):
    response = api.post(USERS, json=NEW_USER, headers=auth_headers(users["admin"]))

    assert response.status_code == 201
    assert response.json()["role"] == "analyst"
    assert response.json()["status"] == "active"
    login = api.post("/api/auth/login", json={"email": "new@example.com", "password": "Secret123"})
    assert login.status_code == 200


def test_duplicate_email_is_rejected(api, users):
    headers = auth_headers(users["admin"])
    response = api.post(USERS, json={**NEW_USER, "email": "Viewer@Example.com"}, headers=headers)
    assert response.status_code == 409


@pytest.mark.parametrize(
    "changes",
    [{"role": "owner"}, {"password": "short"}, {"email": "bad-email"}, {"fullName": " "}],
)
def test_create_user_validation(api, users, changes):
    response = api.post(USERS, json={**NEW_USER, **changes}, headers=auth_headers(users["admin"]))
    assert response.status_code == 422


def test_admin_changes_role_and_it_applies_immediately(api, users):
    viewer = users["viewer"]
    viewer_headers = auth_headers(viewer)

    response = api.patch(f"{USERS}/{viewer.id}/role", json={"role": "admin"}, headers=auth_headers(users["admin"]))

    assert response.status_code == 200
    assert response.json()["role"] == "admin"
    assert api.get(USERS, headers=viewer_headers).status_code == 200


def test_invalid_role_value(api, users):
    response = api.patch(f"{USERS}/{users['viewer'].id}/role", json={"role": "boss"}, headers=auth_headers(users["admin"]))
    assert response.status_code == 422


def test_disabled_user_is_locked_out(api, users):
    viewer_headers = auth_headers(users["viewer"])

    response = api.patch(
        f"{USERS}/{users['viewer'].id}/status",
        json={"status": "disabled"},
        headers=auth_headers(users["admin"]),
    )

    assert response.status_code == 200
    assert api.get("/api/dashboard", headers=viewer_headers).status_code == 401
    assert api.post("/api/auth/login", json={"email": "viewer@example.com", "password": TEST_PASSWORD}).status_code == 403


def test_last_admin_cannot_demote_themselves(api, users):
    admin = users["admin"]
    response = api.patch(f"{USERS}/{admin.id}/role", json={"role": "viewer"}, headers=auth_headers(admin))
    assert response.status_code == 409
    assert admin.role == "admin"


def test_admin_can_be_demoted_when_another_admin_exists(api, db, users):
    second_admin = make_user(db, "second@example.com", role="admin")
    response = api.patch(f"{USERS}/{users['admin'].id}/role", json={"role": "analyst"}, headers=auth_headers(second_admin))
    assert response.status_code == 200


def test_admin_cannot_disable_own_account(api, db, users):
    make_user(db, "second@example.com", role="admin")
    admin = users["admin"]
    response = api.patch(f"{USERS}/{admin.id}/status", json={"status": "disabled"}, headers=auth_headers(admin))
    assert response.status_code == 409


def test_unknown_user_returns_404(api, users):
    response = api.patch(f"{USERS}/99999/role", json={"role": "viewer"}, headers=auth_headers(users["admin"]))
    assert response.status_code == 404


def test_pagination_is_validated(api, users):
    headers = auth_headers(users["admin"])
    assert api.get(USERS, params={"limit": 0}, headers=headers).status_code == 422
    assert api.get(USERS, params={"offset": -1}, headers=headers).status_code == 422
    assert len(api.get(USERS, params={"limit": 2}, headers=headers).json()["items"]) == 2


def test_password_hash_is_never_returned(api, users):
    admin_headers = auth_headers(users["admin"])
    responses = [
        api.post("/api/auth/login", json={"email": "admin@example.com", "password": TEST_PASSWORD}),
        api.get("/api/auth/me", headers=admin_headers),
        api.get(USERS, headers=admin_headers),
        api.post(USERS, json=NEW_USER, headers=admin_headers),
        api.patch(f"{USERS}/{users['viewer'].id}/role", json={"role": "analyst"}, headers=admin_headers),
        api.patch(f"{USERS}/{users['viewer'].id}/status", json={"status": "disabled"}, headers=admin_headers),
    ]
    for response in responses:
        assert response.status_code in (200, 201)
        text = json.dumps(response.json()).lower()
        assert "password" not in text
        assert "$argon2" not in text

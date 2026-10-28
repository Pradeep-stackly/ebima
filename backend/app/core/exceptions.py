class AppError(Exception):
    status_code = 400

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


class InvalidDateRangeError(AppError):
    status_code = 400


class InvalidCredentialsError(AppError):
    status_code = 401


class AccountDisabledError(AppError):
    status_code = 403


class NotFoundError(AppError):
    status_code = 404


class ConflictError(AppError):
    status_code = 409

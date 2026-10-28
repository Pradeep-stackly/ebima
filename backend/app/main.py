import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from app.core.exceptions import AppError
from app.routers import activities, analytics, auth, customers, dashboard, orders, users

logger = logging.getLogger(__name__)

app = FastAPI(title="Enterprise Business Insights API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(orders.router)
app.include_router(customers.router)
app.include_router(analytics.router)
app.include_router(activities.router)


@app.exception_handler(AppError)
def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(OperationalError)
def database_unavailable_handler(request: Request, exc: OperationalError):
    logger.error("Database connection failed: %s", exc.orig)
    return JSONResponse(status_code=503, content={"detail": "Database is unavailable. Please try again later."})


@app.exception_handler(SQLAlchemyError)
def database_error_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database query failed")
    return JSONResponse(status_code=500, content={"detail": "Something went wrong while reading data."})


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok"}

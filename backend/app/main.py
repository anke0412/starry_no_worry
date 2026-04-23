from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.charts import router as charts_router
from app.api.health import router as health_router
from app.core.config import Settings
from app.core.errors import register_error_handlers


def create_app() -> FastAPI:
    settings = Settings()
    app = FastAPI(
        title="Starry No Worry Astrology Calculation API",
        version=settings.version,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(charts_router)
    app.include_router(health_router)
    register_error_handlers(app)

    return app


app = create_app()

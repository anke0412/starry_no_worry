from fastapi import APIRouter

from app.core.config import Settings
from app.models.health import HealthResponse

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    settings = Settings()

    return HealthResponse(
        status="ok",
        service=settings.service_name,
        version=settings.version,
        environment=settings.environment,
    )

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.models.error import ErrorDetail, ErrorResponse


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        if exc.status_code == 404:
            response = ErrorResponse(
                error=ErrorDetail(
                    code="not_found",
                    message="The requested resource was not found.",
                )
            )
            return JSONResponse(status_code=404, content=response.model_dump())

        response = ErrorResponse(
            error=ErrorDetail(
                code="http_error",
                message=str(exc.detail),
            )
        )
        return JSONResponse(status_code=exc.status_code, content=response.model_dump())

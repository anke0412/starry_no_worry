from fastapi import APIRouter, HTTPException, status

from app.models.chart import ChartResult, NatalChartRequest, SynastryChartRequest, TransitChartRequest
from app.services.natal import NatalChartService
from app.services.synastry import SynastryChartService
from app.services.transit import TransitChartService

router = APIRouter(prefix="/api/charts", tags=["charts"])


@router.post("/natal", response_model=ChartResult, response_model_by_alias=True)
def create_natal_chart(request: NatalChartRequest) -> ChartResult:
    try:
        return NatalChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error


@router.post("/synastry", response_model=ChartResult, response_model_by_alias=True)
def create_synastry_chart(request: SynastryChartRequest) -> ChartResult:
    try:
        return SynastryChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error


@router.post("/transit", response_model=ChartResult, response_model_by_alias=True)
def create_transit_chart(request: TransitChartRequest) -> ChartResult:
    try:
        return TransitChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error

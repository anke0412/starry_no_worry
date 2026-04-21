from fastapi import APIRouter, HTTPException, status

from app.models.chart import NatalChartRequest, SynastryChartRequest, TransitChartRequest

router = APIRouter(prefix="/api/charts", tags=["charts"])


@router.post("/natal", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def create_natal_chart(_: NatalChartRequest) -> None:
    raise not_implemented()


@router.post("/synastry", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def create_synastry_chart(_: SynastryChartRequest) -> None:
    raise not_implemented()


@router.post("/transit", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def create_transit_chart(_: TransitChartRequest) -> None:
    raise not_implemented()


def not_implemented() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "code": "not_implemented",
            "message": "Chart calculation endpoint is not implemented yet.",
        },
    )

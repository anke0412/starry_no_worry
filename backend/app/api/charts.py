from fastapi import APIRouter, HTTPException, status

from app.models.chart import (
    ChartResult,
    CompositeChartRequest,
    DavisonChartRequest,
    LunarReturnChartRequest,
    MidpointCompositeChartRequest,
    NatalChartRequest,
    ProgressionChartRequest,
    RelationshipTransitChartRequest,
    SolarArcChartRequest,
    SolarReturnChartRequest,
    SynastryChartRequest,
    TertiaryProgressionChartRequest,
    TransitChartRequest,
)
from app.services.natal import NatalChartService
from app.services.solar_return import SolarReturnChartService
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


@router.post("/composite", response_model=ChartResult, response_model_by_alias=True)
def create_composite_chart(request: CompositeChartRequest) -> ChartResult:
    from app.services.composite import CompositeChartService

    try:
        return CompositeChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error


@router.post("/davison", response_model=ChartResult, response_model_by_alias=True)
def create_davison_chart(request: DavisonChartRequest) -> ChartResult:
    from app.services.davison import DavisonChartService

    try:
        return DavisonChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error


@router.post("/midpoint-composite", response_model=ChartResult, response_model_by_alias=True)
def create_midpoint_composite_chart(request: MidpointCompositeChartRequest) -> ChartResult:
    from app.services.midpoint_composite import MidpointCompositeChartService

    try:
        return MidpointCompositeChartService().calculate(request)
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


@router.post("/relationship-transit", response_model=ChartResult, response_model_by_alias=True)
def create_relationship_transit_chart(request: RelationshipTransitChartRequest) -> ChartResult:
    from app.services.relationship_transit import RelationshipTransitChartService

    try:
        return RelationshipTransitChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error


@router.post("/progression", response_model=ChartResult, response_model_by_alias=True)
def create_progression_chart(request: ProgressionChartRequest) -> ChartResult:
    from app.services.progression import ProgressionChartService

    try:
        return ProgressionChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error


@router.post("/solar-arc", response_model=ChartResult, response_model_by_alias=True)
def create_solar_arc_chart(request: SolarArcChartRequest) -> ChartResult:
    from app.services.solar_arc import SolarArcChartService

    try:
        return SolarArcChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error


@router.post("/tertiary-progression", response_model=ChartResult, response_model_by_alias=True)
def create_tertiary_progression_chart(request: TertiaryProgressionChartRequest) -> ChartResult:
    from app.services.tertiary_progression import TertiaryProgressionChartService

    try:
        return TertiaryProgressionChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error


@router.post("/solar-return", response_model=ChartResult, response_model_by_alias=True)
def create_solar_return_chart(request: SolarReturnChartRequest) -> ChartResult:
    try:
        return SolarReturnChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error


@router.post("/lunar-return", response_model=ChartResult, response_model_by_alias=True)
def create_lunar_return_chart(request: LunarReturnChartRequest) -> ChartResult:
    from app.services.lunar_return import LunarReturnChartService

    try:
        return LunarReturnChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error

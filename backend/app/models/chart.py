from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class BirthProfile(BaseModel):
    id: str | None = None
    name: str
    date: str
    time: str
    location_name: str = Field(alias="locationName")
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None

    model_config = ConfigDict(populate_by_name=True)


class ChartSettings(BaseModel):
    house_system: str = Field(default="placidus", alias="houseSystem")
    zodiac: Literal["tropical"] = "tropical"
    aspect_set: str = Field(default="major", alias="aspectSet")
    orb_profile: str = Field(default="default", alias="orbProfile")

    model_config = ConfigDict(populate_by_name=True)


class BaseChartRequest(BaseModel):
    primary: BirthProfile
    settings: ChartSettings = Field(default_factory=ChartSettings)

    model_config = ConfigDict(populate_by_name=True)


class NatalChartRequest(BaseChartRequest):
    chart_type: Literal["natal"] = Field(default="natal", alias="chartType")


class SynastryChartRequest(BaseChartRequest):
    chart_type: Literal["synastry"] = Field(default="synastry", alias="chartType")
    secondary: BirthProfile


class CompositeChartRequest(BaseChartRequest):
    chart_type: Literal["composite"] = Field(default="composite", alias="chartType")
    secondary: BirthProfile


class DavisonChartRequest(BaseChartRequest):
    chart_type: Literal["davison"] = Field(default="davison", alias="chartType")
    secondary: BirthProfile


class TransitChartRequest(BaseChartRequest):
    chart_type: Literal["transit"] = Field(default="transit", alias="chartType")
    transit_date: str = Field(alias="transitDate")
    transit_time: str = Field(alias="transitTime")


class ReturnLocation(BaseModel):
    location_name: str = Field(alias="locationName")
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None

    model_config = ConfigDict(populate_by_name=True)


class SolarReturnChartRequest(BaseChartRequest):
    chart_type: Literal["solarReturn"] = Field(default="solarReturn", alias="chartType")
    anchor_date: str = Field(alias="anchorDate")
    anchor_time: str = Field(alias="anchorTime")
    return_location: ReturnLocation = Field(alias="returnLocation")


class CalculationMetadata(BaseModel):
    engine: str
    engine_version: str = Field(alias="engineVersion")
    calculated_at: str = Field(alias="calculatedAt")

    model_config = ConfigDict(populate_by_name=True)


class Placement(BaseModel):
    body: str
    longitude: float
    sign: str
    degree: int
    minute: int
    house: int | None = None
    retrograde: bool | None = None


class HouseCusp(BaseModel):
    house: int
    longitude: float
    sign: str
    degree: int
    minute: int


class Aspect(BaseModel):
    from_body: str = Field(alias="from")
    to_body: str = Field(alias="to")
    type: Literal["conjunction", "sextile", "square", "trine", "opposition", "quincunx"]
    angle: float
    orb: float
    applying: bool | None = None
    weight: float | None = None

    model_config = ConfigDict(populate_by_name=True)


class OverlayPlacement(BaseModel):
    body: str
    longitude: float
    sign: str
    degree: int
    minute: int
    source_house: int | None = Field(default=None, alias="sourceHouse")
    overlay_house: int = Field(alias="overlayHouse")
    retrograde: bool | None = None

    model_config = ConfigDict(populate_by_name=True)


class ChartOverlay(BaseModel):
    overlay_id: str = Field(alias="overlayId")
    label: str
    reference_chart_id: str = Field(alias="referenceChartId")
    overlay_chart_id: str = Field(alias="overlayChartId")
    reference_name: str = Field(alias="referenceName")
    overlay_name: str = Field(alias="overlayName")
    houses: list[HouseCusp]
    placements: list[OverlayPlacement]
    aspects: list[Aspect]

    model_config = ConfigDict(populate_by_name=True)


class ChartResult(BaseModel):
    chart_id: str = Field(alias="chartId")
    chart_type: str = Field(alias="chartType")
    title: str
    profiles: list[BirthProfile]
    calculation: CalculationMetadata
    placements: list[Placement]
    houses: list[HouseCusp]
    aspects: list[Aspect]
    related_charts: dict[str, object] | None = Field(default=None, alias="relatedCharts")

    model_config = ConfigDict(populate_by_name=True)

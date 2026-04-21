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
    house_system: Literal["placidus"] = Field(default="placidus", alias="houseSystem")
    zodiac: Literal["tropical"] = "tropical"
    aspect_set: Literal["major"] = Field(default="major", alias="aspectSet")
    orb_profile: Literal["default"] = Field(default="default", alias="orbProfile")

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


class TransitChartRequest(BaseChartRequest):
    chart_type: Literal["transit"] = Field(default="transit", alias="chartType")
    transit_date: str = Field(alias="transitDate")
    transit_time: str = Field(alias="transitTime")


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
    type: Literal["conjunction", "sextile", "square", "trine", "opposition"]
    angle: float
    orb: float
    applying: bool | None = None
    weight: float | None = None

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

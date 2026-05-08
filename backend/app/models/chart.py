from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

ELEMENT_BY_SIGN = {
    "Aries": "fire",
    "Leo": "fire",
    "Sagittarius": "fire",
    "Taurus": "earth",
    "Virgo": "earth",
    "Capricorn": "earth",
    "Gemini": "air",
    "Libra": "air",
    "Aquarius": "air",
    "Cancer": "water",
    "Scorpio": "water",
    "Pisces": "water",
}

MODALITY_BY_SIGN = {
    "Aries": "cardinal",
    "Cancer": "cardinal",
    "Libra": "cardinal",
    "Capricorn": "cardinal",
    "Taurus": "fixed",
    "Leo": "fixed",
    "Scorpio": "fixed",
    "Aquarius": "fixed",
    "Gemini": "mutable",
    "Virgo": "mutable",
    "Sagittarius": "mutable",
    "Pisces": "mutable",
}

POLARITY_BY_SIGN = {
    "Aries": "yang",
    "Gemini": "yang",
    "Leo": "yang",
    "Libra": "yang",
    "Sagittarius": "yang",
    "Aquarius": "yang",
    "Taurus": "yin",
    "Cancer": "yin",
    "Virgo": "yin",
    "Scorpio": "yin",
    "Capricorn": "yin",
    "Pisces": "yin",
}

STATISTICAL_BODIES = {
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
    "Ascendant",
    "Midheaven",
}


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


class ProgressionChartRequest(BaseChartRequest):
    chart_type: Literal["progression"] = Field(default="progression", alias="chartType")
    progression_date: str = Field(alias="progressionDate")
    progression_time: str = Field(alias="progressionTime")


class SolarArcChartRequest(BaseChartRequest):
    chart_type: Literal["solarArc"] = Field(default="solarArc", alias="chartType")
    solar_arc_date: str = Field(alias="solarArcDate")
    solar_arc_time: str = Field(alias="solarArcTime")


class TertiaryProgressionChartRequest(BaseChartRequest):
    chart_type: Literal["tertiaryProgression"] = Field(default="tertiaryProgression", alias="chartType")
    tertiary_date: str = Field(alias="tertiaryDate")
    tertiary_time: str = Field(alias="tertiaryTime")


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


class LunarReturnChartRequest(BaseChartRequest):
    chart_type: Literal["lunarReturn"] = Field(default="lunarReturn", alias="chartType")
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


class ChartStatistics(BaseModel):
    element_counts: dict[str, int] = Field(alias="elementCounts")
    modality_counts: dict[str, int] = Field(alias="modalityCounts")
    polarity_counts: dict[str, int] = Field(alias="polarityCounts")
    hemisphere_counts: dict[str, int] = Field(alias="hemisphereCounts")
    total_bodies: int = Field(alias="totalBodies")

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
    statistics: ChartStatistics | None = None
    related_charts: dict[str, object] | None = Field(default=None, alias="relatedCharts")

    model_config = ConfigDict(populate_by_name=True)

    @model_validator(mode="after")
    def populate_statistics(self) -> "ChartResult":
        if self.statistics is None:
            self.statistics = build_chart_statistics(self.placements)
        return self


def build_chart_statistics(placements: list[Placement]) -> ChartStatistics:
    relevant_placements = [placement for placement in placements if placement.body in STATISTICAL_BODIES]
    element_counts = {key: 0 for key in ("fire", "earth", "air", "water")}
    modality_counts = {key: 0 for key in ("cardinal", "fixed", "mutable")}
    polarity_counts = {key: 0 for key in ("yang", "yin")}
    hemisphere_counts = {key: 0 for key in ("northern", "southern", "eastern", "western")}

    for placement in relevant_placements:
        element = ELEMENT_BY_SIGN.get(placement.sign)
        modality = MODALITY_BY_SIGN.get(placement.sign)
        polarity = POLARITY_BY_SIGN.get(placement.sign)

        if element:
            element_counts[element] += 1

        if modality:
            modality_counts[modality] += 1

        if polarity:
            polarity_counts[polarity] += 1

        if placement.house is not None:
            if 1 <= placement.house <= 6:
                hemisphere_counts["northern"] += 1
            else:
                hemisphere_counts["southern"] += 1

            if placement.house in {10, 11, 12, 1, 2, 3}:
                hemisphere_counts["eastern"] += 1
            else:
                hemisphere_counts["western"] += 1

    return ChartStatistics(
        elementCounts=element_counts,
        modalityCounts=modality_counts,
        polarityCounts=polarity_counts,
        hemisphereCounts=hemisphere_counts,
        totalBodies=len(relevant_placements),
    )

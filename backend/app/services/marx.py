from app.models.chart import ChartResult, ChartSettings, MarxChartRequest
from app.services.chart_generators import ChartGenerationContext, DualSubjectFusionGenerator
from app.services.composite import build_fused_chart_id, build_midpoint_profile
from app.services.ephemeris import EphemerisService


class MarxGenerator(DualSubjectFusionGenerator):
    def build_fused_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        profile = build_midpoint_profile(primary_chart.profiles[0], secondary_chart.profiles[0], "Davison Chart")
        fused_chart = self.context.natal.calculate_from_profile(profile, settings)
        fused_chart.chart_id = build_fused_chart_id("davison-core", primary_chart.profiles[0], secondary_chart.profiles[0])
        fused_chart.chart_type = "davisonChart"
        fused_chart.title = "Davison Chart"
        return fused_chart

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        fused_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        primary_profile = primary_chart.profiles[0]
        secondary_profile = secondary_chart.profiles[0]
        primary_marx_chart = self.build_marx_chart(primary_profile, fused_chart, settings, "primary-marx-core")
        secondary_marx_chart = self.build_marx_chart(secondary_profile, fused_chart, settings, "secondary-marx-core")

        return ChartResult(
            chartId=build_fused_chart_id("marx", primary_profile, secondary_profile),
            chartType="marx",
            title=f"{primary_profile.name} × {secondary_profile.name} Marx Chart",
            profiles=[primary_profile, secondary_profile],
            calculation=self.build_calculation_metadata(),
            placements=[],
            houses=[],
            aspects=[],
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "davisonChart": fused_chart.model_dump(by_alias=True),
                "primaryMarxChart": primary_marx_chart.model_dump(by_alias=True),
                "secondaryMarxChart": secondary_marx_chart.model_dump(by_alias=True),
            },
        )

    def build_marx_chart(
        self,
        natal_profile,
        davison_chart: ChartResult,
        settings: ChartSettings,
        prefix: str,
    ) -> ChartResult:
        profile = build_midpoint_profile(natal_profile, davison_chart.profiles[0], f"{natal_profile.name} Marx Chart")
        marx_chart = self.context.natal.calculate_from_profile(profile, settings)
        marx_chart.chart_id = build_fused_chart_id(prefix, natal_profile, davison_chart.profiles[0])
        marx_chart.chart_type = "marxChart"
        marx_chart.title = f"{natal_profile.name} Marx Chart"
        return marx_chart


class MarxChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = MarxGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: MarxChartRequest) -> ChartResult:
        return self.generator.generate(request.primary, request.secondary, request.settings)

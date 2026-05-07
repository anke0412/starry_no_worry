from app.models.chart import ChartResult, ChartSettings, DavisonChartRequest
from app.services.chart_generators import ChartGenerationContext, DualSubjectFusionGenerator
from app.services.composite import build_fused_chart_id, build_midpoint_profile
from app.services.ephemeris import EphemerisService


class DavisonGenerator(DualSubjectFusionGenerator):
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
        _ = settings
        primary_profile = primary_chart.profiles[0]
        secondary_profile = secondary_chart.profiles[0]
        return ChartResult(
            chartId=build_fused_chart_id("davison", primary_profile, secondary_profile),
            chartType="davison",
            title=f"{primary_profile.name} × {secondary_profile.name} Davison Chart",
            profiles=[primary_profile, secondary_profile],
            calculation=self.build_calculation_metadata(),
            placements=fused_chart.placements,
            houses=fused_chart.houses,
            aspects=fused_chart.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "davisonChart": fused_chart.model_dump(by_alias=True),
            },
        )


class DavisonChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = DavisonGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: DavisonChartRequest) -> ChartResult:
        return self.generator.generate(request.primary, request.secondary, request.settings)

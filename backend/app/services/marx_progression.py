import re

from app.models.chart import (
    BirthProfile,
    ChartResult,
    ChartSettings,
    MarxProgressionChartRequest,
    MarxTertiaryProgressionChartRequest,
)
from app.services.chart_generators import ChartGenerationContext, DualSubjectFusionGenerator
from app.services.composite import build_fused_chart_id
from app.services.ephemeris import EphemerisService
from app.services.marx import MarxGenerator
from app.services.progression import ProgressionTargetContext, build_progressed_profile
from app.services.tertiary_progression import TertiaryProgressionTargetContext, build_tertiary_progressed_profile


class MarxDerivedGenerator(DualSubjectFusionGenerator):
    result_chart_type = "marxDerived"
    result_title_suffix = "Derived"
    primary_chart_key = "primaryDerivedMarxChart"
    secondary_chart_key = "secondaryDerivedMarxChart"
    primary_overlay_key = "primaryDerivedMarxOverlay"
    secondary_overlay_key = "secondaryDerivedMarxOverlay"
    derived_chart_title_suffix = "Derived Marx Chart"
    derived_chart_type = "derivedChart"
    primary_overlay_id = "primary-derived-in-marx"
    secondary_overlay_id = "secondary-derived-in-marx"

    def build_fused_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        return MarxGenerator(self.context).build_fused_chart(primary_chart, secondary_chart, settings)

    def build_derived_profile(
        self,
        base_profile: BirthProfile,
        target_context: ProgressionTargetContext | TertiaryProgressionTargetContext,
    ) -> BirthProfile:
        raise NotImplementedError

    def build_target_suffix(
        self,
        target_context: ProgressionTargetContext | TertiaryProgressionTargetContext,
    ) -> str:
        raise NotImplementedError

    def build_derived_chart(
        self,
        base_chart: ChartResult,
        settings: ChartSettings,
        target_context: ProgressionTargetContext | TertiaryProgressionTargetContext,
        prefix: str,
    ) -> ChartResult:
        profile = self.build_derived_profile(base_chart.profiles[0], target_context)
        derived_chart = self.context.natal.calculate_from_profile(profile, settings)
        derived_chart.chart_id = build_marx_target_id(prefix, base_chart.profiles[0], self.build_target_suffix(target_context))
        derived_chart.chart_type = self.derived_chart_type
        derived_chart.title = f"{base_chart.profiles[0].name} {self.derived_chart_title_suffix}"
        return derived_chart

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        fused_chart: ChartResult,
        settings: ChartSettings,
        target_context: ProgressionTargetContext | TertiaryProgressionTargetContext,
    ) -> ChartResult:
        marx_generator = MarxGenerator(self.context)
        primary_profile = primary_chart.profiles[0]
        secondary_profile = secondary_chart.profiles[0]
        primary_marx_chart = marx_generator.build_marx_chart(primary_profile, fused_chart, settings, "primary-marx-core")
        secondary_marx_chart = marx_generator.build_marx_chart(secondary_profile, fused_chart, settings, "secondary-marx-core")
        primary_derived_chart = self.build_derived_chart(primary_marx_chart, settings, target_context, "primary-marx-derived")
        secondary_derived_chart = self.build_derived_chart(secondary_marx_chart, settings, target_context, "secondary-marx-derived")
        primary_overlay = self.context.overlay.build(
            overlay_id=self.primary_overlay_id,
            label=f"{primary_derived_chart.title} in {primary_marx_chart.profiles[0].name} houses",
            reference_chart=primary_marx_chart,
            overlay_chart=primary_derived_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        secondary_overlay = self.context.overlay.build(
            overlay_id=self.secondary_overlay_id,
            label=f"{secondary_derived_chart.title} in {secondary_marx_chart.profiles[0].name} houses",
            reference_chart=secondary_marx_chart,
            overlay_chart=secondary_derived_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )

        return ChartResult(
            chartId=build_fused_chart_id(
                f"{self.result_chart_type}-{self.build_target_suffix(target_context)}",
                primary_profile,
                secondary_profile,
            ),
            chartType=self.result_chart_type,
            title=f"{primary_profile.name} × {secondary_profile.name} Marx {self.result_title_suffix} Chart",
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
                self.primary_chart_key: primary_derived_chart.model_dump(by_alias=True),
                self.secondary_chart_key: secondary_derived_chart.model_dump(by_alias=True),
                self.primary_overlay_key: primary_overlay.model_dump(by_alias=True),
                self.secondary_overlay_key: secondary_overlay.model_dump(by_alias=True),
            },
        )

    def generate(
        self,
        primary_profile: BirthProfile,
        secondary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: ProgressionTargetContext | TertiaryProgressionTargetContext,
    ) -> ChartResult:
        primary_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        secondary_chart = self.context.natal.calculate_from_profile(secondary_profile, settings)
        fused_chart = self.build_fused_chart(primary_chart, secondary_chart, settings)
        return self.build_chart_result(
            primary_chart=primary_chart,
            secondary_chart=secondary_chart,
            fused_chart=fused_chart,
            settings=settings,
            target_context=target_context,
        )


class MarxProgressionGenerator(MarxDerivedGenerator):
    result_chart_type = "marxProgression"
    result_title_suffix = "Progression"
    primary_chart_key = "primaryProgressedMarxChart"
    secondary_chart_key = "secondaryProgressedMarxChart"
    primary_overlay_key = "primaryProgressedMarxOverlay"
    secondary_overlay_key = "secondaryProgressedMarxOverlay"
    derived_chart_title_suffix = "Progressed"
    derived_chart_type = "progressedChart"
    primary_overlay_id = "primary-progressed-in-marx"
    secondary_overlay_id = "secondary-progressed-in-marx"

    def build_derived_profile(self, base_profile: BirthProfile, target_context: ProgressionTargetContext) -> BirthProfile:
        return build_progressed_profile(base_profile, target_context)

    def build_target_suffix(self, target_context: ProgressionTargetContext) -> str:
        return f"{target_context['progression_date']}-{target_context['progression_time']}"


class MarxTertiaryProgressionGenerator(MarxDerivedGenerator):
    result_chart_type = "marxTertiaryProgression"
    result_title_suffix = "Tertiary Progression"
    primary_chart_key = "primaryTertiaryProgressedMarxChart"
    secondary_chart_key = "secondaryTertiaryProgressedMarxChart"
    primary_overlay_key = "primaryTertiaryProgressedMarxOverlay"
    secondary_overlay_key = "secondaryTertiaryProgressedMarxOverlay"
    derived_chart_title_suffix = "Tertiary Progressed"
    derived_chart_type = "tertiaryProgressedChart"
    primary_overlay_id = "primary-tertiary-progressed-in-marx"
    secondary_overlay_id = "secondary-tertiary-progressed-in-marx"

    def build_derived_profile(self, base_profile: BirthProfile, target_context: TertiaryProgressionTargetContext) -> BirthProfile:
        return build_tertiary_progressed_profile(base_profile, target_context, self.context.ephemeris)

    def build_target_suffix(self, target_context: TertiaryProgressionTargetContext) -> str:
        return f"{target_context['tertiary_date']}-{target_context['tertiary_time']}"


class MarxProgressionChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = MarxProgressionGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: MarxProgressionChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.secondary,
            request.settings,
            ProgressionTargetContext(
                progression_date=request.progression_date,
                progression_time=request.progression_time,
            ),
        )


class MarxTertiaryProgressionChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = MarxTertiaryProgressionGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: MarxTertiaryProgressionChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.secondary,
            request.settings,
            TertiaryProgressionTargetContext(
                tertiary_date=request.tertiary_date,
                tertiary_time=request.tertiary_time,
            ),
        )


def build_marx_target_id(prefix: str, profile: BirthProfile, target_suffix: str) -> str:
    raw = f"{prefix}-{profile.name}-{profile.date}-{profile.time}-{target_suffix}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

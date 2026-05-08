import re
from dataclasses import dataclass

from app.models.chart import (
    BirthProfile,
    ChartResult,
    ChartSettings,
    CompositeProgressionChartRequest,
    CompositeTertiaryProgressionChartRequest,
    DavisonProgressionChartRequest,
    DavisonTertiaryProgressionChartRequest,
)
from app.services.chart_generators import BaseChartGenerator, ChartGenerationContext
from app.services.composite import CompositeGenerator
from app.services.davison import DavisonGenerator
from app.services.ephemeris import EphemerisService
from app.services.progression import ProgressionTargetContext, build_progressed_profile
from app.services.synastry import planetary_placements
from app.services.tertiary_progression import TertiaryProgressionTargetContext, build_tertiary_progressed_profile


@dataclass(frozen=True)
class RelationshipBaseSpec:
    chart_label: str
    base_chart_key: str
    base_chart_type: str
    generator_class: type[CompositeGenerator] | type[DavisonGenerator]


COMPOSITE_BASE_SPEC = RelationshipBaseSpec(
    chart_label="Composite",
    base_chart_key="compositeChart",
    base_chart_type="compositeChart",
    generator_class=CompositeGenerator,
)

DAVISON_BASE_SPEC = RelationshipBaseSpec(
    chart_label="Davison",
    base_chart_key="davisonChart",
    base_chart_type="davisonChart",
    generator_class=DavisonGenerator,
)


class RelationshipDerivedGenerator(BaseChartGenerator):
    overlay_id = "derived-in-relationship"
    result_chart_type = "relationshipDerived"
    result_id_prefix = "relationship-derived"
    derived_chart_type = "relationshipDerivedChart"
    derived_chart_key = "relationshipDerivedChart"
    derived_chart_title = "Relationship Derived"
    overlay_key = "relationshipDerivedOverlay"
    title_suffix = "Derived"

    def __init__(
        self,
        base_spec: RelationshipBaseSpec,
        context: ChartGenerationContext | None = None,
    ) -> None:
        super().__init__(context)
        self.base_spec = base_spec

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

    def build_base_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        generator = self.base_spec.generator_class(self.context)
        base_chart = generator.build_fused_chart(primary_chart, secondary_chart, settings)
        base_chart.chart_type = self.base_spec.base_chart_type
        return base_chart

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        secondary_profile: BirthProfile,
        base_chart: ChartResult,
        settings: ChartSettings,
        target_context: ProgressionTargetContext | TertiaryProgressionTargetContext,
    ) -> ChartResult:
        profile = self.build_derived_profile(base_chart.profiles[0], target_context)
        derived_chart = self.context.natal.calculate_from_profile(profile, settings)
        derived_chart.chart_id = build_relationship_target_id(
            self.result_id_prefix,
            primary_profile,
            secondary_profile,
            self.build_target_suffix(target_context),
        )
        derived_chart.chart_type = self.derived_chart_type
        derived_chart.title = f"{self.base_spec.chart_label} {self.derived_chart_title}"
        return derived_chart

    def generate(
        self,
        primary_profile: BirthProfile,
        secondary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: ProgressionTargetContext | TertiaryProgressionTargetContext,
    ) -> ChartResult:
        primary_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        secondary_chart = self.context.natal.calculate_from_profile(secondary_profile, settings)
        base_chart = self.build_base_chart(primary_chart, secondary_chart, settings)
        derived_chart = self.build_derived_chart(primary_profile, secondary_profile, base_chart, settings, target_context)
        overlay = self.context.overlay.build(
            overlay_id=self.overlay_id,
            label=f"{derived_chart.title} in {base_chart.profiles[0].name} houses",
            reference_chart=base_chart,
            overlay_chart=derived_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )

        return ChartResult(
            chartId=build_relationship_target_id(
                self.result_chart_type,
                primary_profile,
                secondary_profile,
                self.build_target_suffix(target_context),
            ),
            chartType=self.result_chart_type,
            title=f"{primary_profile.name} × {secondary_profile.name} {self.base_spec.chart_label} {self.title_suffix} Chart",
            profiles=[primary_profile, secondary_profile],
            calculation=self.build_calculation_metadata(),
            placements=[
                *planetary_placements(base_chart.placements),
                *planetary_placements(derived_chart.placements),
            ],
            houses=[],
            aspects=overlay.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                self.base_spec.base_chart_key: base_chart.model_dump(by_alias=True),
                self.derived_chart_key: derived_chart.model_dump(by_alias=True),
                self.overlay_key: overlay.model_dump(by_alias=True),
            },
        )


class CompositeProgressionGenerator(RelationshipDerivedGenerator):
    overlay_id = "progressed-in-composite"
    result_chart_type = "compositeProgression"
    result_id_prefix = "composite-progressed"
    derived_chart_type = "progressedChart"
    derived_chart_key = "progressedChart"
    derived_chart_title = "Progressed"
    overlay_key = "progressedOverlay"
    title_suffix = "Progression"

    def __init__(self, context: ChartGenerationContext | None = None) -> None:
        super().__init__(COMPOSITE_BASE_SPEC, context)

    def build_derived_profile(self, base_profile: BirthProfile, target_context: ProgressionTargetContext) -> BirthProfile:
        return build_progressed_profile(base_profile, target_context)

    def build_target_suffix(self, target_context: ProgressionTargetContext) -> str:
        return f"{target_context['progression_date']}-{target_context['progression_time']}"


class DavisonProgressionGenerator(RelationshipDerivedGenerator):
    overlay_id = "progressed-in-davison"
    result_chart_type = "davisonProgression"
    result_id_prefix = "davison-progressed"
    derived_chart_type = "progressedChart"
    derived_chart_key = "progressedChart"
    derived_chart_title = "Progressed"
    overlay_key = "progressedOverlay"
    title_suffix = "Progression"

    def __init__(self, context: ChartGenerationContext | None = None) -> None:
        super().__init__(DAVISON_BASE_SPEC, context)

    def build_derived_profile(self, base_profile: BirthProfile, target_context: ProgressionTargetContext) -> BirthProfile:
        return build_progressed_profile(base_profile, target_context)

    def build_target_suffix(self, target_context: ProgressionTargetContext) -> str:
        return f"{target_context['progression_date']}-{target_context['progression_time']}"


class CompositeTertiaryProgressionGenerator(RelationshipDerivedGenerator):
    overlay_id = "tertiary-progressed-in-composite"
    result_chart_type = "compositeTertiaryProgression"
    result_id_prefix = "composite-tertiary-progressed"
    derived_chart_type = "tertiaryProgressedChart"
    derived_chart_key = "tertiaryProgressedChart"
    derived_chart_title = "Tertiary Progressed"
    overlay_key = "tertiaryProgressedOverlay"
    title_suffix = "Tertiary Progression"

    def __init__(self, context: ChartGenerationContext | None = None) -> None:
        super().__init__(COMPOSITE_BASE_SPEC, context)

    def build_derived_profile(self, base_profile: BirthProfile, target_context: TertiaryProgressionTargetContext) -> BirthProfile:
        return build_tertiary_progressed_profile(base_profile, target_context, self.context.ephemeris)

    def build_target_suffix(self, target_context: TertiaryProgressionTargetContext) -> str:
        return f"{target_context['tertiary_date']}-{target_context['tertiary_time']}"


class DavisonTertiaryProgressionGenerator(RelationshipDerivedGenerator):
    overlay_id = "tertiary-progressed-in-davison"
    result_chart_type = "davisonTertiaryProgression"
    result_id_prefix = "davison-tertiary-progressed"
    derived_chart_type = "tertiaryProgressedChart"
    derived_chart_key = "tertiaryProgressedChart"
    derived_chart_title = "Tertiary Progressed"
    overlay_key = "tertiaryProgressedOverlay"
    title_suffix = "Tertiary Progression"

    def __init__(self, context: ChartGenerationContext | None = None) -> None:
        super().__init__(DAVISON_BASE_SPEC, context)

    def build_derived_profile(self, base_profile: BirthProfile, target_context: TertiaryProgressionTargetContext) -> BirthProfile:
        return build_tertiary_progressed_profile(base_profile, target_context, self.context.ephemeris)

    def build_target_suffix(self, target_context: TertiaryProgressionTargetContext) -> str:
        return f"{target_context['tertiary_date']}-{target_context['tertiary_time']}"


class CompositeProgressionChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = CompositeProgressionGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: CompositeProgressionChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.secondary,
            request.settings,
            ProgressionTargetContext(
                progression_date=request.progression_date,
                progression_time=request.progression_time,
            ),
        )


class DavisonProgressionChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = DavisonProgressionGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: DavisonProgressionChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.secondary,
            request.settings,
            ProgressionTargetContext(
                progression_date=request.progression_date,
                progression_time=request.progression_time,
            ),
        )


class CompositeTertiaryProgressionChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = CompositeTertiaryProgressionGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: CompositeTertiaryProgressionChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.secondary,
            request.settings,
            TertiaryProgressionTargetContext(
                tertiary_date=request.tertiary_date,
                tertiary_time=request.tertiary_time,
            ),
        )


class DavisonTertiaryProgressionChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = DavisonTertiaryProgressionGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: DavisonTertiaryProgressionChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.secondary,
            request.settings,
            TertiaryProgressionTargetContext(
                tertiary_date=request.tertiary_date,
                tertiary_time=request.tertiary_time,
            ),
        )


def build_relationship_target_id(
    prefix: str,
    primary: BirthProfile,
    secondary: BirthProfile,
    target_suffix: str,
) -> str:
    pair_parts = sorted(
        [
            f"{primary.name}-{primary.date}-{primary.time}",
            f"{secondary.name}-{secondary.date}-{secondary.time}",
        ]
    )
    raw = f"{prefix}-{'-'.join(pair_parts)}-{target_suffix}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

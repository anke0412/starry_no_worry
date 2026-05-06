from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Generic, TypeAlias, TypeVar

from app.models.chart import BirthProfile, CalculationMetadata, ChartOverlay, ChartResult, ChartSettings
from app.services.ephemeris import EphemerisService
from app.services.natal import NatalChartService
from app.services.overlay import ChartOverlayService

DerivedTargetContext: TypeAlias = Mapping[str, object]
DerivedTargetContextT = TypeVar("DerivedTargetContextT", bound=DerivedTargetContext)


@dataclass(frozen=True)
class ChartGenerationContext:
    ephemeris: EphemerisService
    natal: NatalChartService
    overlay: ChartOverlayService

    @classmethod
    def create(cls, ephemeris: EphemerisService | None = None) -> "ChartGenerationContext":
        shared_ephemeris = ephemeris or EphemerisService()
        return cls(
            ephemeris=shared_ephemeris,
            natal=NatalChartService(shared_ephemeris),
            overlay=ChartOverlayService(),
        )


class BaseChartGenerator:
    def __init__(self, context: ChartGenerationContext | None = None) -> None:
        self.context = context or ChartGenerationContext.create()

    def build_calculation_metadata(self) -> CalculationMetadata:
        return CalculationMetadata(
            engine=self.context.ephemeris.engine_name,
            engineVersion=self.context.ephemeris.engine_version,
            calculatedAt=datetime.now(UTC).isoformat(),
        )


class SingleSubjectDerivedGenerator(BaseChartGenerator, Generic[DerivedTargetContextT]):
    overlay_id = "derived-in-primary"

    def build_overlay_label(self, primary_chart: ChartResult, derived_chart: ChartResult) -> str:
        return f"{derived_chart.title} in {primary_chart.profiles[0].name} houses"

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: DerivedTargetContextT,
    ) -> ChartResult:
        raise NotImplementedError

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        derived_chart: ChartResult,
        overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: DerivedTargetContextT,
    ) -> ChartResult:
        raise NotImplementedError

    def generate(
        self,
        primary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: DerivedTargetContextT,
    ) -> ChartResult:
        primary_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        derived_chart = self.build_derived_chart(primary_profile, settings, target_context)
        overlay = self.context.overlay.build(
            overlay_id=self.overlay_id,
            label=self.build_overlay_label(primary_chart, derived_chart),
            reference_chart=primary_chart,
            overlay_chart=derived_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        return self.build_chart_result(
            primary_chart=primary_chart,
            derived_chart=derived_chart,
            overlay=overlay,
            settings=settings,
            target_context=target_context,
        )


class DualSubjectComparisonGenerator(BaseChartGenerator):
    primary_overlay_id = "secondary-in-primary"
    secondary_overlay_id = "primary-in-secondary"

    def build_primary_overlay_label(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
    ) -> str:
        return f"{secondary_chart.profiles[0].name} in {primary_chart.profiles[0].name} houses"

    def build_secondary_overlay_label(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
    ) -> str:
        return f"{primary_chart.profiles[0].name} in {secondary_chart.profiles[0].name} houses"

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        primary_overlay: ChartOverlay,
        secondary_overlay: ChartOverlay,
        settings: ChartSettings,
    ) -> ChartResult:
        raise NotImplementedError

    def generate(
        self,
        primary_profile: BirthProfile,
        secondary_profile: BirthProfile,
        settings: ChartSettings,
    ) -> ChartResult:
        primary_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        secondary_chart = self.context.natal.calculate_from_profile(secondary_profile, settings)
        primary_overlay = self.context.overlay.build(
            overlay_id=self.primary_overlay_id,
            label=self.build_primary_overlay_label(primary_chart, secondary_chart),
            reference_chart=primary_chart,
            overlay_chart=secondary_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        secondary_overlay = self.context.overlay.build(
            overlay_id=self.secondary_overlay_id,
            label=self.build_secondary_overlay_label(primary_chart, secondary_chart),
            reference_chart=secondary_chart,
            overlay_chart=primary_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        return self.build_chart_result(
            primary_chart=primary_chart,
            secondary_chart=secondary_chart,
            primary_overlay=primary_overlay,
            secondary_overlay=secondary_overlay,
            settings=settings,
        )


class DualSubjectDerivedGenerator(BaseChartGenerator, Generic[DerivedTargetContextT]):
    primary_overlay_id = "derived-in-primary"
    secondary_overlay_id = "derived-in-secondary"

    def build_primary_overlay_label(
        self,
        primary_chart: ChartResult,
        _secondary_chart: ChartResult,
        derived_chart: ChartResult,
    ) -> str:
        return f"{derived_chart.profiles[0].name} in {primary_chart.profiles[0].name} houses"

    def build_secondary_overlay_label(
        self,
        _primary_chart: ChartResult,
        secondary_chart: ChartResult,
        derived_chart: ChartResult,
    ) -> str:
        return f"{derived_chart.profiles[0].name} in {secondary_chart.profiles[0].name} houses"

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        secondary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: DerivedTargetContextT,
    ) -> ChartResult:
        raise NotImplementedError

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        derived_chart: ChartResult,
        primary_overlay: ChartOverlay,
        secondary_overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: DerivedTargetContextT,
    ) -> ChartResult:
        raise NotImplementedError

    def generate(
        self,
        primary_profile: BirthProfile,
        secondary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: DerivedTargetContextT,
    ) -> ChartResult:
        primary_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        secondary_chart = self.context.natal.calculate_from_profile(secondary_profile, settings)
        derived_chart = self.build_derived_chart(primary_profile, secondary_profile, settings, target_context)
        primary_overlay = self.context.overlay.build(
            overlay_id=self.primary_overlay_id,
            label=self.build_primary_overlay_label(primary_chart, secondary_chart, derived_chart),
            reference_chart=primary_chart,
            overlay_chart=derived_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        secondary_overlay = self.context.overlay.build(
            overlay_id=self.secondary_overlay_id,
            label=self.build_secondary_overlay_label(primary_chart, secondary_chart, derived_chart),
            reference_chart=secondary_chart,
            overlay_chart=derived_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        return self.build_chart_result(
            primary_chart=primary_chart,
            secondary_chart=secondary_chart,
            derived_chart=derived_chart,
            primary_overlay=primary_overlay,
            secondary_overlay=secondary_overlay,
            settings=settings,
            target_context=target_context,
        )


class DualSubjectFusionGenerator(BaseChartGenerator):
    def build_fused_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        raise NotImplementedError

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        fused_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        raise NotImplementedError

    def generate(
        self,
        primary_profile: BirthProfile,
        secondary_profile: BirthProfile,
        settings: ChartSettings,
    ) -> ChartResult:
        primary_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        secondary_chart = self.context.natal.calculate_from_profile(secondary_profile, settings)
        fused_chart = self.build_fused_chart(primary_chart, secondary_chart, settings)
        return self.build_chart_result(
            primary_chart=primary_chart,
            secondary_chart=secondary_chart,
            fused_chart=fused_chart,
            settings=settings,
        )

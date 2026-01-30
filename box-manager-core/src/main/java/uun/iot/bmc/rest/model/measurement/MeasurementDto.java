package uun.iot.bmc.rest.model.measurement;

import jakarta.validation.constraints.NotNull;

public record MeasurementDto(
    @NotNull
    Double temperature,
    @NotNull
    Double humidity,
    @NotNull
    Long deviceId,
    Long timestamp
) {
}

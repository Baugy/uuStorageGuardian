package uun.iot.bmc.rest.model.box;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;

public record BoxCreateDto(
        @NotBlank
        @Length(min = 3, max = 32)
        String name,
        @Length(min = 5, max = 4000)
        String description,
        @NotNull
        Long warehouseId,
        String renterId,
        Long deviceId,
        Double lowerHumidityLimit,
        Double upperHumidityLimit,
        Double lowerTemperatureLimit,
        Double upperTemperatureLimit
) {
}

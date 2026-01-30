package uun.iot.bmc.rest.model.box;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record BoxUpdateDto(
        @NotBlank
        @Length(min = 3, max = 32)
        String name,
        @Length(min = 5, max = 4000)
        String description,
        String renterId,
        Long deviceId,
        Double lowerTemperatureLimit,
        Double upperTemperatureLimit,
        Double lowerHumidityLimit,
        Double upperHumidityLimit
) {
}

package uun.iot.bmc.rest.model.device;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record DeviceUpdateDto (
        @NotBlank
        @Length(min = 3, max = 32)
        String name,
        @Length(max = 4000)
        String description
) {
}

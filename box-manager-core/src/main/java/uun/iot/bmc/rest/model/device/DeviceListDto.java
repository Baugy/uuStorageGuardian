package uun.iot.bmc.rest.model.device;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record DeviceListDto(
        Long id,
        String name,
        Long boxId,
        LocalDateTime lastMeasurementDate
) {

}

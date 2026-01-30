package uun.iot.bmc.rest.model.box;

import uun.iot.bmc.rest.model.warehouse.WarehouseDto;
import uun.iot.bmc.service.model.box.BoxStatus;

import java.time.LocalDateTime;

public record BoxDto(
    Long id,
    String name,
    String description,
    WarehouseDto warehouse,
    String renterId,
    Long deviceId,
    Double temperature,
    Double humidity,
    BoxStatus status,
    LocalDateTime lastMeasurementDate,
    Double lowerHumidityLimit,
    Double upperHumidityLimit,
    Double lowerTemperatureLimit,
    Double upperTemperatureLimit
) {

}

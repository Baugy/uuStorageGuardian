package uun.iot.bmc.rest.model.box;

import uun.iot.bmc.rest.model.warehouse.WarehouseDto;

import java.time.LocalDateTime;

public record BoxListDto(
        Long id,
        String name,
        WarehouseDto warehouse,
        Double temperature,
        Double humidity,
        String status,
        LocalDateTime lastMeasurementDate
) {
}

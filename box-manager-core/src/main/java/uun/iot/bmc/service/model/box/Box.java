package uun.iot.bmc.service.model.box;

import lombok.*;
import uun.iot.bmc.service.model.warehouse.Warehouse;

import java.time.LocalDateTime;

@Data
@With
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Box {

    private Long id;
    private String name;
    private String description;
    private String renterId;
    private Long deviceId;
    private Warehouse warehouse;
    private Double temperature;
    private Double humidity;
    private BoxStatus status;
    private LocalDateTime lastMeasurementDate;
    private Double lowerHumidityLimit;
    private Double upperHumidityLimit;
    private Double lowerTemperatureLimit;
    private Double upperTemperatureLimit;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private Long version;

}

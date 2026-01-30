package uun.iot.bmc.service.model.measurement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.With;
import uun.iot.bmc.service.model.box.BoxStatus;

import java.sql.Timestamp;

@Data
@With
@AllArgsConstructor
@NoArgsConstructor
public class MeasurementPoint {

    private Long boxId;
    private String renterId;
    private Long deviceId;
    private Double temperature;
    private Double humidity;
    private BoxStatus status;
    private Timestamp timestamp;

}

package uun.iot.bmc.service.model.box;

import lombok.*;

import java.time.LocalDateTime;

@Data
@With
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class BoxHistory {

    Double temperature;
    Double humidity;
    BoxStatus status;
    LocalDateTime measurementDate;

}

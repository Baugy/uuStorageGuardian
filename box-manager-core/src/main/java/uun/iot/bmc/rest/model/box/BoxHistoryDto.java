package uun.iot.bmc.rest.model.box;


import java.time.LocalDateTime;

public record BoxHistoryDto(
        Double temperature,
        Double humidity,
        String status,
        LocalDateTime measurementDate
) {
}

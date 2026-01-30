package uun.iot.bmc.service.model.box;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BoxStatus {

    OK("OK"),
    WARNING("WARNING"),
    CRITICAL("CRITICAL");

    private final String value;

}

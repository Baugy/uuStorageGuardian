package uun.iot.bmc.service.model.warehouse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.With;

@Data
@With
@AllArgsConstructor
@NoArgsConstructor
public class Warehouse {

    private String id;
    private String name;
    private String description;
    private String location;

}

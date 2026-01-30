package uun.iot.bmc.database.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.ToString;

@Entity
@Table(name = "c_warehouse")
@ToString
public class WarehouseEntity extends AEntity {

    @NotNull
    private String name;
    private String description;
    @NotNull
    private String location;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}

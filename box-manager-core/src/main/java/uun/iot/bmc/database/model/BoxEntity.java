package uun.iot.bmc.database.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.ToString;


@Entity
@Table(name = "t_box")
@ToString
public class BoxEntity extends AOptimisticLockableEntity  {

    @NotNull
    private String name;
    private String description;
    @Column(name = "renter_id")
    private String renterId;
    @OneToOne
    @JoinColumn(name = "device_id")
    private DeviceEntity device;
    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private WarehouseEntity warehouse;
    @Column(name = "lower_humidity_limit")
    private Double lowerHumidityLimit;
    @Column(name = "upper_humidity_limit")
    private Double upperHumidityLimit;
    @Column(name = "lower_temperature_limit")
    private Double lowerTemperatureLimit;
    @Column(name = "upper_temperature_limit")
    private Double upperTemperatureLimit;

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

    public String getRenterId() {
        return renterId;
    }

    public void setRenterId(String renterId) {
        this.renterId = renterId;
    }

    public DeviceEntity getDevice() {
        return device;
    }

    public void setDevice(DeviceEntity device) {
        this.device = device;
    }

    public WarehouseEntity getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(WarehouseEntity warehouse) {
        this.warehouse = warehouse;
    }

    public Double getLowerHumidityLimit() {
        return lowerHumidityLimit;
    }

    public void setLowerHumidityLimit(Double lowerHumidityLimit) {
        this.lowerHumidityLimit = lowerHumidityLimit;
    }

    public Double getUpperHumidityLimit() {
        return upperHumidityLimit;
    }

    public void setUpperHumidityLimit(Double upperHumidityLimit) {
        this.upperHumidityLimit = upperHumidityLimit;
    }

    public Double getLowerTemperatureLimit() {
        return lowerTemperatureLimit;
    }

    public void setLowerTemperatureLimit(Double lowerTemperatureLimit) {
        this.lowerTemperatureLimit = lowerTemperatureLimit;
    }

    public Double getUpperTemperatureLimit() {
        return upperTemperatureLimit;
    }

    public void setUpperTemperatureLimit(Double upperTemperatureLimit) {
        this.upperTemperatureLimit = upperTemperatureLimit;
    }
}

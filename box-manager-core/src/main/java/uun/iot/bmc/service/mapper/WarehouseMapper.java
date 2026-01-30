package uun.iot.bmc.service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import uun.iot.bmc.database.model.WarehouseEntity;
import uun.iot.bmc.service.model.warehouse.Warehouse;

@Mapper(config = ServiceMapperConfiguration.class, unmappedTargetPolicy =  ReportingPolicy.IGNORE)
public interface WarehouseMapper {

    Warehouse toModel(WarehouseEntity warehouseEntity);

    WarehouseEntity toEntity(Warehouse warehouse);

}

package uun.iot.bmc.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import uun.iot.bmc.rest.model.warehouse.WarehouseDto;
import uun.iot.bmc.service.model.warehouse.Warehouse;

@Mapper(config = RestMapperConfiguration.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface WarehouseRestMapper {

    WarehouseDto toRestModel(Warehouse warehouse);

}

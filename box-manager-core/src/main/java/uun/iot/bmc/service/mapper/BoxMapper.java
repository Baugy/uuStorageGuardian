package uun.iot.bmc.service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import uun.iot.bmc.database.model.BoxEntity;
import uun.iot.bmc.service.model.box.Box;

import java.util.List;

@Mapper(config = ServiceMapperConfiguration.class,
        unmappedTargetPolicy =  ReportingPolicy.IGNORE,
        uses = {DeviceMapper.class, WarehouseMapper.class}
)
public interface BoxMapper {

    @Mapping(target = "deviceId", source = "device.id")
    Box toModel(BoxEntity boxEntity);

    BoxEntity toEntity(Box box);

    List<Box> toModel(List<BoxEntity> boxEntityList);

}

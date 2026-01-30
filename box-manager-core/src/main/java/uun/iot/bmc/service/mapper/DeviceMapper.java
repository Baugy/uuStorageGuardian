package uun.iot.bmc.service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import uun.iot.bmc.database.model.DeviceEntity;
import uun.iot.bmc.service.model.device.Device;

import java.util.List;

@Mapper(config = ServiceMapperConfiguration.class, unmappedTargetPolicy =  ReportingPolicy.IGNORE)
public interface DeviceMapper {

    Device toModel(DeviceEntity deviceEntity);

    DeviceEntity toEntity(Device device);

    List<Device> toModel(List<DeviceEntity> deviceEntityList);

}

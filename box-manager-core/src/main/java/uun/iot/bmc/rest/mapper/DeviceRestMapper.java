package uun.iot.bmc.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import uun.iot.bmc.rest.model.device.DeviceDto;
import uun.iot.bmc.rest.model.device.DeviceListDto;
import uun.iot.bmc.service.model.device.Device;

import java.util.List;

@Mapper(config = RestMapperConfiguration.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DeviceRestMapper {

    DeviceDto toRestModel(Device device);

    DeviceListDto toListRestModel(Device device);

    List<DeviceListDto> toRestModel(List<Device> devices);

}

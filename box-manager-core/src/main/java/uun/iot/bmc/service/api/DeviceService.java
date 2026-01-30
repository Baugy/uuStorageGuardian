package uun.iot.bmc.service.api;

import uun.iot.bmc.rest.model.device.DeviceUpdateDto;
import uun.iot.bmc.service.model.device.Device;

import java.util.List;

public interface DeviceService {

    Device createDevice(String name, String description);

    Device getDevice(Long id);

    List<Device> getDevices();

    Device updateDevice(Long id, DeviceUpdateDto deviceUpdate);

    void deleteDevice(Long id);

}

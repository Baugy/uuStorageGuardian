package uun.iot.bmc.rest.controller;

import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import uun.iot.bmc.rest.mapper.DeviceRestMapper;
import uun.iot.bmc.rest.model.device.DeviceDto;
import uun.iot.bmc.rest.model.device.DeviceListDto;
import uun.iot.bmc.rest.model.device.DeviceRegisterDto;
import uun.iot.bmc.rest.model.device.DeviceUpdateDto;
import uun.iot.bmc.service.api.DeviceService;

import java.util.List;

import static uun.iot.bmc.config.support.ApiPaths.DEVICE_API;

@RestController
@RequestMapping(value = DEVICE_API, produces = MediaType.APPLICATION_JSON_VALUE)
public class DeviceController {

    private final DeviceService deviceService;
    private final DeviceRestMapper deviceRestMapper;

    public DeviceController(DeviceService deviceService, DeviceRestMapper deviceRestMapper) {
        this.deviceService = deviceService;
        this.deviceRestMapper = deviceRestMapper;
    }

    @PostMapping
    public DeviceDto registerDevice(@Valid @RequestBody DeviceRegisterDto deviceRegister) {
        return deviceRestMapper.toRestModel(
                deviceService.createDevice(deviceRegister.name(), deviceRegister.description())
        );
    }

    @GetMapping("/{id}")
    public DeviceDto getDevice(@PathVariable Long id) {
        return deviceRestMapper.toRestModel(deviceService.getDevice(id));
    }

    @GetMapping
    public List<DeviceListDto> getDevices() {
        return deviceRestMapper.toRestModel(deviceService.getDevices());
    }

    @PatchMapping("/{id}")
    public DeviceDto updateDevice(@PathVariable Long id, @Valid @RequestBody DeviceUpdateDto deviceUpdate) {
        return deviceRestMapper.toRestModel(deviceService.updateDevice(id, deviceUpdate));
    }

    @DeleteMapping("/{id}")
    public void deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
    }

}

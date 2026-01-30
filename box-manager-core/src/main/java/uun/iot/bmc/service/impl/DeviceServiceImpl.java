package uun.iot.bmc.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uun.iot.bmc.database.model.DeviceEntity;
import uun.iot.bmc.database.repository.DeviceRepository;
import uun.iot.bmc.database.repository.MeasurementRepository;
import uun.iot.bmc.exception.EntityDoesNotExist;
import uun.iot.bmc.rest.model.device.DeviceUpdateDto;
import uun.iot.bmc.service.api.BoxService;
import uun.iot.bmc.service.api.DeviceService;
import uun.iot.bmc.service.mapper.DeviceMapper;
import uun.iot.bmc.service.model.box.Box;
import uun.iot.bmc.service.model.device.Device;
import uun.iot.bmc.service.model.measurement.MeasurementRecord;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class DeviceServiceImpl implements DeviceService {

    private final DeviceRepository deviceRepository;
    private final BoxService boxService;
    private final MeasurementRepository measurementRepository;
    private final DeviceMapper deviceMapper;

    public DeviceServiceImpl(DeviceRepository deviceRepository, BoxService boxService, MeasurementRepository measurementRepository, DeviceMapper deviceMapper) {
        this.deviceRepository = deviceRepository;
        this.boxService = boxService;
        this.measurementRepository = measurementRepository;
        this.deviceMapper = deviceMapper;
    }

    @Override
    public Device createDevice(String name, String description) {
        DeviceEntity deviceEntity = deviceMapper.toEntity(new Device()
                .withName(name)
                .withDescription(description));
        return deviceMapper.toModel(deviceRepository.save(deviceEntity));
    }

    @Override
    public Device getDevice(Long id) {
        Device device = deviceMapper.toModel(deviceRepository.findById(id).orElseThrow(() -> EntityDoesNotExist.notFound("Device", id)));
        try {
            MeasurementRecord lastMeasurement = measurementRepository.getLastDeviceMeasurement(id);
            return device.withLastMeasurementDate(Optional.ofNullable(lastMeasurement != null ? lastMeasurement.getMeasurementDate() : null).orElse(device.getLastMeasurementDate()));
        } catch (Exception e) {
            log.warn("Error getting measurement for device {}: {}", id, e.getMessage());
            // Return device without measurement data if InfluxDB query fails
            return device;
        }
    }

    @Override
    public List<Device> getDevices() {
        return deviceMapper.toModel(deviceRepository.findAll())
                .stream()
                .map(device -> {
                    Long boxId = null;
                    try {
                        boxId = boxService.getBoxByDevice(device.getId()).map(Box::getId).orElse(null);
                    } catch (Exception e) {
                        log.warn("Error getting box for device {}: {}", device.getId(), e.getMessage());
                        // Continue without box ID if query fails (e.g., multiple boxes with same device ID)
                    }
                    
                    try {
                        MeasurementRecord lastMeasurement = measurementRepository.getLastDeviceMeasurement(device.getId());
                        return device.withBoxId(boxId)
                                .withLastMeasurementDate(Optional.ofNullable(lastMeasurement != null ? lastMeasurement.getMeasurementDate() : null).orElse(device.getLastMeasurementDate()));
                    } catch (Exception e) {
                        log.warn("Error getting measurement for device {}: {}", device.getId(), e.getMessage());
                        // Return device without measurement data if InfluxDB query fails
                        return device.withBoxId(boxId);
                    }
                }).toList();
    }

    @Override
    public Device updateDevice(Long id, DeviceUpdateDto deviceUpdateDto) {
        Device device = getDevice(id);
        device = device.withName(Optional.ofNullable(deviceUpdateDto.name()).orElse(device.getName()))
                .withDescription(Optional.ofNullable(deviceUpdateDto.description()).orElse(device.getDescription()));
        return deviceMapper.toModel(deviceRepository.save(deviceMapper.toEntity(device)));
    }


    @Override
    public void deleteDevice(Long id) {
        deviceRepository.deleteById(id);
    }
}

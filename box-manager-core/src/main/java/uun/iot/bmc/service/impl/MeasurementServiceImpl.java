package uun.iot.bmc.service.impl;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uun.iot.bmc.database.repository.MeasurementRepository;
import uun.iot.bmc.exception.EntityNotAssigned;
import uun.iot.bmc.service.api.BoxService;
import uun.iot.bmc.service.api.DeviceService;
import uun.iot.bmc.service.api.MeasurementService;
import uun.iot.bmc.service.model.box.Box;
import uun.iot.bmc.service.model.box.BoxStatus;
import uun.iot.bmc.service.model.device.Device;
import uun.iot.bmc.service.model.measurement.MeasurementPoint;

import java.sql.Timestamp;


@Service
@Slf4j
public class MeasurementServiceImpl implements MeasurementService {

    private final MeasurementRepository measurementRepository;
    private final DeviceService deviceService;
    private final BoxService boxService;

    public MeasurementServiceImpl(MeasurementRepository measurementRepository, DeviceService deviceService, BoxService boxService) {
        this.measurementRepository = measurementRepository;
        this.deviceService = deviceService;
        this.boxService = boxService;
    }

    @Override
    @Transactional
    public void saveMeasurement(Double temperature, Double humidity, Long deviceId, Long timestamp) {
        Device device = deviceService.getDevice(deviceId);
        Box box = boxService.getBoxByDevice(deviceId).orElseThrow(() -> EntityNotAssigned.badRequest("Device", device.getId(), "Box"));

        measurementRepository.save(new MeasurementPoint(
                box.getId(),
                box.getRenterId(),
                deviceId,
                temperature,
                humidity,
                getMeasurementStatus(box, temperature, humidity),
                timestamp != null ? new Timestamp(timestamp * 1000) : new Timestamp(System.currentTimeMillis())
        ));
    }

    private BoxStatus getMeasurementStatus(Box box, Double temperature, Double humidity) {
        if ((temperature < (box.getLowerTemperatureLimit() * 0.10) && temperature > box.getLowerTemperatureLimit()) || (temperature > (box.getUpperTemperatureLimit() * 0.90) && temperature < box.getUpperTemperatureLimit())) {
            return BoxStatus.WARNING;
        }
        if ((humidity < (box.getLowerHumidityLimit() * 0.10) && humidity > box.getLowerHumidityLimit()) || (humidity > (box.getUpperHumidityLimit() * 0.90) && humidity < box.getUpperHumidityLimit())) {
            return BoxStatus.WARNING;
        }
        if ((temperature < box.getLowerTemperatureLimit() || temperature > box.getUpperTemperatureLimit())
                || (humidity < box.getLowerHumidityLimit() || humidity > box.getUpperHumidityLimit())) {
            return BoxStatus.CRITICAL;
        }
        return BoxStatus.OK;
    }
}

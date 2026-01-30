package uun.iot.bmc.rest.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import uun.iot.bmc.rest.model.measurement.MeasurementDto;
import uun.iot.bmc.service.api.MeasurementService;

import static uun.iot.bmc.config.support.ApiPaths.MEASUREMENT_API;

@RestController
@RequestMapping(value = MEASUREMENT_API, produces = MediaType.APPLICATION_JSON_VALUE)
public class MeasurementController {

    private final MeasurementService measurementService;

    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void saveMeasurement(@Valid @RequestBody MeasurementDto measurement) {
        measurementService.saveMeasurement(measurement.temperature(), measurement.humidity(), measurement.deviceId(), measurement.timestamp());
    }

}

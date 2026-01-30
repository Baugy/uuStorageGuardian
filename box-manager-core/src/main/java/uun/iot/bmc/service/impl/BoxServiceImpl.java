package uun.iot.bmc.service.impl;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import uun.iot.bmc.database.repository.BoxRepository;
import uun.iot.bmc.database.repository.MeasurementRepository;
import uun.iot.bmc.exception.AccessDeniedException;
import uun.iot.bmc.exception.EntityDoesNotExist;
import uun.iot.bmc.rest.model.box.BoxCreateDto;
import uun.iot.bmc.rest.model.box.BoxUpdateDto;
import uun.iot.bmc.service.api.BoxService;
import uun.iot.bmc.service.api.WarehouseService;
import uun.iot.bmc.service.mapper.BoxMapper;
import uun.iot.bmc.service.model.box.Box;
import uun.iot.bmc.service.model.box.BoxHistory;
import uun.iot.bmc.service.model.box.BoxStatus;
import uun.iot.bmc.service.model.measurement.MeasurementRecord;
import uun.iot.bmc.service.model.warehouse.Warehouse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class BoxServiceImpl implements BoxService {

    private final BoxRepository boxRepository;
    private final WarehouseService warehouseService;
    private final Environment environment;
    private final MeasurementRepository measurementRepository;
    private final BoxMapper boxMapper;

    public BoxServiceImpl(BoxRepository boxRepository, WarehouseService warehouseService, MeasurementRepository measurementRepository, BoxMapper boxMapper, Environment environment) {
        this.boxRepository = boxRepository;
        this.warehouseService = warehouseService;
        this.measurementRepository = measurementRepository;
        this.boxMapper = boxMapper;
        this.environment = environment;
    }
    
    private boolean isDevMode() {
        return environment != null && java.util.Arrays.asList(environment.getActiveProfiles()).contains("dev");
    }

    @Override
    @Transactional
    public Box createBox(BoxCreateDto boxCreateDto) {
        Warehouse warehouse = warehouseService.getWarehouse(boxCreateDto.warehouseId());
        Box box = new Box()
                .withName(boxCreateDto.name())
                .withDescription(boxCreateDto.description())
                .withWarehouse(warehouse)
                .withRenterId(boxCreateDto.renterId())
                .withDeviceId(boxCreateDto.deviceId())
                .withLowerHumidityLimit(boxCreateDto.lowerHumidityLimit())
                .withUpperHumidityLimit(boxCreateDto.upperHumidityLimit())
                .withLowerTemperatureLimit(boxCreateDto.lowerTemperatureLimit())
                .withUpperTemperatureLimit(boxCreateDto.upperTemperatureLimit());
        return boxMapper.toModel(boxRepository.save(boxMapper.toEntity(box)));
    }

    @Override
    @Transactional
    public Box updateBox(Long boxId, BoxUpdateDto boxUpdateDto) {
        Box box = getBox(boxId);

        box = box.withName(Optional.ofNullable(boxUpdateDto.name()).orElse(box.getName()))
           .withDescription(Optional.ofNullable(boxUpdateDto.description()).orElse(box.getDescription()))
           .withRenterId(Optional.ofNullable(boxUpdateDto.renterId()).map(renterId -> {
               // In dev mode, skip security check
               if (!isDevMode()) {
                   try {
                       Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                       if (auth != null && !auth.getName().equals("anonymousUser")) {
                           boolean isOperator = auth.getAuthorities().stream()
                                   .anyMatch(a -> a.getAuthority().equals("ROLE_Operator"));
                           if (!isOperator) {
                               throw AccessDeniedException.forbidden("Box", boxId);
                           }
                       }
                   } catch (Exception e) {
                       log.warn("Error checking authentication for box update {}: {}", boxId, e.getMessage());
                   }
               }
               return renterId;
           }).orElse(box.getRenterId()))
           .withDeviceId(Optional.ofNullable(boxUpdateDto.deviceId()).map(deviceId -> {
               // In dev mode, skip security check
               if (!isDevMode()) {
                   try {
                       Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                       if (auth != null && !auth.getName().equals("anonymousUser")) {
                           boolean isOperator = auth.getAuthorities().stream()
                                   .anyMatch(a -> a.getAuthority().equals("ROLE_Operator"));
                           if (!isOperator) {
                               throw AccessDeniedException.forbidden("Box", boxId);
                           }
                       }
                   } catch (Exception e) {
                       log.warn("Error checking authentication for box update {}: {}", boxId, e.getMessage());
                   }
               }
               return deviceId;
           }).orElse(box.getDeviceId()))
           .withLowerHumidityLimit(Optional.ofNullable(boxUpdateDto.lowerHumidityLimit()).orElse(box.getLowerHumidityLimit()))
           .withUpperHumidityLimit(Optional.ofNullable(boxUpdateDto.upperHumidityLimit()).orElse(box.getUpperHumidityLimit()))
           .withLowerTemperatureLimit(Optional.ofNullable(boxUpdateDto.lowerTemperatureLimit()).orElse(box.getLowerTemperatureLimit()))
           .withUpperTemperatureLimit(Optional.ofNullable(boxUpdateDto.upperTemperatureLimit()).orElse(box.getUpperTemperatureLimit()));

        return boxMapper.toModel(boxRepository.save(boxMapper.toEntity(box)));
    }

    @Override
    public List<Box> getBoxes(String name, String status, Long warehouseId) {
        List<Box> boxes = boxMapper.toModel(boxRepository.findByNameAndWarehouseId(name, warehouseId));
        
        // In dev mode, skip security filtering
        if (!isDevMode()) {
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && !auth.getName().equals("anonymousUser")) {
                    String userId = auth.getName();
                    boolean isOperator = auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_Operator"));
                    boxes = boxes.stream()
                            .filter(box -> isOperator || (box.getRenterId() != null && box.getRenterId().equals(userId)))
                            .toList();
                }
            } catch (Exception e) {
                log.warn("Error checking authentication, returning all boxes: {}", e.getMessage());
            }
        }
        
        // Apply status filter if provided
        if (status != null && !status.isEmpty()) {
            boxes = boxes.stream()
                    .filter(box -> box.getStatus() != null && box.getStatus().equals(status))
                    .toList();
        }
        
        return boxes.stream().map(box -> {
            try {
                MeasurementRecord measurementRecord = measurementRepository.getLastBoxMeasurement(box.getId());
                BoxStatus boxStatus = Optional.ofNullable(measurementRecord != null ? measurementRecord.getStatus() : null)
                        .orElse(box.getStatus() != null ? box.getStatus() : BoxStatus.OK);
                return box.withTemperature(Optional.ofNullable(measurementRecord != null ? measurementRecord.getTemperature() : null).orElse(box.getTemperature()))
                         .withHumidity(Optional.ofNullable(measurementRecord != null ? measurementRecord.getHumidity() : null).orElse(box.getHumidity()))
                         .withStatus(boxStatus)
                         .withLastMeasurementDate(Optional.ofNullable(measurementRecord != null ? measurementRecord.getMeasurementDate() : null).orElse(box.getLastMeasurementDate()));
            } catch (Exception e) {
                log.warn("Error getting measurement for box {}: {}", box.getId(), e.getMessage());
                // In dev mode, provide default values for better UX when InfluxDB is unavailable
                if (isDevMode()) {
                    // Provide sample values based on box type/name for demo purposes
                    double defaultTemp = 20.0;
                    double defaultHumidity = 50.0;
                    if (box.getName() != null) {
                        String boxName = box.getName().toLowerCase();
                        if (boxName.contains("freezer") || boxName.contains("cold")) {
                            defaultTemp = -18.0;
                            defaultHumidity = 30.0;
                        } else if (boxName.contains("dry")) {
                            defaultTemp = 22.0;
                            defaultHumidity = 45.0;
                        }
                    }
                    BoxStatus defaultStatus = box.getStatus() != null ? box.getStatus() : BoxStatus.OK;
                    return box.withTemperature(defaultTemp)
                             .withHumidity(defaultHumidity)
                             .withStatus(defaultStatus)
                             .withLastMeasurementDate(LocalDateTime.now());
                }
                // Ensure box has a default status if null
                BoxStatus defaultStatus = box.getStatus() != null ? box.getStatus() : BoxStatus.OK;
                return box.withStatus(defaultStatus);
            }
        }).toList();
    }

    @Override
    public Box getBox(Long id) {
        Box box = boxMapper.toModel(boxRepository.findById(id)
                .orElseThrow(() -> EntityDoesNotExist.notFound("Box", id)));
        
        // In dev mode, skip security check
        if (!isDevMode()) {
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && !auth.getName().equals("anonymousUser")) {
                    boolean isOperator = auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_Operator"));
                    if (!isOperator) {
                        String userId = auth.getName();
                        if (box.getRenterId() == null || !box.getRenterId().equals(userId)) {
                            throw EntityDoesNotExist.notFound("Box", id);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Error checking authentication for box {}: {}", id, e.getMessage());
            }
        }
        
        try {
            MeasurementRecord measurementRecord = measurementRepository.getLastBoxMeasurement(box.getId());
            BoxStatus boxStatus = Optional.ofNullable(measurementRecord != null ? measurementRecord.getStatus() : null)
                    .orElse(box.getStatus() != null ? box.getStatus() : BoxStatus.OK);
            return box.withTemperature(Optional.ofNullable(measurementRecord != null ? measurementRecord.getTemperature() : null).orElse(box.getTemperature()))
                    .withHumidity(Optional.ofNullable(measurementRecord != null ? measurementRecord.getHumidity() : null).orElse(box.getHumidity()))
                    .withStatus(boxStatus)
                    .withLastMeasurementDate(Optional.ofNullable(measurementRecord != null ? measurementRecord.getMeasurementDate() : null).orElse(box.getLastMeasurementDate()));
        } catch (Exception e) {
            log.warn("Error getting measurement for box {}: {}", id, e.getMessage());
            // In dev mode, provide default values for better UX when InfluxDB is unavailable
            if (isDevMode()) {
                // Provide sample values based on box type/name for demo purposes
                double defaultTemp = 20.0;
                double defaultHumidity = 50.0;
                if (box.getName() != null) {
                    String name = box.getName().toLowerCase();
                    if (name.contains("freezer") || name.contains("cold")) {
                        defaultTemp = -18.0;
                        defaultHumidity = 30.0;
                    } else if (name.contains("dry")) {
                        defaultTemp = 22.0;
                        defaultHumidity = 45.0;
                    }
                }
                BoxStatus defaultStatus = box.getStatus() != null ? box.getStatus() : BoxStatus.OK;
                return box.withTemperature(defaultTemp)
                         .withHumidity(defaultHumidity)
                         .withStatus(defaultStatus)
                         .withLastMeasurementDate(LocalDateTime.now());
            }
            // Ensure box has a default status if null
            BoxStatus defaultStatus = box.getStatus() != null ? box.getStatus() : BoxStatus.OK;
            return box.withStatus(defaultStatus);
        }

    }

    @Override
    public Optional<Box> getBoxByDevice(Long deviceId) {
        return boxRepository.findByDeviceId(deviceId).map(boxMapper::toModel);
    }

    @Override
    public List<BoxHistory> getBoxHistory(Long id, LocalDateTime dateFrom, LocalDateTime dateTo) {
        Box box = getBox(id); // to check if box exists
        String userId = null;
        
        // In dev mode, skip user filtering
        if (!isDevMode()) {
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && !auth.getName().equals("anonymousUser")) {
                    boolean isOperator = auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_Operator"));
                    if (!isOperator) {
                        userId = auth.getName();
                    }
                }
            } catch (Exception e) {
                log.warn("Error checking authentication for box history {}: {}", id, e.getMessage());
            }
        }
        
        try {
            return measurementRepository.getMeasurements(box.getId(), userId, dateFrom, dateTo).stream().map(measurement ->
                 new BoxHistory(measurement.getTemperature(), measurement.getHumidity(), measurement.getStatus(), measurement.getMeasurementDate())
            ).toList();
        } catch (Exception e) {
            log.warn("Error getting measurements for box {} history: {}", id, e.getMessage());
            // Return empty list if InfluxDB query fails (e.g., no data or connection issue)
            return List.of();
        }
    }

    @Override
    public void deleteBox(Long id) {
        boxRepository.deleteById(id);
    }

}

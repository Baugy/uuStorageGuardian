package uun.iot.bmc.service.impl;

import org.springframework.stereotype.Service;
import uun.iot.bmc.database.repository.WarehouseRepository;
import uun.iot.bmc.exception.EntityDoesNotExist;
import uun.iot.bmc.service.api.WarehouseService;
import uun.iot.bmc.service.mapper.WarehouseMapper;
import uun.iot.bmc.service.model.warehouse.Warehouse;

@Service
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    public WarehouseServiceImpl(WarehouseRepository warehouseRepository, WarehouseMapper warehouseMapper) {
        this.warehouseRepository = warehouseRepository;
        this.warehouseMapper = warehouseMapper;
    }

    @Override
    public Warehouse getWarehouse(Long id) {
        return warehouseMapper.toModel(warehouseRepository.findById(id)
                .orElseThrow(() -> EntityDoesNotExist.notFound("Warehouse", id)));
    };

}

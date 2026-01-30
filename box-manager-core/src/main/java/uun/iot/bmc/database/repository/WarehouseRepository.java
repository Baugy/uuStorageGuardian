package uun.iot.bmc.database.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uun.iot.bmc.database.model.WarehouseEntity;

public interface WarehouseRepository extends JpaRepository<WarehouseEntity, Long> {
}

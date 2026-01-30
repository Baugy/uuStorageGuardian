package uun.iot.bmc.database.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import uun.iot.bmc.database.model.BoxEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoxRepository extends JpaRepository<BoxEntity, Long> {

    @Query(value = "SELECT * FROM t_box b WHERE " +
            "(:name IS NULL OR b.name ILIKE CONCAT('%', :name, '%')) AND " +
            "(:warehouseId IS NULL OR b.warehouse_id = :warehouseId)",
            nativeQuery = true)
    List<BoxEntity> findByNameAndWarehouseId(String name, Long warehouseId);

    Optional<BoxEntity> findByDeviceId(Long deviceId);


}

package uun.iot.bmc.service.api;

import uun.iot.bmc.rest.model.box.BoxCreateDto;
import uun.iot.bmc.rest.model.box.BoxUpdateDto;
import uun.iot.bmc.service.model.box.Box;
import uun.iot.bmc.service.model.box.BoxHistory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BoxService {

    Box createBox(BoxCreateDto boxCreateDto);

    Box updateBox(Long boxId, BoxUpdateDto boxUpdateDto);

    List<Box> getBoxes(String name, String status, Long warehouseId);

    Box getBox(Long id);

    Optional<Box> getBoxByDevice(Long deviceId);

    List<BoxHistory> getBoxHistory(Long id, LocalDateTime dateFrom, LocalDateTime dateTo);

    void deleteBox(Long id);

}

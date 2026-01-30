package uun.iot.bmc.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import uun.iot.bmc.rest.model.box.BoxDto;
import uun.iot.bmc.rest.model.box.BoxHistoryDto;
import uun.iot.bmc.rest.model.box.BoxListDto;
import uun.iot.bmc.service.model.box.Box;
import uun.iot.bmc.service.model.box.BoxHistory;

import java.util.List;

@Mapper(config = RestMapperConfiguration.class,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {WarehouseRestMapper.class, DeviceRestMapper.class}
)

public interface BoxRestMapper {

    BoxDto toRestModel(Box box);

    BoxListDto toListRestModel(Box box);

    List<BoxListDto> toRestModel(List<Box> boxes);

    BoxHistoryDto toHistoryRestModel(BoxHistory boxHistory);

    List<BoxHistoryDto> toHistoryRestModel(List<BoxHistory> boxHistories);

}

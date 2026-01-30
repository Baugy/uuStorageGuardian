package uun.iot.bmc.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import uun.iot.bmc.rest.model.measurement.MeasurementDto;
import uun.iot.bmc.service.model.measurement.MeasurementRecord;

@Mapper(config = RestMapperConfiguration.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MeasurementRestMapper {

    MeasurementRecord toModel(MeasurementDto measurementDto);

}

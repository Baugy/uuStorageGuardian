package uun.iot.bmc.service.mapper;

import org.mapstruct.MapperConfig;
import org.mapstruct.ReportingPolicy;

@MapperConfig(
        componentModel = "spring",
        unmappedSourcePolicy = ReportingPolicy.WARN,
        unmappedTargetPolicy = ReportingPolicy.ERROR,
        disableSubMappingMethodsGeneration = true,
        implementationName = "Service<CLASS_NAME>Impl"
)
public class ServiceMapperConfiguration {
}

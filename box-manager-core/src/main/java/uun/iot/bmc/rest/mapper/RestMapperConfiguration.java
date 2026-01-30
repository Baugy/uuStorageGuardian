package uun.iot.bmc.rest.mapper;

import org.mapstruct.MapperConfig;
import org.mapstruct.ReportingPolicy;

@MapperConfig(
        componentModel = "spring",
        unmappedSourcePolicy = ReportingPolicy.WARN,
        unmappedTargetPolicy = ReportingPolicy.ERROR,
        disableSubMappingMethodsGeneration = true,
        implementationName = "Rest<CLASS_NAME>Impl"
)
public class RestMapperConfiguration {
}

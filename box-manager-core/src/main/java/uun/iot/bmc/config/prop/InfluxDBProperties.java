package uun.iot.bmc.config.prop;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties("application.influx")
@Component
@Data
public class InfluxDBProperties {

    private String url;
    private String database;
    private String organization;
    private String token;

}

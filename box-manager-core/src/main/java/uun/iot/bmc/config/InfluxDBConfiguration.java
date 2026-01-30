package uun.iot.bmc.config;

import com.influxdb.v3.client.InfluxDBClient;
import com.influxdb.v3.client.config.ClientConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import uun.iot.bmc.config.prop.InfluxDBProperties;

@Configuration
public class InfluxDBConfiguration {

    private final InfluxDBProperties influxDBProperties;

    public InfluxDBConfiguration(InfluxDBProperties influxDBProperties) {
        this.influxDBProperties = influxDBProperties;
    }

    @Bean
    public InfluxDBClient influxDBClient() {
        InfluxDBClient client = InfluxDBClient.getInstance(
                new ClientConfig.Builder()
                        .host(influxDBProperties.getUrl())
                        .token(influxDBProperties.getToken().toCharArray())
                        .organization(influxDBProperties.getOrganization())
                        .database(influxDBProperties.getDatabase())
                        .build()
        );
        return client;
    }

}


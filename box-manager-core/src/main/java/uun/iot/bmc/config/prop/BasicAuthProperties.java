package uun.iot.bmc.config.prop;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties("application.security.basic")
@Component
@Data
public class BasicAuthProperties {

    private String username;
    private String password;

}

package uun.iot.bmc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.LocalDateTime;
import java.util.Optional;

@EnableJpaAuditing(auditorAwareRef = "usernameAuditorAware", dateTimeProviderRef = "clockDateTimeProvider")
@Configuration
public class AuditingConfiguration {


    @Bean
    AuditorAware<String> usernameAuditorAware() {
        return () -> Optional.of("system");
    }

    @Bean
    DateTimeProvider clockDateTimeProvider() {
        return () -> Optional.of(LocalDateTime.now());
    }
}

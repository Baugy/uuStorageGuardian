package uun.iot.bmc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import uun.iot.bmc.config.prop.CorsProperties;

import java.util.List;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {

    private final CorsProperties corsProperties;

    public WebConfiguration(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }


    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(getAllowedArray(corsProperties.getAllowedOrigins()))
                .allowedMethods(getAllowedArray(corsProperties.getAllowedMethods()))
                .allowedHeaders(getAllowedArray(corsProperties.getAllowedHeaders()));
    }

    private String[] getAllowedArray(List<String> allowedList) {
        return allowedList.toArray(new String[0]);
    }
}

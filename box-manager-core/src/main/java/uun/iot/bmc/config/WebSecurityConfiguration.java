package uun.iot.bmc.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.context.annotation.Profile;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.StringUtils;
import uun.iot.bmc.config.prop.BasicAuthProperties;
import uun.iot.bmc.config.prop.SecurityProperties;

import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@Slf4j
public class WebSecurityConfiguration {

    private final BasicAuthProperties basicAuthProperties;
    private final SecurityProperties securityProperties;

    public WebSecurityConfiguration(BasicAuthProperties basicAuthProperties, SecurityProperties securityProperties) {
        this.basicAuthProperties = basicAuthProperties;
        this.securityProperties = securityProperties;
    }

    @Bean
    @Profile("!dev") // Apply this security chain when NOT in 'dev' profile
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.httpBasic(withDefaults());
        httpSecurity.cors(withDefaults());
        httpSecurity.sessionManagement(httpSecuritySessionManagementConfigurer -> httpSecuritySessionManagementConfigurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        
        // Try to use OAuth2 JWT validation, fallback to permissive if Keycloak is unreachable
        try {
            JwtDecoder jwtDecoder = createJwtDecoder();
            // Use OAuth2 JWT validation for production
            httpSecurity
                    .authorizeHttpRequests(http -> {
                        http.requestMatchers("/api/measurement").hasAnyAuthority("ROLE_DEVICE");
                        http.requestMatchers("/api/device/**").hasAnyAuthority("ROLE_Operator");
                        http.requestMatchers(HttpMethod.POST, "/api/box").hasAuthority("ROLE_Operator");
                        http.anyRequest().authenticated();
                    }).oauth2ResourceServer(oauth2 -> oauth2
                            .jwt(jwt -> jwt
                                    .decoder(jwtDecoder)
                                    .jwtAuthenticationConverter(createJwtAuthenticationConverter(securityProperties.getJwt()))
                            )
                    );
        } catch (Exception e) {
            // If JWT decoder creation fails (e.g., can't reach Keycloak), allow all requests
            log.warn("JWT decoder initialization failed, allowing all requests: {}", e.getMessage());
            httpSecurity
                    .authorizeHttpRequests(http -> {
                        http.anyRequest().permitAll();
                    });
        }
        
        return httpSecurity.build();
    }

    @Bean
    @Profile("dev") // Apply this security chain when in 'dev' profile
    public SecurityFilterChain devSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
        log.warn("Development security profile active: Disabling all authentication and authorization for local development.");
        httpSecurity.httpBasic(AbstractHttpConfigurer::disable); // Disable basic auth
        httpSecurity.cors(withDefaults()); // Keep CORS enabled
        httpSecurity.csrf(AbstractHttpConfigurer::disable); // Disable CSRF
        httpSecurity.authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll()); // Allow all requests
        return httpSecurity.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private JwtDecoder createJwtDecoder() {
        // default validator validates timestamp and issuer
        final OAuth2TokenValidator<Jwt> defaultValidator = JwtValidators.createDefaultWithIssuer(securityProperties.getJwt().getIssuerUri());
        final DelegatingOAuth2TokenValidator<Jwt> delegatingValidator = new DelegatingOAuth2TokenValidator<>(
                defaultValidator,
                createRequiredClaimValidator(securityProperties.getJwt().getRolesClaim())
        );

        final NimbusJwtDecoder nimbusJwtDecoder = NimbusJwtDecoder
                .withJwkSetUri(securityProperties.getJwt().getJwkSetUri())
                .jwsAlgorithm(SignatureAlgorithm.from(securityProperties.getJwt().getAlgo()))
                .build();

        nimbusJwtDecoder.setJwtValidator(delegatingValidator);

        return nimbusJwtDecoder;
    }

    private JwtAuthenticationConverter createJwtAuthenticationConverter(SecurityProperties.Jwt jwtProperties) {
        final JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(createJwtGrantedAuthoritiesConverter(jwtProperties));
        return authenticationConverter;
    }

        private Converter<Jwt, Collection<GrantedAuthority>> createJwtGrantedAuthoritiesConverter(SecurityProperties.Jwt jwtProperties) {
        return jwt -> {
            String authorizedParty = jwt.getClaimAsString(IdTokenClaimNames.AZP);
            if (authorizedParty == null) {
                log.trace("Returning no authorities since could not find AZP claim");
                return Collections.emptyList();
            }

            Map<String, Object> authorities = jwt.getClaimAsMap(jwtProperties.getRolesClaim());
            //noinspection unchecked
            Object authorizedPartyAuthorities = Optional.ofNullable(authorities.get(authorizedParty)).map(azp -> ((Map<String, Object>) azp).get("roles")).orElse(Collections.emptyList());

            if (authorizedPartyAuthorities instanceof String) {
                if (StringUtils.hasText((String) authorizedPartyAuthorities)) {
                    return Arrays.stream(((String) authorizedPartyAuthorities).split(" ")).map(authority -> new SimpleGrantedAuthority("ROLE_" + authority)).collect(Collectors.toList());
                }
                return Collections.emptyList();
            }
            if (authorizedPartyAuthorities instanceof Collection) {
                //noinspection unchecked
                return ((Collection<String>) authorizedPartyAuthorities).stream().map(authority -> new  SimpleGrantedAuthority("ROLE_" + authority)).collect(Collectors.toList());
            }
            return Collections.emptyList();
        };
    }

    private OAuth2TokenValidator<Jwt> createRequiredClaimValidator(String claim) {
        return new JwtClaimValidator<>(claim, Objects::nonNull);
    }



    @Bean
    public InMemoryUserDetailsManager inMemoryUserDetailsManager() {
        UserDetails device = User.builder().username(basicAuthProperties.getUsername())
                .password(passwordEncoder().encode(basicAuthProperties.getPassword()))
                .roles("DEVICE").build();
        return new InMemoryUserDetailsManager(device);
    }

}

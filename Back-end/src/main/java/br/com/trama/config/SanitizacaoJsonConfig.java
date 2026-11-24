package br.com.trama.config;

import br.com.trama.validation.TextoSeguro;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StringDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import java.io.IOException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Filtro de sanitização aplicado a todas as Strings recebidas no corpo JSON das requisições.
 * Remove caracteres de controle invisíveis antes da validação dos DTOs; a recusa de HTML e
 * scripts fica a cargo do {@code @Pattern(regexp = TextoSeguro.SEM_HTML)} em cada DTO.
 */
@Configuration
public class SanitizacaoJsonConfig {

    @Bean
    SimpleModule sanitizacaoStringModule() {
        SimpleModule module = new SimpleModule("SanitizacaoStringModule");
        module.addDeserializer(String.class, new StringDeserializer() {
            @Override
            public String deserialize(JsonParser parser, DeserializationContext context) throws IOException {
                return TextoSeguro.limpar(super.deserialize(parser, context));
            }
        });
        return module;
    }
}

package br.com.trama.dto;

import br.com.trama.validation.TextoSeguro;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CenarioRequest(
        @NotBlank(message = "Informe o nome do cenário.")
        @Size(max = 100, message = "O nome deve ter até 100 caracteres.")
        @Pattern(regexp = TextoSeguro.SEM_HTML, message = TextoSeguro.MENSAGEM)
        String nome,
        @Size(max = 300, message = "A descrição deve ter até 300 caracteres.")
        @Pattern(regexp = TextoSeguro.SEM_HTML, message = TextoSeguro.MENSAGEM)
        String descricao,
        Long categoriaId,
        @NotNull(message = "Informe o percentual de impacto.")
        @DecimalMin(value = "0.00", message = "O percentual não pode ser negativo.")
        @DecimalMax(value = "100.00", message = "O percentual não pode ultrapassar 100%.")
        BigDecimal percentualImpacto
) {}

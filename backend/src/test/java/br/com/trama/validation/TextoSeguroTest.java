package br.com.trama.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;

class TextoSeguroTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "<script>alert('xss')</script>",
            "Jeans <b>premium</b>",
            "<img src=x onerror=alert(1)>",
            "<svg/onload=alert(1)>",
            "javascript:alert(1)",
            "JavaScript :alert(1)",
            "vbscript:msgbox(1)",
            "data:text/html;base64,PHNjcmlwdD4=",
            "linha 1\n<script>alert(1)</script>"
    })
    void recusaPayloadsMaliciosos(String payload) {
        assertThat(TextoSeguro.ehSeguro(payload)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Moda praia",
            "Jeans feminino - coleção verão 2026",
            "Confecção São João & Filhos Ltda.",
            "Entrevista com 12 lojistas (feira de Caruaru)",
            "Queda de 15% nas vendas: concorrência chinesa",
            "Descrição com\nquebra de linha"
    })
    void aceitaTextosComunsDoDominio(String texto) {
        assertThat(TextoSeguro.ehSeguro(texto)).isTrue();
    }

    @Test
    void nuloEhConsideradoSeguro() {
        assertThat(TextoSeguro.ehSeguro(null)).isTrue();
    }

    @Test
    void limparRemoveCaracteresDeControleMasMantemQuebrasDeLinha() {
        assertThat(TextoSeguro.limpar("Jeans\u0000 azul\u0007\nlinha 2\t."))
                .isEqualTo("Jeans azul\nlinha 2\t.");
        assertThat(TextoSeguro.limpar(null)).isNull();
    }

    @Test
    void limparNomeArquivoNeutralizaCaracteresDeMarcacao() {
        assertThat(TextoSeguro.limparNomeArquivo("<script>alert('x')</script>.csv"))
                .doesNotContain("<", ">", "'");
    }
}

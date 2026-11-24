package br.com.trama.validation;

import java.util.regex.Pattern;

/**
 * Regras centrais de proteção contra XSS e injeção de conteúdo nos campos de texto livre
 * (OWASP Top 10 - A03: Injection).
 *
 * <p>A estratégia adotada é a recusa: textos com marcação HTML ou esquemas de script
 * são rejeitados com HTTP 400, em vez de serem gravados e exibidos depois nos dashboards.</p>
 */
public final class TextoSeguro {

    /**
     * Expressão usada com {@code @Pattern} nos DTOs. Aceita letras acentuadas, números,
     * pontuação comum e quebras de linha, mas recusa os caracteres {@code <} e {@code >}
     * e os esquemas {@code javascript:}, {@code vbscript:} e {@code data:text/html}.
     */
    public static final String SEM_HTML =
            "(?s)^(?!.*(?i:javascript\\s*:|vbscript\\s*:|data\\s*:\\s*text/html))[^<>]*$";

    public static final String MENSAGEM =
            "O texto não pode conter tags HTML, scripts ou os caracteres < e >.";

    private static final Pattern PADRAO = Pattern.compile(SEM_HTML);
    private static final Pattern CONTROLE = Pattern.compile("[\\p{Cntrl}&&[^\\r\\n\\t]]");

    private TextoSeguro() {
    }

    /** Indica se o texto é seguro (sem HTML nem script). Valores nulos são considerados seguros. */
    public static boolean ehSeguro(String texto) {
        return texto == null || PADRAO.matcher(texto).matches();
    }

    /**
     * Sanitização aplicada a todo texto recebido em JSON: remove caracteres de controle
     * invisíveis (por exemplo, byte nulo), usados para burlar filtros e logs.
     */
    public static String limpar(String texto) {
        if (texto == null) {
            return null;
        }
        return CONTROLE.matcher(texto).replaceAll("");
    }

    /** Remove caracteres perigosos de nomes de arquivo antes de gravá-los ou devolvê-los na API. */
    public static String limparNomeArquivo(String nome) {
        if (nome == null) {
            return null;
        }
        return limpar(nome).replaceAll("[<>\"'`]", "_");
    }
}

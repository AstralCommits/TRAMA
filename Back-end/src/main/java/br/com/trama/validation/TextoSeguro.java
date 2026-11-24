package br.com.trama.validation;

import java.util.regex.Pattern;

public final class TextoSeguro {

    public static final String SEM_HTML =
            "(?s)^(?!.*(?i:javascript\\s*:|vbscript\\s*:|data\\s*:\\s*text/html))[^<>]*$";

    public static final String MENSAGEM =
            "O texto não pode conter tags HTML, scripts ou os caracteres < e >.";

    private static final Pattern PADRAO = Pattern.compile(SEM_HTML);
    private static final Pattern CONTROLE = Pattern.compile("[\\p{Cntrl}&&[^\\r\\n\\t]]");

    private TextoSeguro() {
    }

    public static boolean ehSeguro(String texto) {
        return texto == null || PADRAO.matcher(texto).matches();
    }

    public static String limpar(String texto) {
        if (texto == null) {
            return null;
        }
        return CONTROLE.matcher(texto).replaceAll("");
    }

    public static String limparNomeArquivo(String nome) {
        if (nome == null) {
            return null;
        }
        return limpar(nome).replaceAll("[<>\"'`]", "_");
    }
}

package br.com.trama.auth;

import br.com.trama.model.Usuario;

public record AuthUserResponse(
        Long idUsuario,
        String nome,
        String email,
        String perfil,
        Long idConfeccao,
        String nomeConfeccao,
        String cidade,
        String uf) {
    public static AuthUserResponse from(Usuario usuario) {
        var confeccao = usuario.getConfeccao();
        return new AuthUserResponse(
                usuario.getIdUsuario(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil().name(),
                confeccao == null ? null : confeccao.getIdConfeccao(),
                confeccao == null ? null : confeccao.getNome(),
                confeccao == null ? null : confeccao.getCidade().getNome(),
                confeccao == null ? null : confeccao.getCidade().getUf());
    }
}

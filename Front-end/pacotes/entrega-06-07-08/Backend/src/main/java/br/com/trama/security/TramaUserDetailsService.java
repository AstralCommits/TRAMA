package br.com.trama.security;

import br.com.trama.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TramaUserDetailsService implements UserDetailsService {
    private final UsuarioRepository usuarioRepository;

    public TramaUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmailIgnoreCase(email.trim())
                .map(TramaUserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));
    }
}

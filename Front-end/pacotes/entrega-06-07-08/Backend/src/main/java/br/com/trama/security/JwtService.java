package br.com.trama.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final long tokenHours;

    public JwtService(
            @Value("${trama.auth.jwt-secret:}") String secret,
            @Value("${trama.auth.token-hours:12}") long tokenHours) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Configure TRAMA_JWT_SECRET com uma chave Base64 segura de pelo menos 32 bytes.");
        }
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret.trim());
        } catch (RuntimeException exception) {
            throw new IllegalStateException("TRAMA_JWT_SECRET precisa estar em Base64.", exception);
        }
        if (keyBytes.length < 32) {
            throw new IllegalStateException("TRAMA_JWT_SECRET deve decodificar para pelo menos 32 bytes.");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.tokenHours = Math.max(1, tokenHours);
    }

    public String gerarToken(UserDetails user) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plusSeconds(tokenHours * 3600)))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public String extrairEmail(String token) {
        return claims(token).getSubject();
    }

    public boolean tokenValido(String token, UserDetails user) {
        try {
            Claims claims = claims(token);
            return user.getUsername().equalsIgnoreCase(claims.getSubject())
                    && claims.getExpiration() != null
                    && claims.getExpiration().after(new Date());
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(signingKey).build()
                .parseSignedClaims(token).getPayload();
    }
}

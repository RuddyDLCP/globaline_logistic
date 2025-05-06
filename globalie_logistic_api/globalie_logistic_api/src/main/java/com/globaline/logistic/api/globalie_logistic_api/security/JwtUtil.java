package com.globaline.logistic.api.globalie_logistic_api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.security.Key;


@Component
public class JwtUtil {
    private Key secretKey;

    @Value("${jwt.expiration}")
    private long expiration;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public String extractEmail(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody().getSubject();
        } catch (Exception e) {
            return null; // Token is invalid or expired
        }
    }

    public String extractRole(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
            return (String) claims.get("role");
        } catch (Exception e) {
            return null; // Token is invalid or expired
        }
    }

    public boolean validateToken(String token) {
        if (token == null) return false;
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

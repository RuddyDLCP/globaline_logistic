package com.globaline.logistic.api.globalie_logistic_api.controller;

import com.globaline.logistic.api.globalie_logistic_api.dto.LoginRequest;
import com.globaline.logistic.api.globalie_logistic_api.entity.Usuario;
import com.globaline.logistic.api.globalie_logistic_api.repository.UsuarioRepository;
import com.globaline.logistic.api.globalie_logistic_api.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

// AuthController.java
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Credenciales fijas para el admin
    private static final String ADMIN_EMAIL = "admin@globaline.com";
    private static final String ADMIN_PASSWORD = "Xr9$Lk!27p#QzWd3@Fb6";
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^.+@.+\\..+$");

    public AuthController(UsuarioRepository usuarioRepo,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.usuarioRepo = usuarioRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String email = request.getEmail();
            String password = request.getPassword();
            String nombre = request.getNombre();

            if (request.getEmail() == null || request.getPassword() == null || request.getNombre() == null) {
                return ResponseEntity.badRequest().body("Todos los campos son obligatorios");
            }

            // Validación básica
            if (email == null || email.trim().isEmpty() ||
                    password == null || password.trim().isEmpty() ||
                    nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("success", false, "message", "Todos los campos son obligatorios")
                );
            }

            // 1. Verificar si es ADMIN
            if (email.equals(ADMIN_EMAIL)) {
                if (!password.equals(ADMIN_PASSWORD)) {
                    return ResponseEntity.status(401).body(
                            Map.of("success", false, "message", "Credenciales incorrectas")
                    );
                }

                // Buscar o crear admin
                Optional<Usuario> adminExistente = usuarioRepo.findByEmail(ADMIN_EMAIL);
                Usuario admin = adminExistente.orElseGet(() -> {
                    Usuario nuevoAdmin = new Usuario();
                    nuevoAdmin.setEmail(ADMIN_EMAIL);
                    nuevoAdmin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
                    nuevoAdmin.setNombre(nombre);
                    return usuarioRepo.save(nuevoAdmin);
                });

                String token = jwtUtil.generateToken(email, "ADMIN");
                return ResponseEntity.ok(createAuthResponse(token, "ADMIN", "Inicio de sesión exitoso"));
            }

            // 2. Validar formato de email
            if (!EMAIL_PATTERN.matcher(email).matches()) {
                return ResponseEntity.badRequest().body(
                        Map.of("success", false, "message", "Formato de email inválido")
                );
            }

            // 3. Para usuarios normales (CLIENT)
            Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(email);
            Usuario usuario = usuarioOpt.orElseGet(() -> {
                Usuario nuevoUsuario = new Usuario();
                nuevoUsuario.setEmail(email);
                nuevoUsuario.setPasswordHash(passwordEncoder.encode(password));
                nuevoUsuario.setNombre(nombre);
                return usuarioRepo.save(nuevoUsuario);
            });

            // Verificar contraseña para usuarios existentes
            if (usuarioOpt.isPresent() && !passwordEncoder.matches(password, usuario.getPasswordHash())) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Credenciales incorrectas")
                );
            }

            String token = jwtUtil.generateToken(email, "CLIENT");
            return ResponseEntity.ok(createAuthResponse(token, "CLIENT", "Inicio de sesión exitoso"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("success", false, "message", "Error en el servidor: " + e.getMessage())
            );
        }
    }

    private Map<String, Object> createAuthResponse(String token, String role, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("token", token);
        response.put("role", role);
        return response;
    }
}
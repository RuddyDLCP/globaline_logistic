package com.globaline.logistic.api.globalie_logistic_api.repository;

import com.globaline.logistic.api.globalie_logistic_api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByNombre(String nombre);
    Optional<Usuario> findByEmailAndNombre(String email, String nombre);
}

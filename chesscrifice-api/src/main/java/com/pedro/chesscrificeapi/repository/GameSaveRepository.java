package com.pedro.chesscrificeapi.repository;

import com.pedro.chesscrificeapi.model.GameSave;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameSaveRepository extends JpaRepository<GameSave, Long> {
}
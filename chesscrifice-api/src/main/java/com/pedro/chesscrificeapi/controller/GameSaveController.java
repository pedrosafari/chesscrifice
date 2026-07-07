package com.pedro.chesscrificeapi.controller;

import com.pedro.chesscrificeapi.model.GameSave;
import com.pedro.chesscrificeapi.repository.GameSaveRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saves")
@CrossOrigin(origins = "*")
public class GameSaveController {

    private final GameSaveRepository repository;

    public GameSaveController(GameSaveRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<GameSave> listAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public GameSave findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Save não encontrado."));
    }

    @PostMapping
    public GameSave create(@RequestBody GameSave save) {
        if (save.getPlayerName() == null || save.getPlayerName().isBlank()) {
            save.setPlayerName("Jogador");
        }

        if (save.getCurrentPhase() == null) {
            save.setCurrentPhase(1);
        }

        if (save.getCurrentFen() == null || save.getCurrentFen().isBlank()) {
            save.setCurrentFen("start");
        }

        if (save.getCurrentMonster() == null || save.getCurrentMonster().isBlank()) {
            save.setCurrentMonster("O Peão Sem Rosto");
        }

        if (save.getSanity() == null) {
            save.setSanity(100);
        }

        if (save.getGameFinished() == null) {
            save.setGameFinished(false);
        }

        return repository.save(save);
    }

    @PutMapping("/{id}")
    public GameSave update(@PathVariable Long id, @RequestBody GameSave data) {
        GameSave save = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Save não encontrado."));

        save.setPlayerName(data.getPlayerName());
        save.setCurrentPhase(data.getCurrentPhase());
        save.setCurrentFen(data.getCurrentFen());
        save.setCurrentMonster(data.getCurrentMonster());
        save.setSanity(data.getSanity());
        save.setGameFinished(data.getGameFinished());

        return repository.save(save);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
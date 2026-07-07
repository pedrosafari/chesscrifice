package com.pedro.chesscrificeapi.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class GameSave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String playerName;

    private Integer currentPhase;

    @Column(length = 500)
    private String currentFen;

    private String currentMonster;

    private Integer sanity;

    private Integer timeLeft;

    private Boolean gameFinished;

    private LocalDateTime updatedAt;

    public GameSave() {
    }

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Integer getCurrentPhase() {
        return currentPhase;
    }

    public void setCurrentPhase(Integer currentPhase) {
        this.currentPhase = currentPhase;
    }

    public String getCurrentFen() {
        return currentFen;
    }

    public void setCurrentFen(String currentFen) {
        this.currentFen = currentFen;
    }

    public String getCurrentMonster() {
        return currentMonster;
    }

    public void setCurrentMonster(String currentMonster) {
        this.currentMonster = currentMonster;
    }

    public Integer getSanity() {
        return sanity;
    }

    public void setSanity(Integer sanity) {
        this.sanity = sanity;
    }

    public Integer getTimeLeft() {
        return timeLeft;
    }

    public void setTimeLeft(Integer timeLeft) {
        this.timeLeft = timeLeft;
    }

    public Boolean getGameFinished() {
        return gameFinished;
    }

    public void setGameFinished(Boolean gameFinished) {
        this.gameFinished = gameFinished;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
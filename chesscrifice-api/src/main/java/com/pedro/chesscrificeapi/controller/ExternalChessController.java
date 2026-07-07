package com.pedro.chesscrificeapi.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.Map;

@RestController
@RequestMapping("/api/external")
@CrossOrigin(origins = "*")
public class ExternalChessController {

    private final RestClient restClient;

    public ExternalChessController() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.chess.com/pub")
                .defaultHeader("User-Agent", "Chesscrifice Pedro - academic project")
                .build();
    }

    @GetMapping("/chess-player/{username}")
    public Map getChessPlayer(@PathVariable String username) {
        return restClient
                .get()
                .uri("/player/{username}", username)
                .retrieve()
                .body(Map.class);
    }
}
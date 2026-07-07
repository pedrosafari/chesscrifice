package com.pedro.chesscrificeapi.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
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
    public Map<String, Object> getChessPlayer(@PathVariable String username) {
        Map profile = restClient
                .get()
                .uri("/player/{username}", username)
                .retrieve()
                .body(Map.class);

        Map stats = restClient
                .get()
                .uri("/player/{username}/stats", username)
                .retrieve()
                .body(Map.class);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("username", profile.get("username"));
        result.put("name", profile.get("name"));
        result.put("title", profile.get("title"));
        result.put("followers", profile.get("followers"));
        result.put("status", profile.get("status"));
        result.put("league", profile.get("league"));
        result.put("is_streamer", profile.get("is_streamer"));

        result.put("rapidRating", getRating(stats, "chess_rapid"));
        result.put("blitzRating", getRating(stats, "chess_blitz"));
        result.put("bulletRating", getRating(stats, "chess_bullet"));
        result.put("dailyRating", getRating(stats, "chess_daily"));

        return result;
    }

    private Object getRating(Map stats, String category) {
        if (stats == null || !stats.containsKey(category)) {
            return "N/A";
        }

        Object categoryObject = stats.get(category);

        if (!(categoryObject instanceof Map)) {
            return "N/A";
        }

        Map categoryMap = (Map) categoryObject;
        Object lastObject = categoryMap.get("last");

        if (!(lastObject instanceof Map)) {
            return "N/A";
        }

        Map lastMap = (Map) lastObject;
        Object rating = lastMap.get("rating");

        return rating != null ? rating : "N/A";
    }
}
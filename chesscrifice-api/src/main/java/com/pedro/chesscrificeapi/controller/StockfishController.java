package com.pedro.chesscrificeapi.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/engine")
@CrossOrigin(origins = "*")
public class StockfishController {

    @Value("${stockfish.path:engines/stockfish.exe}")
    private String stockfishPath;

    @PostMapping("/best-move")
    public EngineMoveResponse getBestMove(@RequestBody EngineMoveRequest request) throws Exception {
        String executablePath = Path.of(stockfishPath).toAbsolutePath().toString();

        Process process = new ProcessBuilder(executablePath)
                .redirectErrorStream(true)
                .start();

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()));

        BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(process.getOutputStream()));

        int depth = getDepthByPhase(request.phase());

        sendCommand(writer, "uci");
        waitFor(reader, "uciok");

        sendCommand(writer, "isready");
        waitFor(reader, "readyok");

        sendCommand(writer, "ucinewgame");
        sendCommand(writer, "position fen " + request.fen());
        sendCommand(writer, "go depth " + depth);

        String bestMove = waitBestMove(reader);

        sendCommand(writer, "quit");
        process.destroy();

        if (bestMove == null || bestMove.length() < 4 || bestMove.equals("0000")) {
            throw new RuntimeException("Stockfish não encontrou movimento.");
        }

        String from = bestMove.substring(0, 2);
        String to = bestMove.substring(2, 4);
        String promotion = bestMove.length() >= 5 ? bestMove.substring(4, 5) : null;

        return new EngineMoveResponse(bestMove, from, to, promotion, depth);
    }

    private int getDepthByPhase(Integer phase) {
        if (phase == null) {
            return 1;
        }

        if (phase <= 1) {
            return 1;
        }

        if (phase == 2) {
            return 2;
        }

        if (phase == 3) {
            return 3;
        }

        if (phase == 4) {
            return 5;
        }

        return 8;
    }

    private void sendCommand(BufferedWriter writer, String command) throws IOException {
        writer.write(command);
        writer.newLine();
        writer.flush();
    }

    private void waitFor(BufferedReader reader, String expected) throws IOException {
        String line;

        while ((line = reader.readLine()) != null) {
            if (line.contains(expected)) {
                return;
            }
        }
    }

    private String waitBestMove(BufferedReader reader) throws IOException {
        String line;

        while ((line = reader.readLine()) != null) {
            if (line.startsWith("bestmove")) {
                String[] parts = line.split(" ");

                if (parts.length >= 2) {
                    return parts[1];
                }
            }
        }

        return null;
    }

    public record EngineMoveRequest(
            String fen,
            Integer phase) {
    }

    public record EngineMoveResponse(
            String bestMove,
            String from,
            String to,
            String promotion,
            Integer depth) {
    }
}
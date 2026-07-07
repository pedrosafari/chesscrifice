import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import axios from "axios";
import { Chess } from "chess.js";
import SoulBackground from "../components/SoulBackground";
import { monsters } from "../data/monsters";

const moveSound = require("../assets/sounds/move.wav");
const phaseMusic = require("../assets/audio/phase_music.mp3");
const devilMusic = require("../assets/audio/devil_music.mp3");

const devilImages = {
  closed: require("../assets/opponents/devil_closed.png"),
  mid: require("../assets/opponents/devil_mid.png"),
  open: require("../assets/opponents/devil_open.png"),
};

const heartGif = require("../assets/ui/heart.gif");

const API_URL = "http://localhost:8080/api";
const MATCH_TIME = 300;
const DEVIL_REVEAL_MOVE = 6;

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

function pieceSymbol(piece) {
  if (!piece) return "";

  const symbols = {
    wp: "♙",
    wn: "♘",
    wb: "♗",
    wr: "♖",
    wq: "♕",
    wk: "♔",
    bp: "♟",
    bn: "♞",
    bb: "♝",
    br: "♜",
    bq: "♛",
    bk: "♚",
  };

  return symbols[`${piece.color}${piece.type}`] || "";
}

export default function GameScreen({ onBackToMenu, shouldLoadSave = false }) {
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [phase, setPhase] = useState(1);
  const [phaseMoveCount, setPhaseMoveCount] = useState(0);
  const [devilStage, setDevilStage] = useState("closed");
  const [sanity, setSanity] = useState(100);
  const [timeLeft, setTimeLeft] = useState(MATCH_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [monsterThinking, setMonsterThinking] = useState(false);
  const [turnMessage, setTurnMessage] = useState("SUA VEZ");
  const [dialogue, setDialogue] = useState(monsters[0].openingLine);
  const [saveId, setSaveId] = useState(null);
  const [apiMessage, setApiMessage] = useState("");

  const movePlayer = useAudioPlayer(moveSound);
  const phaseMusicPlayer = useAudioPlayer(phaseMusic);
  const devilMusicPlayer = useAudioPlayer(devilMusic);
  const currentMusicRef = useRef(null);

  const monster = monsters.find((item) => item.phase === phase) || monsters[0];
  const isFinalPhase = phase === 5;

  const displayMonsterName =
    isFinalPhase && devilStage === "open" ? "O Diabo" : monster.name;

  const currentDevilImage = devilImages[devilStage];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${String(seconds).padStart(2, "0")}`;

  const board = useMemo(() => {
    return ranks.map((rank) =>
      files.map((file) => {
        const square = `${file}${rank}`;

        return {
          square,
          piece: game.get(square),
        };
      })
    );
  }, [game]);

  function stopAllMusic() {
    try {
      phaseMusicPlayer.pause();
      devilMusicPlayer.pause();
    } catch (error) {
      console.log("Erro ao parar músicas:", error);
    }
  }

  function startCommonMusic() {
    try {
      if (currentMusicRef.current === "common") {
        return;
      }

      stopAllMusic();

      phaseMusicPlayer.loop = true;
      phaseMusicPlayer.volume = 0.35;
      phaseMusicPlayer.seekTo(0);
      phaseMusicPlayer.play();

      currentMusicRef.current = "common";
    } catch (error) {
      console.log("Erro ao tocar música comum:", error);
    }
  }

  function startDevilMusic() {
    try {
      if (currentMusicRef.current === "devil") {
        return;
      }

      stopAllMusic();

      devilMusicPlayer.loop = true;
      devilMusicPlayer.volume = 0.45;
      devilMusicPlayer.seekTo(0);
      devilMusicPlayer.play();

      currentMusicRef.current = "devil";
    } catch (error) {
      console.log("Erro ao tocar música do Diabo:", error);
    }
  }

  function playMoveSound() {
    try {
      movePlayer.seekTo(0);
      movePlayer.play();
    } catch (error) {
      console.log("Erro ao tocar som:", error);
    }
  }

  function triggerDevilReveal() {
    if (phase !== 5 || devilStage !== "closed") {
      return;
    }

    setDevilStage("mid");
    setDialogue("A Dama de Branco parou de fingir.");

    setTimeout(() => {
      setDevilStage("open");
      setDialogue("Não era uma dama. Era o Diabo.");
    }, 1000);
  }

  function getSanityDamageByMove(monsterMove, monsterGaveCheck, monsterGaveMate) {
    if (monsterGaveMate) {
      return 999;
    }

    let damage = 0;

    if (monsterMove?.captured) {
      const pieceDamage = {
        p: 0,
        n: 3,
        b: 3,
        r: 6,
        q: 10,
        k: 999,
      };

      damage += pieceDamage[monsterMove.captured] || 0;
    }

    if (monsterGaveCheck) {
      damage += 2;
    }

    if (phase === 5) {
      return Math.min(damage, 8);
    }

    if (phase === 4) {
      return Math.min(damage, 10);
    }

    return Math.min(damage, 12);
  }

  function applySanityDamage(damage) {
    if (damage <= 0) {
      return;
    }

    setSanity((previousSanity) => {
      const newSanity = Math.max(0, previousSanity - damage);

      if (newSanity <= 0) {
        setGameOver(true);
        setGameOverReason("SUA SANIDADE CHEGOU A ZERO");
        setTurnMessage("FIM DE JOGO");
        setDialogue("Sua sanidade acabou. O tabuleiro venceu você.");
      }

      return newSanity;
    });
  }

  async function saveProgress() {
    const saveData = {
      playerName: "Pedro",
      currentPhase: phase,
      currentFen: game.fen(),
      currentMonster: displayMonsterName,
      sanity,
      timeLeft,
      gameFinished: gameOver || game.isCheckmate(),
    };

    try {
      let saved;

      if (saveId) {
        const response = await axios.put(`${API_URL}/saves/${saveId}`, saveData);
        saved = response.data;
      } else {
        const response = await axios.post(`${API_URL}/saves`, saveData);
        saved = response.data;
        setSaveId(saved.id);
      }

      setApiMessage("Progresso salvo no backend.");
      setDialogue("A partida foi gravada no livro das peças mortas.");
    } catch (error) {
      console.error(error);
      setApiMessage("Erro ao salvar progresso.");
      setDialogue("A conexão com o backend falhou.");
    }
  }

  async function loadLatestSave() {
    try {
      const response = await axios.get(`${API_URL}/saves`);
      const saves = response.data;

      if (!saves || saves.length === 0) {
        setApiMessage("Nenhum save encontrado.");
        setDialogue("Nenhum progresso foi encontrado no backend.");
        return;
      }

      const latestSave = [...saves].sort((a, b) => b.id - a.id)[0];
      const loadedPhase = latestSave.currentPhase || 1;
      const loadedMonster =
        monsters.find((item) => item.phase === loadedPhase) || monsters[0];

      setSaveId(latestSave.id);
      setPhase(loadedPhase);
      setSanity(latestSave.sanity ?? 100);
      setTimeLeft(latestSave.timeLeft ?? MATCH_TIME);
      setGameOver(Boolean(latestSave.gameFinished));
      setGameOverReason(latestSave.gameFinished ? "PARTIDA FINALIZADA" : "");
      setMonsterThinking(false);
      setTurnMessage(latestSave.gameFinished ? "FIM DE JOGO" : "SUA VEZ");
      setPhaseMoveCount(0);
      setDevilStage("closed");

      if (latestSave.currentFen && latestSave.currentFen !== "start") {
        setGame(new Chess(latestSave.currentFen));
      } else {
        setGame(new Chess());
      }

      setSelectedSquare(null);
      setPossibleMoves([]);
      setDialogue(
        `Save carregado. ${loadedMonster.name} ainda está esperando sua próxima jogada.`
      );
      setApiMessage("Progresso carregado do backend.");
    } catch (error) {
      console.error(error);
      setApiMessage("Erro ao carregar progresso.");
      setDialogue("Não foi possível carregar o progresso do backend.");
    }
  }

  useEffect(() => {
    if (gameOver) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          setGameOver(true);
          setGameOverReason("O TEMPO ACABOU");
          setTurnMessage("FIM DE JOGO");
          setDialogue("O tempo acabou. O coração parou antes da última jogada.");
          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (phase === 5 && devilStage === "open") {
      startDevilMusic();
    } else {
      startCommonMusic();
    }
  }, [phase, devilStage]);

  useEffect(() => {
    return () => {
      stopAllMusic();
      currentMusicRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (shouldLoadSave) {
      loadLatestSave();
    }
  }, [shouldLoadSave]);

  function showPossibleMoves(square) {
    const moves = game.moves({
      square,
      verbose: true,
    });

    const destinations = moves.map((move) => move.to);

    setPossibleMoves(destinations);
  }

  async function makeMonsterMove(nextGame) {
    const legalMoves = nextGame.moves({ verbose: true });

    if (legalMoves.length === 0) {
      return null;
    }

    try {
      const response = await axios.post(`${API_URL}/engine/best-move`, {
        fen: nextGame.fen(),
        phase,
      });

      const engineMove = response.data;

      const playedMove = nextGame.move({
        from: engineMove.from,
        to: engineMove.to,
        promotion: engineMove.promotion || "q",
      });

      return playedMove;
    } catch (error) {
      console.error("Erro ao chamar Stockfish:", error);

      const randomMove =
        legalMoves[Math.floor(Math.random() * legalMoves.length)];

      const playedMove = nextGame.move({
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion || "q",
      });

      return playedMove;
    }
  }

  async function handleSquarePress(square) {
    if (gameOver || monsterThinking) {
      return;
    }

    const piece = game.get(square);

    if (!selectedSquare) {
      if (!piece || piece.color !== "w") {
        setPossibleMoves([]);
        setDialogue("Você toca uma casa vazia. Alguma coisa toca de volta.");
        return;
      }

      setSelectedSquare(square);
      showPossibleMoves(square);
      setDialogue(
        `Você escolheu ${square.toUpperCase()}. Movimentos possíveis marcados no tabuleiro.`
      );
      return;
    }

    if (piece && piece.color === "w") {
      setSelectedSquare(square);
      showPossibleMoves(square);
      setDialogue(
        `Você escolheu ${square.toUpperCase()}. Movimentos possíveis marcados no tabuleiro.`
      );
      return;
    }

    const nextGame = new Chess(game.fen());

    try {
      const playerMove = nextGame.move({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });

      if (!playerMove) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        setDialogue("Esse movimento não é permitido.");
        return;
      }

      playMoveSound();
      setGame(new Chess(nextGame.fen()));
      setSelectedSquare(null);
      setPossibleMoves([]);

      if (phase === 5) {
        const nextPhaseMoveCount = phaseMoveCount + 1;

        setPhaseMoveCount(nextPhaseMoveCount);

        if (nextPhaseMoveCount >= DEVIL_REVEAL_MOVE) {
          triggerDevilReveal();
        }
      }

      if (nextGame.isCheckmate()) {
        setGame(nextGame);
        setGameOver(true);
        setGameOverReason("VOCÊ VENCEU");
        setTurnMessage("VITÓRIA");
        setDialogue("Xeque-mate. O monstro recua para dentro da própria sombra.");
        return;
      }

      setMonsterThinking(true);
      setTurnMessage("VEZ DO MONSTRO");

      const monsterMove = await makeMonsterMove(nextGame);

      setMonsterThinking(false);
      playMoveSound();

      const monsterGaveMate = nextGame.isCheckmate();

      if (monsterGaveMate) {
        setGame(nextGame);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setSanity(0);
        setGameOver(true);
        setGameOverReason("XEQUE-MATE");
        setTurnMessage("FIM DE JOGO");
        setDialogue("XEQUE-MATE. Sua sanidade se parte junto com o rei.");
        return;
      }

      const monsterGaveCheck =
        typeof nextGame.inCheck === "function"
          ? nextGame.inCheck()
          : nextGame.isCheck();

      const sanityDamage = getSanityDamageByMove(
        monsterMove,
        monsterGaveCheck,
        monsterGaveMate
      );

      applySanityDamage(sanityDamage);

      if (monsterGaveCheck) {
        setDialogue(
          sanityDamage > 0
            ? `XEQUE. O monstro feriu sua sanidade em ${sanityDamage} pontos.`
            : "XEQUE. O tabuleiro parece respirar contra você."
        );
      } else if (monsterMove?.captured) {
        setDialogue(
          sanityDamage > 0
            ? `O monstro capturou uma peça. Sanidade -${sanityDamage}.`
            : "O monstro capturou um peão."
        );
      } else {
        setDialogue(monster.openingLine);
      }

      setGame(nextGame);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setTurnMessage("SUA VEZ");
    } catch (error) {
      console.error(error);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setMonsterThinking(false);
      setTurnMessage("SUA VEZ");
      setDialogue("Esse movimento não é permitido.");
    }
  }

  function resetMatch() {
    setGame(new Chess());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setPhaseMoveCount(0);
    setDevilStage("closed");
    setSanity(100);
    setTimeLeft(MATCH_TIME);
    setGameOver(false);
    setGameOverReason("");
    setMonsterThinking(false);
    setTurnMessage("SUA VEZ");
    setDialogue(monster.openingLine);
  }

  function nextPhase() {
    const next = Math.min(5, phase + 1);
    const nextMonster =
      monsters.find((item) => item.phase === next) || monsters[0];

    setPhase(next);
    setGame(new Chess());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setPhaseMoveCount(0);
    setDevilStage("closed");
    setSanity(100);
    setTimeLeft(MATCH_TIME);
    setGameOver(false);
    setGameOverReason("");
    setMonsterThinking(false);
    setTurnMessage("SUA VEZ");
    setDialogue(nextMonster.openingLine);
  }

  function previousPhase() {
    const previous = Math.max(1, phase - 1);
    const previousMonster =
      monsters.find((item) => item.phase === previous) || monsters[0];

    setPhase(previous);
    setGame(new Chess());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setPhaseMoveCount(0);
    setDevilStage("closed");
    setSanity(100);
    setTimeLeft(MATCH_TIME);
    setGameOver(false);
    setGameOverReason("");
    setMonsterThinking(false);
    setTurnMessage("SUA VEZ");
    setDialogue(previousMonster.openingLine);
  }

  return (
    <View style={styles.page}>
      <SoulBackground />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={onBackToMenu}>
            <Text style={styles.topButton}>MENU</Text>
          </Pressable>

          <Text style={styles.phase}>FASE {phase}</Text>

          <Pressable onPress={resetMatch}>
            <Text style={styles.topButton}>RESET</Text>
          </Pressable>
        </View>

        {isFinalPhase && (
          <View style={styles.opponentPortrait}>
            <Image
              source={currentDevilImage}
              style={styles.opponentImage}
              resizeMode="contain"
            />
          </View>
        )}

        <Text style={styles.monsterName}>{displayMonsterName}</Text>

        <Text style={styles.monsterDescription}>{monster.description}</Text>

        <Text style={styles.sanity}>SANIDADE: {sanity}</Text>

        <View style={styles.timerBox}>
          <Image source={heartGif} style={styles.heartGif} />
          <Text style={styles.timerText}>{formattedTime}</Text>
        </View>

        {gameOver && (
          <Text style={styles.gameOverText}>FIM DE JOGO — {gameOverReason}</Text>
        )}

        <Text style={styles.turnIndicator}>
          {monsterThinking ? "O MONSTRO ESTÁ PENSANDO..." : `TURNO: ${turnMessage}`}
        </Text>

        <View style={styles.board}>
          {board.map((rowCells, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.boardRow}>
              {rowCells.map((cell, colIndex) => {
                const isDark = (rowIndex + colIndex) % 2 === 1;
                const isSelected = selectedSquare === cell.square;
                const isPossibleMove = possibleMoves.includes(cell.square);
                const hasEnemyPiece = cell.piece && cell.piece.color === "b";

                return (
                  <Pressable
                    key={cell.square}
                    style={[
                      styles.square,
                      isDark ? styles.darkSquare : styles.lightSquare,
                      isSelected && styles.selectedSquare,
                      isPossibleMove && styles.possibleMoveSquare,
                      isPossibleMove && hasEnemyPiece && styles.captureMoveSquare,
                    ]}
                    onPress={() => handleSquarePress(cell.square)}
                  >
                    {isPossibleMove && !cell.piece && (
                      <View style={styles.moveDot} />
                    )}

                    {isPossibleMove && hasEnemyPiece && (
                      <View style={styles.captureRing} />
                    )}

                    <Text
                      style={[
                        styles.piece,
                        cell.piece?.color === "w"
                          ? styles.whitePiece
                          : styles.blackPiece,
                      ]}
                    >
                      {pieceSymbol(cell.piece)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.dialogueBox}>
          <Text style={styles.dialogue}>{dialogue}</Text>
        </View>

        <View style={styles.bottomButtons}>
          <Pressable style={styles.smallButton} onPress={previousPhase}>
            <Text style={styles.smallButtonText}>FASE ANTERIOR</Text>
          </Pressable>

          <Pressable style={styles.smallButton} onPress={saveProgress}>
            <Text style={styles.smallButtonText}>SALVAR</Text>
          </Pressable>

          <Pressable style={styles.smallButton} onPress={nextPhase}>
            <Text style={styles.smallButtonText}>PRÓXIMA FASE</Text>
          </Pressable>
        </View>

        {apiMessage ? <Text style={styles.apiMessage}>{apiMessage}</Text> : null}
      </ScrollView>
    </View>
  );
}

const BOARD_SIZE = 320;
const SQUARE_SIZE = BOARD_SIZE / 8;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#050000",
    overflow: "hidden",
    position: "relative",
  },

  container: {
    flexGrow: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    paddingTop: 70,
    paddingBottom: 40,
    zIndex: 1,
  },

  topBar: {
    position: "absolute",
    top: 24,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  topButton: {
    color: "#d8d1c1",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "800",
  },

  phase: {
    color: "#d8d1c1",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "800",
  },

  opponentPortrait: {
    width: 340,
    height: 240,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 0,
    overflow: "visible",
  },

  opponentImage: {
    width: 340,
    height: 240,
  },

  monsterName: {
    color: "#f1eee6",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  monsterDescription: {
    color: "#aaa196",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 8,
  },

  sanity: {
    color: "#c94c4c",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
  },

  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
  },

  heartGif: {
    width: 42,
    height: 42,
  },

  timerText: {
    color: "#f1eee6",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },

  gameOverText: {
    color: "#ff3b3b",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 18,
    textAlign: "center",
  },

  turnIndicator: {
    color: "#d8d1c1",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 18,
    textAlign: "center",
  },

  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    borderWidth: 3,
    borderColor: "#75486f",
    backgroundColor: "#111",
    overflow: "hidden",
    shadowColor: "#b30000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },

  boardRow: {
    flexDirection: "row",
    width: "100%",
    height: SQUARE_SIZE,
  },

  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },

  lightSquare: {
    backgroundColor: "#d6c7a1",
  },

  darkSquare: {
    backgroundColor: "#b1aeae62",
  },

  selectedSquare: {
    borderWidth: 3,
    borderColor: "#ffffff",
    backgroundColor: "#75486f",
  },

  possibleMoveSquare: {
    backgroundColor: "#ffffff",
  },

  captureMoveSquare: {
    backgroundColor: "#721b1b",
  },

  moveDot: {
    position: "absolute",
    width: 13,
    height: 13,
    borderRadius: 999,
    backgroundColor: "#75486f",
  },

  captureRing: {
    position: "absolute",
    width: SQUARE_SIZE - 10,
    height: SQUARE_SIZE - 10,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "rgba(255, 75, 75, 0.9)",
  },

  piece: {
    fontSize: 36,
    lineHeight: 39,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },

  whitePiece: {
    color: "#ffffff",
  },

  blackPiece: {
    color: "#000000",
  },

  dialogueBox: {
    width: "100%",
    minHeight: 78,
    backgroundColor: "#130707",
    borderWidth: 1,
    borderColor: "#6b1d1d",
    marginTop: 24,
    padding: 16,
    borderRadius: 10,
  },

  dialogue: {
    color: "#e8e0cc",
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
  },

  bottomButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
    justifyContent: "center",
  },

  smallButton: {
    backgroundColor: "#210909",
    borderWidth: 1,
    borderColor: "#6b1d1d",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  smallButtonText: {
    color: "#d8d1c1",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "800",
  },

  apiMessage: {
    color: "#8f8f8f",
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
  },
});

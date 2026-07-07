import SoulBackground from "../components/SoulBackground";
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useAudioPlayer } from "expo-audio";
import axios from "axios";
import { Chess } from "chess.js";
import { monsters } from "../data/monsters";

const moveSound = require("../assets/sounds/move.wav");

const API_URL = "http://localhost:8080/api";

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
  const [sanity, setSanity] = useState(100);
  const [dialogue, setDialogue] = useState(monsters[0].openingLine);
  const [saveId, setSaveId] = useState(null);
  const [apiMessage, setApiMessage] = useState("");
  const [externalPlayer, setExternalPlayer] = useState(null);
  const movePlayer = useAudioPlayer(moveSound);
  const monster = monsters.find((item) => item.phase === phase) || monsters[0];

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

  function playMoveSound() {
  try {
    movePlayer.seekTo(0);
    movePlayer.play();
  } catch (error) {
    console.log("Erro ao tocar som:", error);
  }
}

  async function saveProgress() {
    const saveData = {
      playerName: "Pedro",
      currentPhase: phase,
      currentFen: game.fen(),
      currentMonster: monster.name,
      sanity: sanity,
      gameFinished: game.isCheckmate(),
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

      setSaveId(latestSave.id);
      setPhase(latestSave.currentPhase || 1);
      setSanity(latestSave.sanity ?? 100);

      if (latestSave.currentFen && latestSave.currentFen !== "start") {
        setGame(new Chess(latestSave.currentFen));
      } else {
        setGame(new Chess());
      }

      const loadedMonster =
        monsters.find((item) => item.phase === latestSave.currentPhase) ||
        monsters[0];

      setSelectedSquare(null);
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

  async function loadExternalChessData() {
    try {
      const response = await axios.get(
        `${API_URL}/external/chess-player/hikaru`
      );

      const data = response.data;

      setExternalPlayer(data);
      setApiMessage("API externa Chess.com carregada.");
      setDialogue(
        `Dados externos carregados: ${data.name || data.username}, título ${
          data.title || "N/A"
        }.`
      );
    } catch (error) {
      console.error(error);
      setApiMessage("Erro ao carregar API externa.");
      setDialogue("A entidade tentou consultar outro tabuleiro, mas a API falhou.");
    }
  }

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


  function makeMonsterMove(nextGame) {
    const legalMoves = nextGame.moves();

    if (legalMoves.length === 0) return;

    const randomMove =
      legalMoves[Math.floor(Math.random() * legalMoves.length)];

    nextGame.move(randomMove);
  }

  function handleSquarePress(square) {
    const piece = game.get(square);

    if (!selectedSquare) {
      if (!piece || piece.color !== "w") {
        setDialogue("Você toca uma casa vazia. Alguma coisa toca de volta.");
        return;
      }

      setSelectedSquare(square);
setDialogue(`Você escolheu ${square.toUpperCase()}.`);
return;
    }

    const nextGame = new Chess(game.fen());

    try {
      const move = nextGame.move({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });

      if (!move) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        setDialogue("Esse movimento não é permitido.");
        return;
      }

      if (nextGame.isCheckmate()) {
        setGame(nextGame);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setDialogue("Xeque-mate. O monstro recua para dentro da própria sombra.");
        return;
      }

      makeMonsterMove(nextGame);

      if (nextGame.isCheckmate()) {
        setGame(nextGame);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setSanity((prev) => Math.max(0, prev - 25));
        setDialogue("Xeque-mate. Você perdeu algo que não sabe nomear.");
        return;
      }

      const isInCheck =
        typeof nextGame.inCheck === "function"
          ? nextGame.inCheck()
          : nextGame.isCheck();

      if (isInCheck) {
        setSanity((prev) => Math.max(0, prev - 8));
        setDialogue("XEQUE. O tabuleiro parece respirar contra você.");
      } else {
        setDialogue(monster.openingLine);
      }

      playMoveSound();
      setGame(nextGame);
      setSelectedSquare(null);
      setPossibleMoves([]);
    } catch (error) {
  setSelectedSquare(null);
  setPossibleMoves([]);
  setDialogue("Esse movimento não é permitido.");
}
  }

  function resetMatch() {
  setGame(new Chess());
  setSelectedSquare(null);
  setPossibleMoves([]);
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
    setDialogue(nextMonster.openingLine);
  }

  function previousPhase() {
    const previous = Math.max(1, phase - 1);
    const previousMonster =
      monsters.find((item) => item.phase === previous) || monsters[0];

    setPhase(previous);
    setGame(new Chess());
    setSelectedSquare(null);
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

      <Text style={styles.monsterName}>{monster.name}</Text>

      <Text style={styles.monsterDescription}>{monster.description}</Text>

      <Text style={styles.sanity}>SANIDADE: {sanity}</Text>

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
          <Text style={styles.smallButtonText}>FASE -</Text>
        </Pressable>

        <Pressable style={styles.smallButton} onPress={saveProgress}>
          <Text style={styles.smallButtonText}>SALVAR</Text>
        </Pressable>

        <Pressable style={styles.smallButton} onPress={loadExternalChessData}>
          <Text style={styles.smallButtonText}>API</Text>
        </Pressable>

        <Pressable style={styles.smallButton} onPress={nextPhase}>
          <Text style={styles.smallButtonText}>FASE +</Text>
        </Pressable>
      </View>

      {externalPlayer && (
        <View style={styles.externalBox}>
          <Text style={styles.externalTitle}>API EXTERNA CHESS.COM</Text>

          <Text style={styles.externalText}>
            Jogador: {externalPlayer.name || externalPlayer.username}
          </Text>

          <Text style={styles.externalText}>
            Título: {externalPlayer.title || "N/A"}
          </Text>

          <Text style={styles.externalText}>
            Seguidores: {externalPlayer.followers}
          </Text>
        </View>
      )}

      {apiMessage ? <Text style={styles.apiMessage}>{apiMessage}</Text> : null}
    </ScrollView>
  </View>
);
}

const BOARD_SIZE = 320;
const SQUARE_SIZE = BOARD_SIZE / 8;

const styles = StyleSheet.create({
 container: {
  flexGrow: 1,
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  paddingTop: 70,
  paddingBottom: 40,
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
  },

  phase: {
    color: "#d8d1c1",
    fontSize: 12,
    letterSpacing: 2,
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
    marginBottom: 18,
  },

 board: {
  width: BOARD_SIZE,
  height: BOARD_SIZE,
  borderWidth: 3,
  borderColor: "#6b1d1d",
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
  backgroundColor: "#c06464",
},
selectedSquare: {
  borderWidth: 3,
  borderColor: "#ffdf8a",
  backgroundColor: "#a13636",
},

possibleMoveSquare: {
  backgroundColor: "#58401d",
},
captureMoveSquare: {
  backgroundColor: "#721b1b",
},
piece: {
  fontSize: 36,
  lineHeight: 39,
  textAlign: "center",
  textShadowColor: "rgba(0, 0, 0, 0.85)",
  textShadowOffset: { width: 1, height: 2 },
  textShadowRadius: 3,
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
    fontSize: 22,
    lineHeight: 20,
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
  },

  externalBox: {
    width: "100%",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#100d0c",
    borderWidth: 1,
    borderColor: "#3a302b",
    borderRadius: 8,
  },

  externalTitle: {
    color: "#d8d1c1",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 6,
    textAlign: "center",
  },

  externalText: {
    color: "#aaa196",
    fontSize: 12,
    textAlign: "center",
  },

  apiMessage: {
    color: "#8f8f8f",
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
  },
  moveDot: {
  position: "absolute",
  width: 13,
  height: 13,
  borderRadius: 999,
  backgroundColor: "rgba(255, 230, 150, 0.75)",
},

captureRing: {
  position: "absolute",
  width: SQUARE_SIZE - 10,
  height: SQUARE_SIZE - 10,
  borderRadius: 999,
  borderWidth: 3,
  borderColor: "rgba(255, 75, 75, 0.9)",
},
whitePiece: {
  color: "#ffffff",
},
blackPiece: {
  color: "#000000",
},
page: {
  flex: 1,
  backgroundColor: "#050000",
  overflow: "hidden",
},

});
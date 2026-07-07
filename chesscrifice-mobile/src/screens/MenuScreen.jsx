import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import axios from "axios";
import SoulBackground from "../components/SoulBackground";

const API_URL = "http://localhost:8080/api";

export default function MenuScreen({ onStartGame, onContinue }) {
  const [playerSearch, setPlayerSearch] = useState("hikaru");
  const [externalPlayer, setExternalPlayer] = useState(null);
  const [oracleMessage, setOracleMessage] = useState("");

  async function searchChessPlayer() {
    const username = playerSearch.trim().toLowerCase();

    if (!username) {
      setOracleMessage("Digite um usuário do Chess.com.");
      setExternalPlayer(null);
      return;
    }

    try {
      setOracleMessage("Consultando o Oráculo...");

      const response = await axios.get(
        `${API_URL}/external/chess-player/${username}`
      );

      setExternalPlayer(response.data);
      setOracleMessage("Jogador encontrado na API externa.");
    } catch (error) {
      console.error(error);
      setExternalPlayer(null);
      setOracleMessage("Jogador não encontrado ou backend desligado.");
    }
  }

  return (
    <View style={styles.page}>
      <SoulBackground />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.kicker}>PSYCHOLOGICAL CHESS HORROR</Text>

        <Text style={styles.title}>CHESSCRIFICE</Text>

        <Text style={styles.subtitle}>
          Sacrifique peças. Preserve sua mente.
        </Text>

        <View style={styles.buttons}>
          <Pressable style={styles.button} onPress={onStartGame}>
            <Text style={styles.buttonText}>NOVO JOGO</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onContinue}>
            <Text style={styles.secondaryButtonText}>CONTINUAR</Text>
          </Pressable>
        </View>

        <View style={styles.oracleBox}>
          <Text style={styles.oracleTitle}>ORÁCULO DO XADREZ</Text>

          <Text style={styles.oracleDescription}>
            Busque um jogador real do Chess.com. O app chama o backend Spring Boot,
            e o backend consulta a API externa.
          </Text>

          <TextInput
            style={styles.searchInput}
            value={playerSearch}
            onChangeText={setPlayerSearch}
            placeholder="ex: hikaru, gothamchess, magnuscarlsen"
            placeholderTextColor="#6f625a"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable style={styles.searchButton} onPress={searchChessPlayer}>
            <Text style={styles.searchButtonText}>BUSCAR JOGADOR</Text>
          </Pressable>

          {oracleMessage ? (
            <Text style={styles.oracleMessage}>{oracleMessage}</Text>
          ) : null}

          {externalPlayer && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>RESULTADO DO ORÁCULO</Text>

              <Text style={styles.resultText}>
                Jogador: {externalPlayer.name || externalPlayer.username}
              </Text>

              <Text style={styles.resultText}>
                Usuário: {externalPlayer.username}
              </Text>

              <Text style={styles.resultText}>
                Título: {externalPlayer.title || "N/A"}
              </Text>

              <Text style={styles.resultText}>
                Ranking/Liga: {externalPlayer.league || "N/A"}
              </Text>

              <Text style={styles.resultText}>
                Rapid: {externalPlayer.rapidRating}
              </Text>

              <Text style={styles.resultText}>
                Blitz: {externalPlayer.blitzRating}
              </Text>

              <Text style={styles.resultText}>
                Bullet: {externalPlayer.bulletRating}
              </Text>

              <Text style={styles.resultText}>
                Daily: {externalPlayer.dailyRating}
              </Text>

              <Text style={styles.resultText}>
                Seguidores: {externalPlayer.followers}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.techBox}>
          <Text style={styles.techTitle}>REQUISITOS DO PROJETO</Text>

          <Text style={styles.techItem}>React Native: aplicativo mobile</Text>
          <Text style={styles.techItem}>Spring Boot: backend REST</Text>
          <Text style={styles.techItem}>H2 Database: persistência dos saves</Text>
          <Text style={styles.techItem}>API própria: salvar e carregar progresso</Text>
          <Text style={styles.techItem}>API externa: Chess.com PubAPI</Text>
        </View>

        <View style={styles.howToBox}>
          <Text style={styles.howToTitle}>COMO JOGAR</Text>

          <Text style={styles.howToText}>
            Você controla as peças brancas. Cada fase representa um monstro diferente.
          </Text>

          <Text style={styles.howToText}>
            Clique em uma peça para ver os movimentos possíveis. Depois clique em uma casa marcada para mover.
          </Text>

          <Text style={styles.howToText}>
            Salve seu progresso e avance até enfrentar a Dama de Branco.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#050000",
    overflow: "hidden",
    position: "relative",
  },

  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingTop: 70,
    paddingBottom: 40,
    zIndex: 1,
  },

  kicker: {
    color: "#9b8b80",
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 18,
    textAlign: "center",
  },

  title: {
    color: "#f1eee6",
    fontSize: 42,
    letterSpacing: 4,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(160, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },

  subtitle: {
    color: "#c2b5a8",
    fontSize: 14,
    marginTop: 12,
    marginBottom: 42,
    textAlign: "center",
  },

  buttons: {
    width: "100%",
    gap: 14,
  },

  button: {
    backgroundColor: "#e8e0cc",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#14110f",
    fontWeight: "900",
    letterSpacing: 2,
  },

  secondaryButton: {
    backgroundColor: "rgba(20, 5, 5, 0.9)",
    borderWidth: 1,
    borderColor: "#6b1d1d",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#e8e0cc",
    fontWeight: "900",
    letterSpacing: 2,
  },

  oracleBox: {
    width: "100%",
    marginTop: 22,
    padding: 14,
    backgroundColor: "rgba(16, 5, 5, 0.92)",
    borderWidth: 1,
    borderColor: "#6b1d1d",
    borderRadius: 10,
  },

  oracleTitle: {
    color: "#e8e0cc",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 6,
  },

  oracleDescription: {
    color: "#9b8b80",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 10,
  },

  searchInput: {
    backgroundColor: "#080202",
    borderWidth: 1,
    borderColor: "#3a1616",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#f1eee6",
    fontSize: 13,
    marginBottom: 10,
  },

  searchButton: {
    backgroundColor: "#3a0f0f",
    borderWidth: 1,
    borderColor: "#8b2525",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  searchButtonText: {
    color: "#f1eee6",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },

  oracleMessage: {
    color: "#9b8b80",
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
  },

  resultBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(8, 2, 2, 0.92)",
    borderWidth: 1,
    borderColor: "#3a302b",
    borderRadius: 8,
  },

  resultTitle: {
    color: "#d8d1c1",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: "center",
  },

  resultText: {
    color: "#aaa196",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 3,
  },

  techBox: {
    width: "100%",
    marginTop: 14,
    padding: 14,
    backgroundColor: "rgba(15, 4, 4, 0.92)",
    borderWidth: 1,
    borderColor: "#3a1616",
    borderRadius: 10,
  },

  techTitle: {
    color: "#e8e0cc",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 10,
  },

  techItem: {
    color: "#9b8b80",
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },

  howToBox: {
    width: "100%",
    marginTop: 14,
    padding: 14,
    backgroundColor: "rgba(18, 5, 5, 0.92)",
    borderWidth: 1,
    borderColor: "#6b1d1d",
    borderRadius: 10,
  },

  howToTitle: {
    color: "#e8e0cc",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 10,
  },

  howToText: {
    color: "#b6a89b",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    textAlign: "center",
  },
});
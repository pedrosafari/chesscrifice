import SoulBackground from "../components/SoulBackground";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function MenuScreen({ onStartGame, onContinue }) {
  return (
    <View style={styles.container}>
      <SoulBackground />
      <Text style={styles.kicker}>PSYCHOLOGICAL CHESS HORROR</Text>

      <Text style={styles.title}>CHESSCRIFICE</Text>

      <Text style={styles.subtitle}>
        Sacrifique peças. Preserve sua mente.
      </Text>

      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={onStartGame}>
          <Text style={styles.buttonText}>NOVO JOGO</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>CONTINUAR</Text>
        </Pressable>
      </View>


      <View style={styles.techBox}>
  <Text style={styles.techTitle}>REQUISITOS DO PROJETO</Text>

  <Text style={styles.techItem}>React Native: aplicativo mobile</Text>
  <Text style={styles.techItem}>Spring Boot: backend REST</Text>
  <Text style={styles.techItem}>H2 Database: persistência dos saves</Text>
  <Text style={styles.techItem}>API própria: salvar e carregar progresso</Text>
  <Text style={styles.techItem}>API externa: dados públicos do Chess.com</Text>
</View>


<View style={styles.howToBox}>
  <Text style={styles.howToTitle}>COMO JOGAR</Text>

  <Text style={styles.howToText}>
    Você controla as peças brancas. Cada fase representa um monstro diferente.
  </Text>

  <Text style={styles.howToText}>
    Faça movimentos válidos no tabuleiro, salve seu progresso e avance pelas fases até enfrentar a Dama de Branco.
  </Text>

  <Text style={styles.howToText}>
    O objetivo é sobreviver ao jogo, preservar sua sanidade e vencer a entidade final.
  </Text>
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  kicker: {
    color: "#8f8f8f",
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 18,
  },
  title: {
    color: "#f1eee6",
    fontSize: 42,
    letterSpacing: 4,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "#b8b0a2",
    fontSize: 14,
    marginTop: 12,
    marginBottom: 42,
    textAlign: "center",
  },
  buttons: {
    gap: 14,
    width: "100%",
  },
  button: {
    backgroundColor: "#e8e0cc",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#14110f",
    fontWeight: "800",
    letterSpacing: 2,
  },
  techBox: {
  width: "100%",
  marginTop: 32,
  padding: 14,
  backgroundColor: "#0f0f0f",
  borderWidth: 1,
  borderColor: "#2d2622",
  borderRadius: 10,
},

techTitle: {
  color: "#e8e0cc",
  fontSize: 11,
  fontWeight: "800",
  letterSpacing: 2,
  textAlign: "center",
  marginBottom: 10,
},

techItem: {
  color: "#8f8f8f",
  fontSize: 12,
  marginBottom: 4,
  textAlign: "center",
},
howToBox: {
  width: "100%",
  marginTop: 14,
  padding: 14,
  backgroundColor: "#120f0e",
  borderWidth: 1,
  borderColor: "#3a302b",
  borderRadius: 10,
},

howToTitle: {
  color: "#e8e0cc",
  fontSize: 11,
  fontWeight: "800",
  letterSpacing: 2,
  textAlign: "center",
  marginBottom: 10,
},

howToText: {
  color: "#aaa196",
  fontSize: 12,
  lineHeight: 18,
  marginBottom: 8,
  textAlign: "center",
},
});
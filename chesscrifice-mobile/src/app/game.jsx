import { router, useLocalSearchParams } from "expo-router";
import GameScreen from "../screens/GameScreen";

export default function GameRoute() {
  const params = useLocalSearchParams();

  return (
    <GameScreen
      shouldLoadSave={params.load === "true"}
      onBackToMenu={() => router.back()}
    />
  );
}
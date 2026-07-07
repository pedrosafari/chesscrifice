import { useState } from "react";
import MenuScreen from "../screens/MenuScreen";
import GameScreen from "../screens/GameScreen";

export default function Index() {
  const [screen, setScreen] = useState("menu");
  const [shouldLoadSave, setShouldLoadSave] = useState(false);

  if (screen === "game") {
    return (
      <GameScreen
        shouldLoadSave={shouldLoadSave}
        onBackToMenu={() => {
          setScreen("menu");
          setShouldLoadSave(false);
        }}
      />
    );
  }

  return (
    <MenuScreen
      onStartGame={() => {
        setShouldLoadSave(false);
        setScreen("game");
      }}
      onContinue={() => {
        setShouldLoadSave(true);
        setScreen("game");
      }}
    />
  );
}
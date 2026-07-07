import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

const SOULS = Array.from({ length: 26 }).map((_, index) => ({
  id: index,
  left: (index * 37) % 100,
  size: 10 + (index % 5) * 5,
  duration: 6500 + (index % 6) * 900,
  delay: (index % 8) * 500,
  drift: index % 2 === 0 ? 22 : -22,
}));

function Soul({ soul }) {
  const progress = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();

  useEffect(() => {
    let active = true;

    function animate() {
      if (!active) return;

      progress.setValue(0);

      Animated.timing(progress, {
        toValue: 1,
        duration: soul.duration,
        delay: soul.delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        animate();
      });
    }

    animate();

    return () => {
      active = false;
      progress.stopAnimation();
    };
  }, []);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height + 80, -140],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, soul.drift, -soul.drift],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 0.7, 1],
    outputRange: [0, 0.5, 0.35, 0],
  });

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.25],
  });

  return (
    <Animated.View
      style={[
        styles.soul,
        {
          left: `${soul.left}%`,
          width: soul.size,
          height: soul.size * 2.2,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    >
      <View style={styles.soulHead} />
      <View style={styles.soulBody} />
      <View style={styles.soulTail} />
    </Animated.View>
  );
}

export default function SoulBackground() {
  return (
    <View pointerEvents="none" style={styles.container}>
      {SOULS.map((soul) => (
        <Soul key={soul.id} soul={soul} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#050000",
    overflow: "hidden",
  },

  soul: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },

  soulHead: {
    width: "75%",
    height: "35%",
    borderRadius: 999,
    backgroundColor: "rgba(230, 230, 210, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },

  soulBody: {
    marginTop: -2,
    width: "95%",
    height: "55%",
    borderRadius: 999,
    backgroundColor: "rgba(210, 210, 190, 0.16)",
  },

  soulTail: {
    marginTop: -4,
    width: 2,
    height: 18,
    backgroundColor: "rgba(230, 230, 210, 0.18)",
    borderRadius: 999,
  },
});
import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

// This BottomBar is likely NOT DONE

const screenWidth = Dimensions.get("window").width;
const screenW = screenWidth / 3.3;
const screenHeight = Dimensions.get("window").height;

export default function BottomBar({ navigation }: any) {
  const buttonPositions = useRef<number[]>([]);
  const position = useRef(new Animated.Value(-screenW / 2.5)).current; // Default to 0 for now
  const pages = ["Home", "Block", "Settings"];

  const moveBox = (index: number) => {
    if (buttonPositions.current[index] !== undefined) {
      const buttonCenter = buttonPositions.current[index]; // Center of the button
      const sliderWidth = screenW; // Width of the slider
      const newPosition = buttonCenter - sliderWidth; // Center the slider on the button's center

      Animated.timing(position, {
        toValue: newPosition,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }).start();
    }
  };

  return (
    <View style={styles.BottomBar}>
      {["home-outline", "lock-closed-outline", "settings-outline"].map(
        (icon, index) => (
          <TouchableOpacity
            key={index}
            style={styles.iconContainer}
            onPress={() => {
              moveBox(index);
              navigation.navigate(pages[index]);
            }}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout;
              buttonPositions.current[index] = x + 25; // Store the center of each button
            }}
            onPressIn={(ev) => {
              if (process.env.EXPO_OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            }}
            hitSlop={{ top: 20, bottom: 20, left: 35, right: 35 }}
          >
            <Icon name={icon} size={24} color="lightgray" />
          </TouchableOpacity>
        )
      )}
      <Animated.View
        style={[styles.slider, { transform: [{ translateX: position }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  BottomBar: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    height: screenHeight / 18,
    backgroundColor: "#191919",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 30,
  },
  slider: {
    position: "absolute",
    width: screenW,
    height: screenHeight / 18,
    backgroundColor: "#383838",
    borderRadius: 30,
    zIndex: 10,
  },
  iconContainer: {
    zIndex: 11,
  },
});

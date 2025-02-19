import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function BottomBar({ navigation }: any) {
  const buttonPositions = useRef<number[]>([]); // Store X positions dynamically
  const position = useRef(new Animated.Value(-37.66)).current; // Start position
  const pages = ["Home", "Block", "Settings"];

  const moveBox = (index: number) => {
    if (buttonPositions.current[index] !== undefined) {
      Animated.timing(position, {
        toValue: buttonPositions.current[index] - 85, // Center the slider
        duration: 300,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }).start();
    }
  };
  //
  return (
    <View style={styles.BottomBar}>
      {/* Animated Slider - Positioned dynamically */}

      {/* Navigation Buttons */}
      {["home-outline", "lock-closed-outline", "settings-outline"].map(
        (icon, index) => (
          <TouchableOpacity
            key={index}
            style={styles.iconContainer}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
            onPress={() => {
              moveBox(index);
              navigation.navigate(pages[index]);
            }}
            onLayout={(event) => {
              const { x } = event.nativeEvent.layout; // Get button position
              buttonPositions.current[index] = x; // Store center position
            }}
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
    bottom: 20,
    left: 10,
    right: 10,
    height: 50,
    backgroundColor: "#2C2C2C",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 25,
  },
  slider: {
    position: "absolute",
    width: 100, // Adjust slider width
    height: 40,
    bottom: 5,
    backgroundColor: "#515151",
    borderRadius: 25,
    zIndex: 10,
  },
  iconContainer: {
    zIndex: 11,
  },
});

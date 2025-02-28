// AppearanceSettings.tsx
import React, { useState } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";

const AppearanceSettings = ({ navigation }: any) => {
  const isFocused = useIsFocused();
  const [isDarkMode, setIsDarkMode] = useState(false);

  React.useEffect(() => {
    if (isFocused) {
      navigation.setOptions({ tabBarStyle: { display: "none" } });
    } else {
      navigation.setOptions({ tabBarStyle: undefined });
    }
  }, [isFocused]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkBackground : styles.lightBackground,
      ]}
    >
      <Text
        style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}
      >
        Appearance Settings
      </Text>
      <View style={styles.row}>
        <Text
          style={[
            styles.label,
            isDarkMode ? styles.darkText : styles.lightText,
          ]}
        >
          Dark Mode
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>
    </View>
  );
};

export default AppearanceSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  darkBackground: {
    backgroundColor: "#121212",
  },
  lightBackground: {
    backgroundColor: "#fff",
  },
  darkText: {
    color: "#fff",
  },
  lightText: {
    color: "#000",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  label: {
    fontSize: 18,
  },
});

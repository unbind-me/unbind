// AppearanceSettings.tsx
import React, { useContext, useState } from "react";
import { View, StyleSheet, Switch, Text } from "react-native";
import { useTheme, useNavigation } from "@react-navigation/native";
// import { ThemeContext } from "../ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

// WIP! Does not work.

const AppearanceSettings = () => {
  // const { isDark, toggleTheme } = useContext(ThemeContext);
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: colors.background },
    header: {
      fontSize: 20,
      marginBottom: 16,
      backgroundColor: colors.background,
      color: colors.text,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background,
    },
    label: { fontSize: 16, color: colors.text },
  });
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.header}>Appearance Settings</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Light Mode</Text>
          {/* <Switch value={isDark} onValueChange={toggleTheme} /> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AppearanceSettings;

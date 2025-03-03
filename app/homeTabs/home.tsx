import React from "react";
import { Text, View, StyleSheet, ScrollView, Platform } from "react-native";
import PieChart from "../components/PieChart";
import Wrapper from "../components/Wrapper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";

const Home = () => {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#272727",
    },
  });
  return (
    <SafeAreaProvider>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PieChart />
        <Wrapper />
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default Home;

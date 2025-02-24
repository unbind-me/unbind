import React from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import PieChart from "./PieChart";
import Wrapper from "./Wrapper";

const Home = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: "center", justifyContent: "center" }}
    >
      <PieChart />
      <Wrapper />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F1F",
  },
});

export default Home;

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
    marginTop: 100,
    flex: 1,
    backgroundColor: "#000000",
  },
});

export default Home;

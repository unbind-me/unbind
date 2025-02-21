import React from "react";
import { Text, View, StyleSheet } from "react-native";
import PieChart from "./PieChart";
import Wrapper from "./Wrapper";

const Home = () => {
  return (
    <View style={styles.container}>
      <PieChart />
      <Text style={{ color: "white" }}>3h on Instagram</Text>
      <Wrapper />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
});

export default Home;

import React from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import PieChart from "./PieChart"

const Home = () => {
  return (
    <View style={styles.container}>
      <PieChart/>
      <Text style={{color: "white"}}>3h on instagram gooner</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d0d0d",
  },
  stats: {
    width: 160,
    height: 160,
    position: "absolute",
    top: 100,
  },
});

export default Home;

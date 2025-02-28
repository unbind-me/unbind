import React from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import PieChart from "../components/PieChart";
import Wrapper from "../components/Wrapper";
import Constants from "expo-constants";

const Home = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // On Android, add padding for the status bar height
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
    backgroundColor: "#272727",
  },
  container: {
    flex: 1,
    backgroundColor: "#272727",
  },
});

export default Home;

import React from "react";
import { Text, View, StyleSheet, ScrollView, Platform } from "react-native";
// import PieChart from "../components/PieChart";
import { QuestListProvider } from "../components/QuestListContext";
import QuestList from "../components/QuestList";
import UserList from "../components/UserList";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Home = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#272727",
    },
    area: {
      flex: 1,
      backgroundColor: "#272727",
    },
  });
  return (
    <SafeAreaProvider style={styles.area}>
      <QuestListProvider>
        <UserList />
        <QuestList />
      </QuestListProvider>
    </SafeAreaProvider>
  );
};

export default Home;

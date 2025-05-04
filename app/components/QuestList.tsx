import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QuestCardDeck from "./QuestCardDeck";

const QuestList = () => {
  return (
    <View style={styles.container}>
      <QuestCardDeck />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#272727",
  },
});

export default QuestList;

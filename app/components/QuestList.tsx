import React from "react";
import { View, Text, StyleSheet, FlatList, Easing } from "react-native";
import { useQuestList } from "./QuestListContext";
import Collapsible from "react-native-collapsible";

const QuestList = () => {
  const { questList } = useQuestList();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quest List</Text>
      <FlatList
        data={questList}
        renderItem={({ item, index }) => (
          <View style={styles.questContainer}>
            <Text style={styles.questTitle}>Quest {index + 1}</Text>
            <Text style={styles.questDescription}>
              {Object.values(item)[0]}
            </Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#272727",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  questContainer: {
    backgroundColor: "#0b0b0b",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  questDescription: {
    fontSize: 16,
    color: "#b0b0b0",
  },
});

export default QuestList;

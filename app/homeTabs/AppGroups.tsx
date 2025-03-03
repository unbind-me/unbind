import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function AppGroups({ navigation }: any) {
  const styles = StyleSheet.create({
    header: {
      fontSize: 24,
      color: "white",
      fontWeight: "bold",
    },
    container: {
      backgroundColor: "#272727",
      flex: 1,
      alignItems: "center",
    },
    addButton: {
      fontSize: 16,
      color: "white",
    },
    addButtonContainer: {
      backgroundColor: "#646464",
      marginVertical: 30,
      padding: 10,
      borderRadius: 30,
    },
  });
  return (
    <View style={styles.container}>
      <Text style={styles.header}>App Groups</Text>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("AppGroup");
          }}
        >
          <Text style={styles.addButton}>Add App Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

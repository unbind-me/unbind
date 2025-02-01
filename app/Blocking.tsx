import React from "react";
import { Text, View, StyleSheet } from "react-native";

const Block = () => {
  return (
    <View style={styles.container}>
      <Text>Whats up</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
});

export default Block;

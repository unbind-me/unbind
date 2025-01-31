import React from "react";
import { View, StyleSheet, Text, Button, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function BottomBar() {
  return (
    <View style={styles.BottomBar}>
      
      <TouchableOpacity onPress={() => console.log('pressed')}>
        <Icon name="home" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => console.log('pressed')}>
        <Icon name="lock-closed" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => console.log('pressed')}>
        <Icon name="settings" size={24} color="black" />
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  BottomBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: "#ababab",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ababad", 
    borderRadius: 20
  }
});
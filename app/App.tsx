import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import _layout from "./_layout"; // Import your layout with the TabNavigator

export default function App() {
  return (
    <NavigationContainer>
      <_layout />
    </NavigationContainer>
  );
}

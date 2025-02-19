import React from "react";
import Home from "./home";
import Settings from "./settings";
import BottomBar from "./BottomBar";
import Block from "./Blocking";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Create the TabNavigator
const TabNavigator = createBottomTabNavigator();

const _layout = () => {
  return (
    <TabNavigator.Navigator
      screenOptions={{ headerShown: false, animation: "shift" }}
      tabBar={(props) => <BottomBar {...props} />}
    >
      <TabNavigator.Screen name="Home" component={Home} />
      <TabNavigator.Screen name="Block" component={Block} />
      <TabNavigator.Screen name="Settings" component={Settings} />
    </TabNavigator.Navigator>
  );
};

export default _layout;

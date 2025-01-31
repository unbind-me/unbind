import React from "react";
import Home from "./home";
import Settings from "./settings";
import BottomBar from "./BottomBar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator, TransitionSpecs } from "@react-navigation/bottom-tabs";
import { Easing, View } from "react-native";
// tabBar={(props) => <BottomBar {...props} />}
const TabNavigator = createBottomTabNavigator();
const _layout = () => {
  return (
    <>
      <TabNavigator.Navigator screenOptions={{ headerShown: false, animation: 'shift', }} tabBar={(props) => <BottomBar {...props} />}>
        <TabNavigator.Screen name="Home" component={Home} />
        <TabNavigator.Screen name="Block" component={Home} />
        <TabNavigator.Screen name="Settings" component={Settings} />
      </TabNavigator.Navigator>
    </>

    
  )
}

export default _layout;
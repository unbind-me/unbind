import React from "react";
import Home from "./home";
import Settings from "./settings";
import BottomBar from "./BottomBar";
import Block from "./Blocking";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";

const TabNavigator = createBottomTabNavigator();
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "blue",
  },
};
const App = () => {
  return (
    <NavigationContainer theme={MyTheme}>
      <_layout />
    </NavigationContainer>
  );
};
const _layout = () => {
  return (
    <TabNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
      tabBar={(props) => <BottomBar {...props} />}
    >
      <TabNavigator.Screen name="Home" component={Home} />
      <TabNavigator.Screen name="Block" component={Block} />
      <TabNavigator.Screen name="Settings" component={Settings} />
    </TabNavigator.Navigator>
  );
};

export default _layout;

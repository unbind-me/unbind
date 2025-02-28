import "../gesture-handler";
import React from "react";
import Home from "./home";
import Settings from "./Settings";
import BottomBar from "./BottomBar";
import Block from "./Blocking";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppearanceSettings from "./screens/Appearance";
import NotificationsSettings from "./screens/Notifications";
import ProfileSettings from "./screens/Profile";
import PrivacySettings from "./screens/Privacy";

const TabNavigator = createBottomTabNavigator();
const Stack = createStackNavigator();
const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "rgb(140, 201, 125)",
    primary: "rgb(255, 45, 85)",
  },
};

function HomeTabs() {
  return (
    <TabNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animation: "shift",
      }}
      initialRouteName="Home"
      tabBar={(props) => <BottomBar {...props} />}
    >
      <TabNavigator.Screen name="Home" component={Home} />
      <TabNavigator.Screen name="Block" component={Block} />
      <TabNavigator.Screen name="Settings" component={Settings} />
    </TabNavigator.Navigator>
  );
}

const _layout = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* SettingsList is the main settings screen */}
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen
          name="AppearanceSettings"
          component={AppearanceSettings}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationsSettings}
        />
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </>
  );
};

export default _layout;

import "../gesture-handler";
import React from "react";
import Home from "./homeTabs/home";
import Settings from "./homeTabs/Settings";
import BottomBar from "./components/BottomBar";
import Block from "./homeTabs/Blocking";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppearanceSettings from "./screens/Appearance";
import NotificationsSettings from "./screens/Notifications";
import ProfileSettings from "./screens/Profile";
import PrivacySettings from "./screens/Privacy";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import Constants from "expo-constants";

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
    <SafeAreaView style={styles.safeArea}>
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
    </SafeAreaView>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // On Android, add padding for the status bar height
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
    backgroundColor: "#272727",
  },
});

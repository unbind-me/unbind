import React, { useContext } from "react";
import Home from "./app/homeTabs/home";
import Settings from "./app//homeTabs/Settings";
import BottomBar from "./app//components/BottomBar";
import Block from "./app//homeTabs/Blocking";
import AppGroups from "./app//homeTabs/AppGroups";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import AppearanceSettings from "./app//screens/Appearance";
import NotificationsSettings from "./app//screens/Notifications";
import ProfileSettings from "./app//screens/Profile";
import PrivacySettings from "./app//screens/Privacy";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
// for simplicity the app will only feature a DARK MODE
const TabNavigator = createBottomTabNavigator();
const Stack = createStackNavigator();

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
        <TabNavigator.Screen name="Block" component={AppGroups} />
        <TabNavigator.Screen name="Settings" component={Settings} />
      </TabNavigator.Navigator>
    </SafeAreaView>
  );
}

const App = () => {
  return (
    <NavigationContainer>
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
        <Stack.Screen name="AppGroup" component={Block} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
    backgroundColor: "#272727",
  },
});

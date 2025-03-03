import React from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type SettingItem = {
  label: string;
  screen: string;
};

type SettingsSection = {
  title: string;
  data: SettingItem[];
};

const settingsData: SettingsSection[] = [
  {
    title: "General",
    data: [
      { label: "Appearance", screen: "AppearanceSettings" },
      { label: "Notifications", screen: "NotificationSettings" },
    ],
  },
  {
    title: "Account",
    data: [
      { label: "Profile", screen: "ProfileSettings" },
      { label: "Privacy", screen: "PrivacySettings" },
    ],
  },
];

const SettingsList = ({ navigation }: { navigation: any }) => {
  const renderItem = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Text style={styles.itemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <SectionList
        sections={settingsData}
        keyExtractor={(item, index) => item.screen + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};
export default SettingsList;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#272727",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff",
  },
  itemText: {
    fontSize: 18,
    color: "white",
  },
  listContent: {
    paddingBottom: 20,
  },
});

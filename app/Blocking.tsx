import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const Block = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApps, setSelectedApps] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [apps] = useState([
    { name: "Facebook", logo: require("../assets/logos/facebook.png") },
    { name: "Instagram", logo: require("../assets/logos/instagram.png") },
    { name: "Twitter", logo: require("../assets/logos/twitter.png") },
    { name: "Snapchat", logo: require("../assets/logos/snapchat.png") },
    { name: "YouTube", logo: require("../assets/logos/youtube.png") },
    { name: "WhatsApp", logo: require("../assets/logos/whatsapp.png") },
    { name: "TikTok", logo: require("../assets/logos/tiktok.png") },
    { name: "Reddit", logo: require("../assets/logos/reddit.png") },
    { name: "Pinterest", logo: require("../assets/logos/pinterest.png") },
    { name: "LinkedIn", logo: require("../assets/logos/linkedin.png") },
  ]);

  // Filter the apps based on the search query
  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle toggling selection of apps
  const toggleSelection = (appName: string) => {
    setSelectedApps((prevSelectedApps) => ({
      ...prevSelectedApps,
      [appName]: !prevSelectedApps[appName],
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blocking</Text>
      <TouchableOpacity style={styles.blockButton}>
        <Icon name="stop-circle-outline" size={50} color="lightgray" />
      </TouchableOpacity>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search for an app"
        placeholderTextColor={"#ccc"}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* List of filtered apps */}
      <FlatList
        data={filteredApps}
        renderItem={({ item }) => (
          <View style={styles.appItemContainer}>
            {/* App Logo */}
            <Image source={item.logo} style={styles.logo} />
            {/* App Name */}
            <Text style={styles.appName}>{item.name}</Text>
            {/* Toggle Selection */}
            <TouchableOpacity
              onPress={() => toggleSelection(item.name)}
              hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }}
            >
              <Icon
                name={
                  selectedApps[item.name]
                    ? "checkmark-circle"
                    : "checkmark-circle-outline"
                }
                size={24}
                color="lightgray"
              />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F1F1F",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    width: "100%",
    marginBottom: 20,
    color: "white",
  },
  appItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: 250
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  appName: {
    color: "white",
    fontSize: 18,
    flex: 1,
  },
  toggleText: {
    color: "lightgray",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  blockButton: {
    marginBottom: 20,
  },
});

export default Block;

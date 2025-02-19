import React, { useState } from "react";
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from "react-native";

const Block = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApps, setSelectedApps] = useState<{ [key: string]: boolean }>({});
  const [apps] = useState([
    { name: "Facebook", logo: require("./assets/facebook.png") },
    { name: "Instagram", logo: require("./assets/instagram.png") },
    { name: "Twitter", logo: require("./assets/twitter.png") },
    { name: "Snapchat", logo: require("./assets/snapchat.png") },
    { name: "YouTube", logo: require("./assets/youtube.png") },
    { name: "WhatsApp", logo: require("./assets/whatsapp.png") },
    { name: "TikTok", logo: require("./assets/tiktok.png") },
    { name: "Reddit", logo: require("./assets/reddit.png") },
    { name: "Pinterest", logo: require("./assets/pinterest.png") },
    { name: "LinkedIn", logo: require("./assets/linkedin.png") },
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
      
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search for an app"
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
            <TouchableOpacity onPress={() => toggleSelection(item.name)}>
              <Text style={styles.toggleText}>
                {selectedApps[item.name] ? "Unselect" : "Select"}
              </Text>
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
    backgroundColor: "black",
    padding: 20,
  },
  title: {
    color: "red",
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
});

export default Block;

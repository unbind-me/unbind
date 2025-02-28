import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // Import Icon component if you haven't already

const { width, height } = Dimensions.get("window");

const Block = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApps, setSelectedApps] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [apps] = useState([
    { name: "Facebook", logo: require("../../assets/logos/facebook.png") },
    { name: "Instagram", logo: require("../../assets/logos/instagram.png") },
    { name: "Twitter", logo: require("../../assets/logos/twitter.png") },
    { name: "Snapchat", logo: require("../../assets/logos/snapchat.png") },
    { name: "YouTube", logo: require("../../assets/logos/youtube.png") },
    { name: "WhatsApp", logo: require("../../assets/logos/whatsapp.png") },
    { name: "TikTok", logo: require("../../assets/logos/tiktok.png") },
    { name: "Reddit", logo: require("../../assets/logos/reddit.png") },
    { name: "Pinterest", logo: require("../../assets/logos/pinterest.png") },
    { name: "LinkedIn", logo: require("../../assets/logos/linkedin.png") },
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
        placeholder=" Search for an app... "
        placeholderTextColor={"#ffffff7b"}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Container specifically for the list */}
      <View style={styles.listContainer}>
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
                      : "add-circle-outline"
                  }
                  size={35}
                  color="lightgray"
                />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#272727",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
  searchInput: {
    height: height / 20,
    borderWidth: 5,
    borderRadius: 20,
    borderBlockColor: "#0d0d0dcf",
    borderColor: "#0d0d0dcf",
    paddingLeft: 5,
    width: "100%",
    marginBottom: 20,
    color: "white",
    backgroundColor: "#0d0d0dcf",
  },
  appItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
    paddingHorizontal: 10,
    justifyContent: "space-between",
    marginTop: 10,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 20,
  },
  appName: {
    color: "white",
    fontSize: 18,
    flex: 1,
  },
  blockButton: {
    marginBottom: 20,
  },
  listContainer: {
    flex: 0,
    width: "100%",
    maxHeight: height * 0.65,
    backgroundColor: "#0d0d0dcf",
    borderWidth: 5,
    borderRadius: 20,
    borderColor: "#0d0d0dcf",
  },
});

export default Block;

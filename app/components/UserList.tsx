// app/components/UserList.tsx
import React, { useState, useRef } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import { useQuestList } from "./QuestListContext";
import { run, responseStr } from "./Wrapper";

const TodoListInput: React.FC = () => {
  const [listItems, setListItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { setQuestList } = useQuestList();
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Calculate dynamic height based on number of items
  const getExpandedHeight = () => {
    // Reduced base height to eliminate extra space
    return Math.min(200 + listItems.length * 50, 480);
  };

  const toggleCollapse = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const toValue = isCollapsed ? getExpandedHeight() : 0;

    // Dismiss keyboard when collapsing
    if (!isCollapsed) {
      Keyboard.dismiss();
    }

    animationRef.current = Animated.timing(animatedHeight, {
      toValue,
      useNativeDriver: false,
      duration: 300,
      easing: Easing.cubic,
    });

    animationRef.current.start(() => {
      animationRef.current = null;
    });
    setIsCollapsed(!isCollapsed);
  };

  // Re-calculate height when listItems change
  React.useEffect(() => {
    if (!isCollapsed) {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      Animated.timing(animatedHeight, {
        toValue: getExpandedHeight(),
        useNativeDriver: false,
        duration: 200,
        easing: Easing.cubic,
      }).start();
    }
  }, [listItems.length]);

  function parseJSON(response: string) {
    try {
      const json = JSON.parse(response); // Parse the response back into an object
      const newQuestList = [];
      
      // Validate that the response has the expected structure
      if (!Array.isArray(json)) {
        throw new Error("Response is not an array");
      }
      
      for (let i = 0; i < json.length; i++) {
        if (!json[i].quest) {
          throw new Error(`Quest item ${i} missing 'quest' property`);
        }
        const questKey = `quest${i}`;
        const questValue = json[i].quest;
        newQuestList.push({ [questKey]: questValue });
      }
      
      console.log("Setting new quest list:", newQuestList);
      console.log("Quest list length:", newQuestList.length);
      
      // Set the questList state with the new quests
      setQuestList(newQuestList);
      
      // Clear the list items after successful submission
      setListItems([]);
      
      // Auto-collapse when cards appear and dismiss keyboard
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      // Dismiss keyboard
      Keyboard.dismiss();
      
      Animated.timing(animatedHeight, {
        toValue: 0,
        useNativeDriver: false,
        duration: 300,
        easing: Easing.cubic,
      }).start(() => {
        setIsCollapsed(true);
      });
      
      return true;
    } catch (err) {
      console.log("Is your JSON valid?");
      console.log(err);
      Alert.alert("Error", "Failed to parse the AI response. Please try again.");
      return false;
    }
  }

  const handleAddItem = () => {
    if (input.trim() === "") return;
    setListItems([...listItems, input]);
    setInput("");
  };

  const handleRemoveItem = (index: number) => {
    setListItems(listItems.filter((item, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (listItems.length === 0) {
      Alert.alert("Error", "Please add at least one item to the list.");
      return;
    }
    
    setIsLoading(true);
    try {
      const concatenatedString = listItems.join(", ");
      await run(concatenatedString);
      const success = parseJSON(responseStr);
      
      if (success) {
        // Auto-collapse after successful submission and dismiss keyboard
        if (animationRef.current) {
          animationRef.current.stop();
        }
        
        // Dismiss keyboard
        Keyboard.dismiss();
        
        Animated.timing(animatedHeight, {
          toValue: 0,
          useNativeDriver: false,
          duration: 300,
          easing: Easing.cubic,
        }).start(() => {
          setIsCollapsed(true);
        });
      }
    } catch (error) {
      console.error("Error submitting to AI:", error);
      Alert.alert("Error", "Failed to get quests from AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={styles.pullHandle}
          onPress={toggleCollapse}
          activeOpacity={0.7}
        >
          <Text style={styles.arrowText}>{isCollapsed ? '▼' : '▲'}</Text>
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.card, 
            { 
              height: animatedHeight,
              opacity: animatedHeight.interpolate({
                inputRange: [0, 10, 100],
                outputRange: [0, 0, 1],
              }),
            }
          ]}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter a to-do item..."
                placeholderTextColor="#666"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleAddItem}
              />
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={handleAddItem}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.listContainer}>
              {listItems.map((item, index) => (
                <View key={index} style={styles.responseBox}>
                  <Text style={styles.responseText}>{item}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.buttonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Generating Quests..." : "Submit to AI"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    top: 0,
    left: (Dimensions.get('window').width - Dimensions.get('window').width * 0.85) / 2,
    width: Dimensions.get('window').width * 0.85,
    maxWidth: 400,
    zIndex: 99,
    alignItems: 'center',
  },
  pullHandle: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191919',
    borderRadius: 20,
    zIndex: 100,
  },
  arrowText: {
    color: '#ffffff',
    fontSize: 20,
  },
  card: {
    width: '100%',
    maxHeight: 500,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 0,
    paddingTop: 0,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
    marginTop: -40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 120,
    marginBottom: 20,
    color: "white",
    textAlign: "center",
  },
  inputContainer: {
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#2a2a2a",
  },
  addButton: {
    width: 40,
    height: 40,
    marginLeft: 8,
    backgroundColor: "#333",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "300",
  },
  removeButton: {
    padding: 6,
    backgroundColor: "#333",
    borderRadius: 6,
    maxWidth: 100,
    alignItems: "center",
    marginVertical: 2,
  },
  submitButton: {
    width: "100%",
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 0,
  },
  disabledButton: {
    backgroundColor: "#444",
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  listContainer: {
    maxHeight: 300,
    marginBottom: 8,
  },
  responseBox: {
    marginTop: 4,
    marginBottom: 4,
    padding: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  responseText: {
    fontSize: 15,
    color: "#f8f9fa",
    fontWeight: "500",
    flexShrink: 1,
    flex: 1,
    marginRight: 10,
    letterSpacing: 0.2,
  },
});

export default TodoListInput;

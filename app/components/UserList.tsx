// app/components/UserList.tsx
import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useQuestList } from "./QuestListContext";
import { run, responseStr } from "./Wrapper";

const TodoListInput: React.FC = () => {
  const [listItems, setListItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { setQuestList } = useQuestList();
  const [isLoading, setIsLoading] = useState(false);

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
      
      setQuestList(newQuestList);
      console.log("JSON Parsed!");
      console.log(newQuestList);
      
      // Clear the list items after successful submission
      setListItems([]);
      
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
      parseJSON(responseStr);
    } catch (error) {
      console.error("Error submitting to AI:", error);
      Alert.alert("Error", "Failed to get quests from AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Create Your Quest List</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a to-do item..."
        placeholderTextColor="#ccc"
        value={input}
        onChangeText={setInput}
        onSubmitEditing={handleAddItem}
      />
      <TouchableOpacity onPress={handleAddItem} style={styles.button}>
        <Text style={styles.buttonText}>Add Item</Text>
      </TouchableOpacity>
      <ScrollView style={{ height: 200, maxHeight: 200 }}>
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
  );
};

export default TodoListInput;

const styles = StyleSheet.create({
  card: {
    width: "90%",
    alignSelf: "center",
    padding: 15,
    borderRadius: 20,
    backgroundColor: "rgb(22, 22, 22)",
    elevation: 3,
    marginTop: 15,
    maxHeight: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 10,
    color: "#fff",
  },
  button: {
    width: "100%",
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  removeButton: {
    width: "100%",
    padding: 7,
    backgroundColor: "#ff4343",
    borderRadius: 5,
    maxWidth: 150,
    alignItems: "center",
    marginVertical: 3,
  },
  submitButton: {
    width: "100%",
    padding: 12,
    backgroundColor: "#3dad35",
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  disabledButton: {
    backgroundColor: "#8abb8e",
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  responseBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 5,
    maxHeight: 350,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  responseText: {
    fontSize: 16,
    color: "#f8f9fa",
    fontWeight: "bold",
    flexShrink: 1,
    flex: 1,
    marginRight: 10,
  },
  responseContent: {
    padding: 10,
    paddingBottom: 20,
  },
});

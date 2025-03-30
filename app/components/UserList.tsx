import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Easing,
} from "react-native";
import { useQuestList } from "./QuestListContext";
import { run, responseStr } from "./Wrapper";
import Collapsible from "react-native-collapsible";

interface UserListProps {}

const TodoListInput: React.FC<UserListProps> = () => {
  const [listItems, setListItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { setQuestList } = useQuestList();

  function parseJSON(response: string) {
    try {
      const json = JSON.parse(response); // Parse the response back into an object
      const newQuestList = [];
      for (let i = 0; i < json.length; i++) {
        const questKey = `quest${i}`;
        const questValue = json[i].quest;
        newQuestList.push({ [questKey]: questValue });
      }
      setQuestList(newQuestList);
      console.log("JSON Parsed!");
      console.log(newQuestList);
    } catch (err) {
      console.log("Is your JSON valid?");
      console.log(err);
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
      console.log("LIST IS EMPTY!!");
      return;
    }
    const concatenatedString = listItems.join(", ");
    await run(concatenatedString);
    parseJSON(responseStr);
  };

  return (
    <Collapsible
      collapsed={false}
      align={"top"}
      easing={Easing.bezier(0.4, 0, 0.2, 1)}
      collapsedHeight={20}
    >
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Enter a to-do item..."
          placeholderTextColor={"#ccc"}
          value={input}
          onChangeText={setInput}
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
                <Text style={styles.buttonText}>Remove Item</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          onPress={() => handleSubmit()}
          style={styles.submitButton}
        >
          <Text style={styles.buttonText}>Submit to AI</Text>
        </TouchableOpacity>
      </View>
    </Collapsible>
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
  },
  responseText: {
    fontSize: 16,
    color: "#f8f9fa",
    fontWeight: "bold",
    flexShrink: 1,
  },
  responseContent: {
    padding: 10,
    paddingBottom: 20, // Add extra padding at the bottom for overscroll
  },
});

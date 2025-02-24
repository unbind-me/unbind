import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatView,
} from "react-native";

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = "AIzaSyA2WhWi0ENAMjEGTAWtG3Bvso-1AyZA0K8";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export default function Wrapper() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  async function run(message: String) {
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });
      const result = await chatSession.sendMessage(message);
      setResponse(result.response.text());
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ollama Prompt</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your prompt..."
        value={input}
        onChangeText={setInput}
      />
      <TouchableOpacity onPress={() => run(input)} style={styles.button}>
        <Text style={styles.buttonText}>Send to Ollama</Text>
      </TouchableOpacity>
      {response ? (
        <View style={styles.responseBox}>
          <Text style={styles.responseText}>
            <Text style={{ fontWeight: "bold" }}>Response: </Text>
            {response}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    alignSelf: "center",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "rgb(22, 22, 22)",
    elevation: 3,
    marginTop: 20,
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
  },
  responseText: {
    fontSize: 16,
    color: "#f8f9fa",
  },
});

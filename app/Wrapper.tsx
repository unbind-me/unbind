import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import axios from 'axios';
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyA2WhWi0ENAMjEGTAWtG3Bvso-1AyZA0K8"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Explain how AI works";


export default function Wrapper() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  async function sendMessageToAI() {
    try {
      // Send the prompt as an object with a key "prompt"
      const result = await model.generateContent({ prompt: input });
      // Use result.response directly instead of calling .text()
      setResponse(result.response);
      const test = await model.generateContent(prompt);
      console.log(test.response);  
    } catch (error) {
      console.error("Error sending message to AI:", error);
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
      <TouchableOpacity onPress={sendMessageToAI} style={styles.button}>
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

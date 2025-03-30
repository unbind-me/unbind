const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const apiKey = "AIzaSyA2WhWi0ENAMjEGTAWtG3Bvso-1AyZA0K8"; // need to create API server
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite-preview-02-05",
  systemInstruction:
    "You are a quest generator. You will be given a list of things the user must do and you will need to give a list of 5 quests for the user to do based off of the tasks. When naming the keys, make sure they are sequential, e.g quest1, quest2, quest3, quest4, etc.",
});
const jsonData = {
  description: "A questboard.",
  type: SchemaType.ARRAY,
  minItems: 5,
  maxItems: 5,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      quest: {
        type: SchemaType.STRING,
        description: "QuestGen",
        nullable: false,
      },
    },
    // required: ["quest"],
  },
};
export var questList: { [key: string]: string }[] = [];
export var responseStr = "";

export async function run(message: String) {
  try {
    const chatSession = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
        responseSchema: jsonData,
      },
    });
    const response = chatSession.response.text();
    responseStr = response;
  } catch (error) {
    console.log(error);
  }
}

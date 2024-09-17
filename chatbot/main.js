import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";

// Initialize the model
const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_API_KEY}`);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let history = [];

const allowedKeywords = ['crop', 'plant', 'agriculture', 'farming', 'harvest', 'irrigation', 'soil', 'pesticide', 'fertilizer', 'agronomy'];

function isAllowedPrompt(prompt) {
  return allowedKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
}

function isAllowedResponse(response) {
  return allowedKeywords.some(keyword => response.toLowerCase().includes(keyword));
}

async function getResponse(prompt) {
  if (!isAllowedPrompt(prompt)) {
    return "Please ask questions related to crops, plants, or agriculture.";
  }

  const chat = await model.startChat({ history: history });
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const text = await response.text();

  if (!isAllowedResponse(text)) {
    return "Sorry, I can only provide information on crops, plants, and agriculture.";
  }

  console.log(text);
  return text;
}

// User chat div
export const userDiv = (data) => {
  return `
  <!-- User Chat -->
          <div class="flex items-center gap-2 justify-start m-2">
            <img src="human.png" alt="user icon" class="w-10 h-10 rounded-full"/>
            <div class="bg-gemDeep text-white p-1 rounded-md shadow-md mx-2">${data}</div>
          </div>
  `;
};

// AI Chat div
export const aiDiv = (data) => {
  return `
  <!-- AI Chat -->
          <div class="flex gap-2 justify-end m-2">
            <div class="bg-gemDeep text-white p-1 rounded-md shadow-md mx-2">${data}</div>
            <img src="bot.png" alt="bot icon" class="w-10 h-10 rounded-full"/>
          </div>
  `;
};

async function handleSubmit(event) {
  event.preventDefault();

  let userMessage = document.getElementById("prompt");
  const chatArea = document.getElementById("chat-container");

  var prompt = userMessage.value.trim();
  if (prompt === "") {
    return;
  }

  console.log("user message", prompt);

  chatArea.innerHTML += userDiv(md().render(prompt));
  userMessage.value = "";
  const aiResponse = await getResponse(prompt);
  let md_text = md().render(aiResponse);
  chatArea.innerHTML += aiDiv(md_text);

  let newUserRole = {
    role: "user",
    parts: prompt,
  };
  let newAIRole = {
    role: "model",
    parts: aiResponse,
  };

  history.push(newUserRole);
  history.push(newAIRole);

  console.log(history);
}

const chatForm = document.getElementById("chat-form");
chatForm.addEventListener("submit", handleSubmit);

chatForm.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) handleSubmit(event);
});

// Get the elements
const chatbotPopup = document.getElementById('chatbot-popup');
const openChatbotButton = document.getElementById('open-chatbot');

// Event to open the chatbot
openChatbotButton.addEventListener('click', () => {
    chatbotPopup.style.display = 'block';
});

const closeChatbotButton = document.getElementById('close-chatbot');

// Event to close the chatbot
closeChatbotButton.addEventListener('click', () => {
    chatbotPopup.style.display = 'none';
});

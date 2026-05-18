# The Intelligent Bistro 

An AI-powered restaurant ordering app where customers can browse 
a menu and manage their cart through a conversational AI interface.

Built with React Native (Expo), Node.js, and Claude API.



## Features

- **AI Ordering**: Tell the AI what you want in natural language
- **Smart Cart**: AI automatically adds/removes items based on your request
- **Menu Browser**: Browse all items with one-tap ordering
- **Cart Management**: View, modify, and checkout your order



## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native + Expo |
| Backend | Node.js + Express |
| AI | Anthropic Claude API |
| Styling | React Native StyleSheet |



## How It Works
User says: "Add two pizzas and a coke"
↓
React Native frontend sends to Node.js backend
↓
Backend sends to Claude API with menu + cart context
↓
Claude returns structured JSON:
{
"message": "Added 2 pizzas and a Coke!",
"actions": [
{"type": "add", "itemId": 1, "quantity": 2},
{"type": "add", "itemId": 8, "quantity": 1}
]
}
↓
Frontend automatically updates the cart

---

## Quick Start

### Backend
```bash
cd backend
npm install
# Create .env file with your API key:
# ANTHROPIC_API_KEY=your_key_here
node index.js
```
Backend runs on http://localhost:3000

### Frontend
```bash
cd frontend
npm install
npx expo start --web
```
Frontend runs on http://localhost:8081



## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /menu | Get all menu items |
| POST | /chat | Send message to AI assistant |



## Author

**Liqiong (Ella) Zheng**  
MS Computer Science @ Northeastern University  
GitHub: github.com/liqzheng

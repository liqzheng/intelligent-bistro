require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Menu data
const MENU = [
  { id: 1, name: "Margherita Pizza", price: 12.99, category: "Pizza", emoji: "🍕" },
  { id: 2, name: "Spicy Chicken Sandwich", price: 9.99, category: "Sandwich", emoji: "🥪" },
  { id: 3, name: "Caesar Salad", price: 8.99, category: "Salad", emoji: "🥗" },
  { id: 4, name: "BBQ Burger", price: 11.99, category: "Burger", emoji: "🍔" },
  { id: 5, name: "Pasta Carbonara", price: 13.99, category: "Pasta", emoji: "🍝" },
  { id: 6, name: "Chicken Wings", price: 10.99, category: "Appetizer", emoji: "🍗" },
  { id: 7, name: "Large Water", price: 1.99, category: "Drink", emoji: "💧" },
  { id: 8, name: "Coca Cola", price: 2.99, category: "Drink", emoji: "🥤" },
  { id: 9, name: "Chocolate Cake", price: 6.99, category: "Dessert", emoji: "🍰" },
  { id: 10, name: "Tiramisu", price: 7.99, category: "Dessert", emoji: "🍮" },
];

// Get menu endpoint
app.get('/menu', (req, res) => {
  res.json(MENU);
});

// AI chat endpoint
app.post('/chat', async (req, res) => {
  const { message, cart } = req.body;

  const menuText = MENU.map(item =>
    `ID:${item.id} ${item.name} $${item.price}`
  ).join('\n');

  const cartText = cart.length > 0
    ? cart.map(item => `${item.name} x${item.quantity}`).join(', ')
    : 'empty';

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 500,
    system: `You are a friendly restaurant assistant for The Intelligent Bistro.
You help customers order food by understanding their natural language requests.

MENU:
${menuText}

Always respond with valid JSON in this exact format:
{
  "message": "friendly response to customer",
  "actions": [
    {"type": "add", "itemId": 1, "quantity": 2},
    {"type": "remove", "itemId": 3, "quantity": 1}
  ]
}

Actions can be "add" or "remove". Only include actions when customer wants to change their order.
If no order changes, return empty actions array.`,
    messages: [
      {
        role: 'user',
        content: `Current cart: ${cartText}\nCustomer says: ${message}`
      }
    ]
  });

  const text = response.content[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  const result = JSON.parse(clean);
  res.json(result);
});

app.listen(3000, () => {
  console.log('Bistro backend running on port 3000');
});
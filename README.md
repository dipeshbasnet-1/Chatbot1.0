# Chatbot

A full-stack AI chatbot built with the MERN stack (MongoDB, Express, React, Node.js), powered by Groq's Llama 3.3 model for real-time AI responses.

## Features

- **Real AI conversations** — powered by Groq (Llama 3.3 70B), not keyword matching
- **Conversation memory** — the bot remembers context within a conversation
- **Chat history sidebar** — like ChatGPT/Claude, browse and revisit past conversations
- **AI-generated chat titles** — each conversation gets a short, auto-generated title
- **Delete conversations** — remove any past chat
- **Admin dashboard** — password-protected page showing usage stats (total conversations, total messages, recent activity)
- **Fully responsive** — works on mobile and desktop

## Tech Stack

**Frontend:** React (Vite), react-router-dom
**Backend:** Node.js, Express
**Database:** MongoDB Atlas
**AI:** Groq API (Llama 3.3 70B)

## Project Structure

    chatbot/
    ├── backend/
    │   ├── server.js          # Express app entry point
    │   ├── db.js               # MongoDB connection
    │   └── routes/
    │       ├── chatRoutes.js   # Chat + conversation history endpoints
    │       └── adminRoutes.js  # Password-protected admin stats
    └── frontend/
        └── src/
            ├── App.jsx          # Routing (chat page / admin page)
            ├── ChatPage.jsx      # Main chatbot UI
            └── AdminPage.jsx     # Admin dashboard

## Running Locally

**Backend:**

    cd backend
    npm install
    npm start

**Frontend:**

    cd frontend
    npm install
    npm run dev

**Environment variables** (create a `.env` file inside `backend/`):

    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    GROQ_API_KEY=your_groq_api_key
    ADMIN_PASSWORD=your_admin_password

## Author

Dipesh Basnet
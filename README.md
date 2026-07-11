# Kadhaipomaa - Frontend

Kadhaipomaa is a fast, anonymous, real-time chat application built with React. Meet new people, chat safely, and connect over shared interests!

## Live Demo
👉 **[https://kadhaipomaa-frontend.vercel.app](https://kadhaipomaa-frontend.vercel.app)**

## Features
- **Anonymous Chatting:** Instantly connect with strangers.
- **Interest Matching:** Filter connections based on shared hobbies and topics.
- **Beautiful UI:** A modern, glassmorphic dark-mode design with glowing aesthetics.
- **Admin Dashboard:** A secure panel (`/admin`) for site owners to monitor active connections and manage IP bans.

## Technologies Used
- **Frontend Framework:** React.js
- **Routing:** Built-in SPA conditional routing (Vercel rewrite optimized)
- **WebSockets:** Socket.io-client for real-time communication
- **Styling:** Custom Vanilla CSS for rich, animated aesthetics
- **Auth:** Firebase (for optional/admin features)

## Setup Instructions

1. **Clone the repo and install dependencies:**
   ```bash
   npm install
   ```

2. **Run the local development server:**
   ```bash
   npm start
   ```
   The app will run at `http://localhost:3000`.

## Deployment
This project is optimized for deployment on **Vercel**. 
All SPA routing rules are pre-configured in `vercel.json` to handle React client-side paths (like the `/admin` dashboard) perfectly.

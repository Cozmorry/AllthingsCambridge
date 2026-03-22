# AllThingsCambridge 🎓✨

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Paystack](https://img.shields.io/badge/Paystack-09A5DB?style=for-the-badge&logo=paystack&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Welcome to **AllThingsCambridge**, an interactive online platform dedicated to helping students master their curriculum with active recall!

## 🌟 Features

* **Advanced Study Resources**: Curated notes, past papers, and topical questions seamlessly organized by subject and level (IGCSE, O-Level, A-Level, Checkpoint).
* **Interactive Flashcards**: A fully-featured spaced-repetition testing mode built directly into subjects. 
* **Metered Paywall Engine**: A smooth 5-free-views system that gives guests a taste before naturally guiding them to a premium subscription.
* **Premium Subscriptions**: Powered by Paystack, users can purchase Monthly or Annual access instantly.
* **Community Forums**: A dedicated, interactive Q&A discussion board where students can connect, discuss, and help one another.
* **Admin Dashboard**: Full CRUD interface for managing subjects, file uploads via Supabase storage, flashcard creation, and detailed application analytics.

## 🚀 Quick Start

### 1. Requirements
- Node.js version 16+
- A Supabase Project
- A Paystack Merchant Account

### 2. Installation Setup

Clone the repository and install the Node dependencies inside the `/app` folder.

```bash
cd app
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the `/app` directory using `.env.example` as a template.

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

### 4. Running the Dev Server
```bash
npm run dev
```
Navigate to `http://localhost:5173`. 

## 📦 Deployment (Static Hosting)

Because AllThingsCambridge handles routing purely on the client-side via `react-router-dom`, you can statically host it on standard cPanel configurations or static site hosts like Vercel and Netlify.

```bash
npm run build
```
Upload the generated `dist` folder to your host's root. An `.htaccess` rule inside the `public/` directory is automatically included to route fallback URLs to `index.html`.

## 🤝 Contribution Guidelines
Check out our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating in our open source project! 

## ⚖️ License
This project is legally protected under the [MIT License](./LICENSE).

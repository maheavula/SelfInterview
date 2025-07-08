# selfinterview AI+ – AI-Powered Mock Interview Platform

selfinterview AI+ is a next-generation interview preparation platform that uses advanced artificial intelligence to simulate realistic interview scenarios, provide instant feedback, and help you build confidence for your next big opportunity.

## 🚀 Features

- **AI-Powered Mock Interviews:** Practice with adaptive AI that asks and evaluates real interview questions.
- **Multiple Interview Types:** Behavioral, technical, case study, and more.
- **Real-Time Feedback:** Get instant, actionable feedback on your answers and communication.
- **Personalized Training:** Tailored sessions based on your industry, role, and experience.
- **Session Analytics:** Review your performance and track your progress.
- **Modern UI:** Clean, responsive design (laptop/desktop only).

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Authentication & Backend:** Firebase
- **Animation:** Lottie
- **Deployment:** Vercel

## ⚠️ Device Support

> **Note:** This platform is designed for use on laptops and desktops only. Mobile and tablet devices are not supported.

## 📦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/selfinterview-ai.git
   cd selfinterview-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Get your Firebase config and add it to a `.env` file in the root:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**  
   Visit [site](https://selfinterview.vercel.app/)

## 🌐 Deployment (Vercel)

1. **Push your code to GitHub.**
2. **Go to [Vercel](https://vercel.com/), import your GitHub repo, and follow the prompts.**
3. **Set your environment variables in the Vercel dashboard (same as your `.env` file).**
4. **Deploy!**

## 👨‍💻 Creators

**K Janardhan Reddy & A Maheswar Reddy**

---

&copy; 2025 selfinterview AI+. All rights reserved.

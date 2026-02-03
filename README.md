# SmartStud.Ai - AI-Powered Learning Platform

SmartStud.Ai is a comprehensive learning platform that leverages AI to provide personalized education experiences, including AI-powered courses, quizzes, flashcards, mind maps, and an intelligent learning companion.

## 🚀 Features

- **AI Chat Agent** - Interactive AI assistant for learning queries
- **AI Companion** - Voice-enabled learning companion with persistent conversations
- **AI Course Generator** - Generate custom courses on any topic
- **Smart Quizzes** - Adaptive quizzes with performance tracking
- **Mind Maps** - Visual learning with interactive mind maps
- **Flashcards** - AI-generated flashcards for effective memorization
- **Performance Analytics** - Track your learning progress over time
- **Library** - Access to curated learning resources
- **To-Do List** - Organize your learning tasks

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** account (for database) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** (optional, for cloning)

## 🔑 Required API Keys

You'll need to obtain the following API keys:

1. **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
2. **Firebase Project** - [Firebase Console](https://console.firebase.google.com/)
3. **MongoDB URI** - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
4. **YouTube API Key** (optional) - [Google Cloud Console](https://console.cloud.google.com/)
5. **Unsplash Access Key** (optional) - [Unsplash Developers](https://unsplash.com/developers)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd llm-ss
```

Or download and extract the ZIP file.

### 2. Backend Setup

#### Navigate to Backend Directory

```bash
cd backend
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Create .env file
touch .env
```

Add the following variables to `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

**Replace the placeholder values:**
- `your_mongodb_connection_string` - Your MongoDB Atlas connection string
- `your_gemini_api_key` - Your Google Gemini API key
- `your_youtube_api_key` - Your YouTube Data API v3 key (optional)
- `your_unsplash_access_key` - Your Unsplash API access key (optional)

#### Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to Frontend Directory

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# Create .env file
touch .env
```

Add the following variables to `frontend/.env`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Replace the placeholder value:**
- `your_gemini_api_key` - Your Google Gemini API key (same as backend)

#### Configure Firebase

You need to set up Firebase for authentication:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Authentication** and add **Email/Password** sign-in method
4. Enable **Firestore Database**
5. Get your Firebase configuration

Update `frontend/src/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_auth_domain",
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
};
```

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## 🎯 Running the Application

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - Open your browser and navigate to `http://localhost:5173`
   - Register a new account or login
   - Complete the student survey to get started

## 📁 Project Structure

```
llm-ss/
├── backend/
│   ├── controllers/       # Request handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── server.js         # Express server entry point
│   ├── package.json      # Backend dependencies
│   └── .env             # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   ├── services/     # API services
│   │   ├── firebase.js   # Firebase configuration
│   │   └── App.jsx       # Main app component
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── .env             # Frontend environment variables
│
└── README.md            # This file
```

## 🔧 Configuration Details

### MongoDB Setup

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with password
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string and add it to `backend/.env`

### Firebase Setup

1. Create a project in [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password Authentication**
3. Create a **Firestore Database** in production mode
4. Update Firestore security rules if needed
5. Copy your Firebase config to `frontend/src/firebase.js`

### Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to both `backend/.env` and `frontend/.env`

## 🛠️ Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Change PORT in backend/.env to a different port
PORT=5001
```

**MongoDB Connection Error:**
- Verify your MongoDB URI is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure your database user has proper permissions

**Firebase Authentication Error:**
- Verify Firebase config in `firebase.js`
- Check if Email/Password authentication is enabled
- Ensure Firestore is created and accessible

**API Key Errors:**
- Verify all API keys are correctly added to `.env` files
- Ensure no extra spaces or quotes around keys
- Check if API keys are active and have proper permissions

**Module Not Found:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Available Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Backend Deployment

1. Choose a hosting platform (Heroku, Railway, Render, etc.)
2. Set environment variables in the platform
3. Deploy the `backend` directory
4. Update frontend API URLs to point to deployed backend

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Or any static hosting service

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Happy Learning with SmartStud.Ai! 🎓✨**
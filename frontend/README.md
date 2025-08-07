# TwinAgent Frontend

A React + TypeScript frontend for the TwinAgent application, built with Vite and Tailwind CSS.

## Architecture

- **Frontend**: React + TypeScript + Vite (this project)
- **Backend**: Azure Functions (separate project)
- **APIs**: RESTful APIs and WebSocket for real-time communication

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Azure Functions backend deployed

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your Azure Functions URLs and API keys.

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Or use the batch file: `start-dev.bat`

## Environment Variables

- `VITE_API_BASE_URL`: Your Azure Functions app URL
- `VITE_API_KEY`: API key for authentication
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key for location features

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run format`: Format code with Prettier

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── services/          # API services
├── hooks/             # Custom React hooks
├── router/            # React Router configuration
└── utils/             # Utility functions
```

## Features

- 🎭 Twin profile management
- 🗣️ Voice chat with AI
- 📄 Document processing
- 🌍 Multi-language support (i18n)
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

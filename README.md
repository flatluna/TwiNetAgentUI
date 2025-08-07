# TwinAgent Project

A full-stack application for creating and managing AI twin agents with voice interaction capabilities.

## Architecture

- **Frontend**: React + TypeScript + Vite (in `frontend/` directory)
- **Backend**: Azure Functions (separate project)
- **Database**: Azure Cosmos DB / SQL Database
- **AI Services**: Azure OpenAI, Speech Services

## Project Structure

```
TwinNetAgentUI/
├── frontend/          # React frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── start-dev.bat      # Quick start script for development
└── README.md          # This file
```

## Quick Start

1. **Configure Azure Functions**:
   - Deploy your Azure Functions backend
   - Note the function app URL

2. **Setup Frontend**:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Update .env.local with your Azure Functions URL
   npm install
   npm run dev
   ```

3. **Or use the batch file**:
   ```bash
   start-dev.bat
   ```

## Environment Setup

The frontend requires these environment variables:
- `VITE_API_BASE_URL`: Azure Functions app URL
- `VITE_API_KEY`: API authentication key
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key

## Development

- Frontend runs on `http://127.0.0.1:5173`
- Backend should be deployed to Azure Functions
- WebSocket connections for real-time features

## Next Steps

1. Update `.env.local` with your actual Azure Functions URLs
2. Test the frontend with your deployed backend
3. Configure authentication and API keys
4. Deploy frontend to Azure Static Web Apps (optional)

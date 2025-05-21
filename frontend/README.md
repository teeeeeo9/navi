# Navi Frontend

This is the frontend application for the Navi Goal Setting & Strategic Planning app. It provides a modern, animated, and minimalist interface for interacting with the Navi backend.

## Features

- **Interactive AI Chat Interface**: Chat with the AI assistant to create goals, track progress, and get strategic advice
- **Animated Goal Visualization**: Beautiful, animated displays of your goals, milestones, and progress
- **Responsive Design**: Works on all device sizes from mobile to desktop
- **Glass Morphism UI**: Modern transparent/glass UI elements that create depth and visual appeal
- **Carousel Goal Navigation**: Intuitive carousel-based navigation for goals

## Tech Stack

- **React** with **TypeScript**
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API communication
- **Recharts** for data visualization

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/yarn
- Running Navi backend (see main project README)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

1. Create a production build:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. The built files will be in the `dist` directory and can be served by any static file server.

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and other assets
│   ├── components/      # Reusable UI components
│   │   ├── chat/        # Chat interface components
│   │   ├── goals/       # Goal visualization components
│   │   └── ui/          # Basic UI components
│   ├── context/         # React Context providers
│   ├── pages/           # Main page components
│   ├── services/        # API and service functions
│   ├── styles/          # Global styles
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.ts       # Vite configuration
```

## Design Principles

- **Minimalism**: Focus on content and functionality rather than decorative elements
- **Visual Feedback**: Animations provide feedback for user actions
- **Progressive Disclosure**: Start simple and reveal more details as the user engages
- **Consistent Visual Language**: Consistent use of colors, shapes, and interactions

## Communication with Backend

The frontend communicates with the Navi backend API through the services defined in `src/services/api.ts`. All API calls are proxied through Vite to avoid CORS issues during development.

## Authentication

The application uses JWT-based authentication with the backend. Tokens are stored in localStorage and managed through the AuthContext. 
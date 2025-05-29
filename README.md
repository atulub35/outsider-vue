# Outsider - AI Assistant Web Application

Outsider is a modern, responsive Vue.js application that provides AI-powered features including chat conversations and image generation. Built with Vue 3 and Vuetify 3, it offers a beautiful user interface with light and dark theme support.

## 🌟 Features

- **AI Chat**: Engage in natural language conversations with an AI assistant
- **AI Image Generation**: Create images from text descriptions or modify existing images
- **User Authentication**: Secure login and registration system with JWT authentication
- **Responsive Design**: Works seamlessly on mobile and desktop with dedicated mobile navigation
- **Theme Switching**: Toggle between light and dark modes with automatic theme persistence
- **Backend Integration**: Full API integration with a Ruby on Rails backend

## 🚀 Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **UI Library**: Vuetify 3 for Material Design components
- **State Management**: Vue's reactive system for local state
- **Routing**: Vue Router with automatic route generation
- **HTTP Client**: Axios for API communication
- **Build Tool**: Vite for lightning-fast development experience

## 🛠️ Project Setup

### Prerequisites

- Node.js (v16 or higher recommended)
- Yarn, NPM, or PNPM package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/outsider-vue.git
cd outsider-vue
```

2. Install dependencies
```bash
yarn install
# or
npm install
```

3. Create a `.env` file in the root directory (optional)
```
VITE_API_URL=http://your-backend-url.com
```

### Development

Start the development server:
```bash
yarn dev
# or
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
yarn build
# or
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 📁 Project Structure

```
outsider-vue/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable Vue components
│   ├── composables/     # Composition API functions
│   ├── layouts/         # Page layouts
│   ├── pages/           # Page components (auto-routed)
│   ├── plugins/         # Vue plugins
│   ├── router/          # Vue Router configuration
│   ├── services/        # API services
│   ├── stores/          # State management
│   ├── styles/          # Global CSS/SCSS
│   ├── views/           # View components
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
├── .env                 # Environment variables
├── index.html           # Entry HTML file
├── package.json         # Project dependencies
└── vite.config.mjs      # Vite configuration
```

## 📚 Key Features Explained

### AI Chat
The chat interface provides a real-time conversation experience with an AI assistant. Messages are saved to the backend, allowing conversations to persist between sessions.

### AI Image Generation
Generate images from text prompts using AI models. The interface provides various customization options like dimensions, configuration scale, and more. You can also edit existing images by uploading them and applying AI transformations.

### Authentication
The app includes a complete authentication system with login, registration, and token-based session management. Protected routes require authentication to access.

### Responsive Design
The application uses Vuetify's responsive grid system and includes a specialized bottom navigation for mobile devices, providing an optimized experience across all screen sizes.

## 🔗 Backend Integration

The application connects to a Ruby on Rails backend that provides:
- User authentication via JWT
- AI chat functionality
- Image generation capabilities

The API integration is managed through the `useAxios` composable, which provides a consistent interface for making API requests with authentication and error handling.

## 🔧 Configuration

The application can be configured by modifying the following files:
- `vite.config.mjs` for build configuration
- Environment variables for API endpoints and other settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

[MIT](LICENSE)

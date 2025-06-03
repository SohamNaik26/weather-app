# Weather Dashboard Application 🌤️

A modern, full-stack weather application that provides real-time weather information, location tracking, and Telegram bot integration.

![Weather Dashboard](https://your-screenshot-url.png)

## 🌟 Features

- **Real-time Weather Data**: Get current weather conditions for any city worldwide
- **Interactive Search**: City search with autocomplete suggestions
- **Weather Details**: Temperature, humidity, pressure, wind speed, and weather conditions
- **Wishlist Management**: Save your favorite locations for quick access
- **Telegram Bot Integration**: Get weather updates directly through Telegram
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Telegram Bot Token
- OpenWeather API Key

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weather-dashboard.git
   cd weather-dashboard
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**

   Create `.env` file in `/server`:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   OPENWEATHER_API_KEY=your_openweather_api_key
   PORT=3001
   ```

   Create `.env` file in `/client`:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

4. **Start Development Servers**
   ```bash
   # Start backend (from server directory)
   npm run dev

   # Start frontend (from client directory)
   npm start
   ```

## 🌐 API Endpoints

### Weather Endpoints
- `GET /weather?city={cityName}` - Get current weather for a city
- `POST /wishlist` - Add a city to wishlist
- `GET /wishlist` - Get user's wishlist

### Response Examples

```json
// GET /weather?city=London
{
  "datetime": "2024-01-20T12:00:00Z",
  "weather": "Cloudy",
  "temperature": 18.5,
  "pressure": 1012,
  "humidity": 78,
  "windSpeed": 5.2
}
```

## 🚀 Deployment

### Backend Deployment (Render.com)

1. Create a new Web Service on Render
2. Link your GitHub repository
3. Configure deployment settings:
   ```
   Name: weather-app-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. Set environment variables:
   - `TELEGRAM_BOT_TOKEN`
   - `OPENWEATHER_API_KEY`
   - `PORT`

### Frontend Deployment (Netlify/Vercel)

1. Create new site from Git
2. Configure build settings:
   ```
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/build
   ```

3. Set environment variables:
   - `REACT_APP_API_URL`: Your Render backend URL

## 📱 Telegram Bot Usage

1. Start a chat with the bot: `@YourWeatherBot`
2. Available commands:
   - `/start` - Get started with the bot
   - `/weather <city>` - Get weather for a city
   - `/wishlist` - View your saved locations

## 🛠️ Tech Stack

### Frontend
- React.js
- Axios for API calls
- CSS for styling

### Backend
- Node.js
- Express.js
- node-telegram-bot-api
- Axios for external API calls

### APIs & Services
- OpenWeather API
- Telegram Bot API
- Render.com (Backend hosting)
- Netlify/Vercel (Frontend hosting)

## 📦 Project Structure

```
weather-dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main application component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── index.js           # Server entry point
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- OpenWeather API for weather data
- Telegram Bot API for bot integration
- All contributors who help improve the project

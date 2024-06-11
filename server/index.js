import express from "express";
import cors from "cors";
import axios from "axios";
import TelegramBot from "node-telegram-bot-api";

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Enable JSON body parsing

const port = process.env.PORT || 3001;
const token = "6519496817:AAEnVupgaP-zLKuc6j8xz3_VWPGJ5d1GFUQ";
const bot = new TelegramBot(token, { polling: true });

async function addToWishlist(chatID, city) {
  console.log(`Adding city '${city}' to wishlist for chatID '${chatID}'...`);
  // Simulating a delay (remove this in production)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`City '${city}' added to wishlist for chatID '${chatID}'.`);
}

app.get("/weather", async (req, res) => {
  const { city } = req.query;
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=8725e6742a51d4cbc1d09e32f22b8454`
    );

    const forecast = {
      datetime: new Date(response.data.dt * 1000),
      weather: response.data.weather[0].description,
      temperature: response.data.main.temp - 273.15,
      pressure: response.data.main.pressure,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
    };

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

app.post("/wishlist", async (req, res) => {
  const { chatID, city } = req.body;
  try {
    await addToWishlist(chatID, city);
    res.status(200).json({ message: "Location added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res
      .status(500)
      .json({ error: "Error adding to wishlist. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

bot.on("message", async (msg) => {
  const chatID = msg.chat.id;
  const userInput = msg.text;

  try {
    if (userInput === "/wishlist") {
      // Get wishlist for this chatID
      const locations = await getWishlist(chatID);
      if (locations.length === 0) {
        bot.sendMessage(chatID, "Your wishlist is empty.");
      } else {
        const message = `Your wishlist:\n${locations.join("\n")}`;
        bot.sendMessage(chatID, message);
      }
    } else {
      // Handle weather requests as before
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=8725e6742a51d4cbc1d09e32f22b8454`
      );

      const forecast = {
        datetime: new Date(response.data.dt * 1000),
        weather: response.data.weather[0].description,
        temperature: response.data.main.temp - 273.15,
        pressure: response.data.main.pressure,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
      };

      const message = `Current weather in ${userInput}:\n${forecast.datetime.toLocaleString()}: ${
        forecast.weather
      }, Temperature: ${forecast.temperature.toFixed(2)}°C, Pressure: ${
        forecast.pressure
      } hPa, Humidity: ${forecast.humidity}%, Wind Speed: ${
        forecast.windSpeed
      } m/s`;

      bot.sendMessage(chatID, message);
    }
  } catch (error) {
    console.error("Error processing message:", error);
    bot.sendMessage(
      chatID,
      "Sorry, I couldn't retrieve weather information for that location."
    );
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

console.log("Bot is running...");

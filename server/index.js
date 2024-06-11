const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { MongoClient } = require("mongodb");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const port = 6000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const token = "6519496817:AAEnVupgaP-zLKuc6j8xz3_VWPGJ5d1GFUQ";
const bot = new TelegramBot(token, { polling: true });

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function addToWishlist(chatID, location) {
  try {
    await client.connect();
    const database = client.db("weatherbot");
    const wishlistCollection = database.collection("wishlist");
    await wishlistCollection.updateOne(
      { chatID },
      { $addToSet: { locations: location } },
      { upsert: true }
    );
  } finally {
    await client.close();
  }
}

async function getWishlist(chatID) {
  try {
    await client.connect();
    const database = client.db("weatherbot");
    const wishlistCollection = database.collection("wishlist");
    const userWishlist = await wishlistCollection.findOne({ chatID });
    return userWishlist ? userWishlist.locations : [];
  } finally {
    await client.close();
  }
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
    res.status(500).json({ error: "Error adding to wishlist" });
  }
});

app.get("/wishlist", async (req, res) => {
  const { chatID } = req.query;
  try {
    const locations = await getWishlist(chatID);
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: "Error fetching wishlist" });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

bot.on("message", async (msg) => {
  const chatID = msg.chat.id;
  const userInput = msg.text;

  try {
    if (userInput.startsWith("/add")) {
      const location = userInput.split(" ").slice(1).join(" ");
      await addToWishlist(chatID, location);
      bot.sendMessage(chatID, `Location '${location}' added to your wishlist.`);
      return;
    }

    if (userInput === "/wishlist") {
      const locations = await getWishlist(chatID);
      if (locations.length === 0) {
        bot.sendMessage(chatID, "Your wishlist is empty.");
      } else {
        const message = `Your wishlist:\n${locations.join("\n")}`;
        bot.sendMessage(chatID, message);
      }
      return;
    }

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
    } m/s\n`;

    bot.sendMessage(chatID, message);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatID, "An error occurred while processing your request.");
  }
});

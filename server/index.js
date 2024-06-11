const express = require("express");
const cors = require("cors");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const connectDB = require("./db");
const itemModel = require("./models/items.js");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;

connectDB();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const token = "6519496817:AAEnVupgaP-zLKuc6j8xz3_VWPGJ5d1GFUQ";
const bot = new TelegramBot(token, { polling: true });

// Function to remove circular references
const removeCircularReferences = (obj) => {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    })
  );
};

async function addToWishlist(chatID, location) {
  try {
    const database = mongoose.connection.db;
    const wishlistCollection = database.collection("wishlist");
    await wishlistCollection.updateOne(
      { chatID },
      { $addToSet: { locations: location } },
      { upsert: true }
    );
  } catch (error) {
    console.error(error);
  }
}

async function getWishlist(chatID) {
  try {
    const database = mongoose.connection.db;
    const wishlistCollection = database.collection("wishlist");
    const userWishlist = await wishlistCollection.findOne({ chatID });
    return userWishlist ? userWishlist.locations : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

app.get("/", async (req, res) => {
  try {
    const items = await itemModel.find();
    res.json(removeCircularReferences(items));
  } catch (error) {
    res.status(500).json({ error: "Error fetching items" });
  }
});

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

app.get("/", (req, res) => {
  res.send("Welcome to nodejs API project");
});

app.get("/hello", (req, res) => {
  res.send("Hello World");
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

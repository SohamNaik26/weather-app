import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const chatID = "5298119390";

  // Function to fetch weather data for a city
  const getWeather = async () => {
    if (!city) {
      setError("Please enter a city.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/weather?city=${city}`
      );
      setWeatherData(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Error fetching weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to add a city to the wishlist
  const addToWishlist = async () => {
    if (!city) {
      setError("Please enter a city.");
      return;
    }
    setLoading(true);
    try {
      // Make a POST request to the backend to add the city to the wishlist
      await axios.post("http://localhost:3001/wishlist", { chatID, city });
      // Update the wishlist state with the new city
      setWishlist([...wishlist, city]);
      setError("");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setError("Error adding to wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch the wishlist
  const getWishlist = async () => {
    setLoading(true);
    try {
      // Make a GET request to the backend to fetch the wishlist
      const response = await axios.get("http://localhost:3001/wishlist", {
        params: { chatID },
      });
      // Update the wishlist state with the fetched data
      setWishlist(response.data);
      setError("");
    } catch (error) {
      console.log("Error fetching wishlist:", error);
      setError("Error fetching wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect hook to fetch the wishlist when the component mounts
  useEffect(() => {
    getWishlist();
  }, []);

  // Handler function to update the city state when the input value changes
  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  // Handler function to submit the form and fetch weather data
  const handleSubmit = (e) => {
    e.preventDefault();
    getWeather();
  };

  return (
    <div>
      <h1>Weather App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Enter city"
        />
        <button type="submit">Get Weather</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {weatherData && (
        <div>
          <p>Date and Time: {weatherData.datetime}</p>
          <p>Weather: {weatherData.weather}</p>
          <p>Temperature: {weatherData.temperature.toFixed(2)}°C</p>
          <p>Pressure: {weatherData.pressure} hPa</p>
          <p>Humidity: {weatherData.humidity}%</p>
          <p>Wind Speed: {weatherData.windSpeed} m/s</p>
        </div>
      )}
      <button onClick={addToWishlist}>Add to Wishlist</button>
      {wishlist.length > 0 && (
        <div>
          <h2>Wishlist</h2>
          <ul>
            {wishlist.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

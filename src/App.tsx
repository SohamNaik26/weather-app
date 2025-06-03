import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Cloud, CloudRain, Sun, Wind, Droplets, ThermometerSun, MapPin, Loader2 } from 'lucide-react';

// OpenWeatherMap API key
const API_KEY = '8725e6742a51d4cbc1d09e32f22b8454';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  sys: {
    country: string;
  };
}

function App() {
  const [city, setCity] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bgClass, setBgClass] = useState<string>('weather-gradient');

  useEffect(() => {
    // Get user's location weather on initial load
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (err) => {
        console.error("Couldn't get location: ", err);
        // Default to a city if geolocation fails
        fetchWeather('London');
      }
    );
  }, []);

  useEffect(() => {
    if (weather) {
      // Set background based on temperature
      const temp = weather.main.temp;
      if (temp > 25) {
        setBgClass('weather-gradient-warm');
      } else if (temp < 10) {
        setBgClass('weather-gradient-cold');
      } else {
        setBgClass('weather-gradient');
      }
    }
  }, [weather]);

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (cityName: string) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
    } catch (err) {
      setError('City not found. Please check the spelling and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <Sun className="w-16 h-16 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="w-16 h-16 text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-16 h-16 text-blue-500" />;
      default:
        return <Cloud className="w-16 h-16 text-gray-500" />;
    }
  };

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col items-center justify-center p-4 transition-all duration-500`}>
      <div className="glass-effect rounded-xl shadow-lg w-full max-w-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Weather App</h1>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="w-full p-3 pl-10 rounded-lg bg-white/30 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-white/70" />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-1 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {weather && !loading && (
          <div className="text-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <MapPin className="mr-1" /> {weather.name}, {weather.sys.country}
                </h2>
                <p className="text-lg capitalize">{weather.weather[0].description}</p>
              </div>
              <div>
                {getWeatherIcon(weather.weather[0].main)}
              </div>
            </div>

            <div className="text-5xl font-bold mb-6 flex items-center justify-center">
              {Math.round(weather.main.temp)}°C
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 p-3 rounded-lg flex items-center">
                <ThermometerSun className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-sm">Feels Like</p>
                  <p className="font-semibold">{Math.round(weather.main.feels_like)}°C</p>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg flex items-center">
                <Droplets className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-sm">Humidity</p>
                  <p className="font-semibold">{weather.main.humidity}%</p>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg flex items-center">
                <Wind className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-sm">Wind Speed</p>
                  <p className="font-semibold">{weather.wind.speed} m/s</p>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg flex items-center">
                <Cloud className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-sm">Pressure</p>
                  <p className="font-semibold">{weather.main.pressure} hPa</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-white/70 mt-6 text-sm">
        Data provided by OpenWeatherMap
      </p>
    </div>
  );
}

export default App;
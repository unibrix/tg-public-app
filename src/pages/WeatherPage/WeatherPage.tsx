import { Section, Cell, List } from "@telegram-apps/telegram-ui";
import { locationManager } from "@tma.js/sdk-react";
import { useState, useEffect } from "react";
import { WeatherWidgetSkeleton, MapSkeleton } from "./WeatherPageSkeleton";
import styles from "./WeatherPage.module.css";

interface Location {
  latitude: number;
  longitude: number;
}

interface WeatherData {
  name: string;
  main: {
    temp: number;
  };
  weather: [
    {
      description: string;
      icon: string;
    }
  ];
}

export function WeatherPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationManager.isMounted) {
      setError("Location manager not available");
      return;
    }
    locationManager
      .requestLocation()
      .then((loc) => {
        if (loc) {
          setLocation(loc);
        } else {
          setError("Location unavailable");
        }
      })
      .catch((err) => {
        console.error("Location request error:", err);
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    if (location) {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const weatherBaseUrl = import.meta.env.VITE_OPENWEATHER_BASE_URL;

      if (!apiKey || apiKey === "your_api_key_here") {
        setError("API key not configured");
        return;
      }

      if (!weatherBaseUrl) {
        setError("Weather base URL not configured");
        return;
      }

      setLoading(true);

      const url = `${weatherBaseUrl}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=metric`;
      console.log("Fetching weather from:", url);
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Weather data:", data);
          if (data.cod === 200) {
            setWeather(data);
          } else {
            setError(`Weather API error: ${data.message || data.cod}`);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setError(`Failed to fetch weather: ${err.message}`);
          setLoading(false);
        });
    }
  }, [location]);

  return (
    <List>
      <Section header="Weather Widget">
        <div className={styles.weatherWidget}>
          {loading ? (
            <WeatherWidgetSkeleton />
          ) : weather ? (
            <div className={styles.weatherWidgetContent}>
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className={styles.weatherIcon}
              />
              <div>
                <div className={styles.weatherTemp}>
                  {Math.round(weather.main.temp)}°C
                </div>
                <div className={styles.weatherDescription}>
                  {weather.weather[0].description}
                </div>
                <div className={styles.weatherCity}>{weather.name}</div>
              </div>
            </div>
          ) : (
            <>
              <Cell subtitle={error}>Weather unavailable</Cell>
              <Cell subtitle="Location access required">
                Weather based on your location
              </Cell>
            </>
          )}
        </div>
      </Section>
      {location && (
        <Section header="Map">
          <div className={styles.mapContainer}>
            {loading ? (
              <MapSkeleton />
            ) : weather ? (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  location.longitude - 0.01
                },${location.latitude - 0.01},${location.longitude + 0.01},${
                  location.latitude + 0.01
                }&layer=mapnik&marker=${location.latitude},${
                  location.longitude
                }`}
                className={styles.mapIframe}
                title="Location Map"
              ></iframe>
            ) : null}
          </div>
        </Section>
      )}
      {location && (
        <Section header="Location">
          <Cell subtitle="Latitude">{location.latitude}</Cell>
          <Cell subtitle="Longitude">{location.longitude}</Cell>
        </Section>
      )}
    </List>
  );
}

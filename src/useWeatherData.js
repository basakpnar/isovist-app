import { useEffect, useState } from 'react';

const API_URL =
  'https://api.open-meteo.com/v1/forecast' +
  '?latitude=50.975&longitude=11.325' +
  '&daily=precipitation_hours' +
  '&hourly=temperature_2m,wind_speed_10m,shortwave_radiation' +
  '&timezone=Europe%2FBerlin';

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function useWeatherData() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(json => {
        const { hourly, daily, elevation } = json;

        // Solar: sum all hourly W/m² values → Wh/m² total → kWh/m²/day average
        const totalWh   = hourly.shortwave_radiation.reduce((a, b) => a + b, 0);
        const days      = daily.time.length;
        const solarPerDay = (totalWh / 1000) / days;

        // Precipitation: average hours per day across forecast window
        const precipPerDay = avg(daily.precipitation_hours);

        setWeather({
          elevation:      Math.round(elevation),
          tempAvg:        avg(hourly.temperature_2m).toFixed(1),
          tempMin:        Math.min(...hourly.temperature_2m).toFixed(1),
          tempMax:        Math.max(...hourly.temperature_2m).toFixed(1),
          windAvg:        avg(hourly.wind_speed_10m).toFixed(1),
          windMax:        Math.max(...hourly.wind_speed_10m).toFixed(1),
          solarPerDay:    solarPerDay.toFixed(2),
          precipPerDay:   precipPerDay.toFixed(1),
          forecastDays:   days,
          fetchedAt:      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        });
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return { weather, loading, error };
}

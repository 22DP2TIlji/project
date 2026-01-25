import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "OPENWEATHER_API_KEY missing" }, { status: 500 });
  }

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=Riga,lv&units=metric&appid=${key}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=Riga,lv&units=metric&appid=${key}`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentUrl, { cache: "no-store" }),
    fetch(forecastUrl, { cache: "no-store" }),
  ]);

  const currentText = await currentRes.text();
  const forecastText = await forecastRes.text();

  // если OpenWeather вернул ошибку — отдаём её на фронт
  if (!currentRes.ok) {
    return NextResponse.json(
      { error: "current_failed", status: currentRes.status, body: currentText },
      { status: 502 }
    );
  }
  if (!forecastRes.ok) {
    return NextResponse.json(
      { error: "forecast_failed", status: forecastRes.status, body: forecastText },
      { status: 502 }
    );
  }

  return NextResponse.json({
    current: JSON.parse(currentText),
    forecast: JSON.parse(forecastText),
  });
}

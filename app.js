// Get references to the elements we created in index.html
const queryInput = document.querySelector("#query");
const typeSelect = document.querySelector("#projectType");
const searchBtn  = document.querySelector("#searchBtn");
const statusEl   = document.querySelector("#status");
const resultsEl  = document.querySelector("#results");

queryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {   // Jos Enter-painiketta painetaan
    searchBtn.click();            // Kutsutaan samaa funktiota kuin nappia painettaessa
  }
});

// Attach click listener
searchBtn.addEventListener("click", () => {
  const query = queryInput.value.trim();
  const kind  = typeSelect.value;


  if (!query) {
    statusEl.textContent = "Please type a city.";
    resultsEl.innerHTML = "";
    return;
  }

  statusEl.textContent = "Loading live data...";
  resultsEl.innerHTML = "";

  fetchLiveData(kind, query);
});

// Helper: build URL
function buildUrl(kind, query) {
  const trimmed = query.trim();
  if (kind === "weather") {
    const apiKey = "585db3b8273205fe1e75197c69415de6"; // oma avain
    return `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(trimmed)}&units=metric&appid=${apiKey}`;
  }
  return "";
}

// Main AJAX function
async function fetchLiveData(kind, query) {
  try {
    const url = buildUrl(kind, query);
    if (!url) {
      statusEl.textContent = "Unknown project type selected.";
      return;
    }

    const response = await fetch(url);
    if (!response.ok) {
      statusEl.textContent =
        "The server responded with an error (" + response.status + "). Please try again.";
      return;
    }

    let rawData;
    rawData = await response.json(); // forecast JSON

    handleApiResponse(kind, rawData);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Network problem. Check your connection or API key.";
  }
}

// Handle API response
function handleApiResponse(kind, rawData) {
  let items = [];

  if (kind === "weather") {
    // Näytä nykyinen sää
    const current = rawData.list[0];
    items.push({
      title: rawData.city.name + " (Current)",
      line1: `Temp: ${Math.round(current.main.temp)} °C`,
      line2: current.weather[0].description,
      extra: `<img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="icon"> Humidity: ${current.main.humidity}%`
    });

 for (let i = 8; i <= 8*5; i += 8) { // aloitetaan indeksistä 8 (ensimmäinen tuleva päivä)
  const forecast = rawData.list[i];
  if (!forecast) break; // jos data loppuu kesken

  const date = new Date(forecast.dt * 1000);
  const dateString = date.toDateString();                // päivämäärä
  const timeString = date.toLocaleTimeString([], {       // kellonaika, 24h-muoto
    hour: '2-digit',
    minute: '2-digit'
  });

  items.push({
    title: `${dateString} <br> ${timeString}`,               // esim. "Tue Dec 3, 12:00"
    line1: `Temp: ${Math.round(forecast.main.temp)} °C`,
    line2: forecast.weather[0].description,
    extra: `<img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="icon"> Humidity: ${forecast.main.humidity}%`
  });
}
 

  if (!items.length) {
    statusEl.textContent = "No results found for that search.";
    resultsEl.innerHTML = "";
    return;
  }

  statusEl.textContent = "Showing " + items.length + " result(s).";
  renderCards(items);
}

// Render cards
function renderCards(items) {
  const html = items.map(item => {
    return (
      '<article class="result-card">' +
        '<h3>' + item.title + '</h3>' +
        '<p>' + item.line1 + '</p>' +
        '<p>' + item.line2 + '</p>' +
        '<p class="muted">' + item.extra + '</p>' +
      '</article>'
    );
  }).join("");

  resultsEl.innerHTML = html;
}
}
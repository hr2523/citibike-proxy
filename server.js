const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/bikes', async (req, res) => {
  try {
    console.log('Fetching Citibike data...');
    const response = await fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json');
    const data = await response.json();
    
    console.log('Total stations:', data.data.stations.length);
    
    let totalInUse = 0;
    let debugCount = 0;
    
    data.data.stations.forEach(station => {
      const capacity = station.capacity || 0;
      const available = station.num_bikes_available || 0;
      const disabled = station.num_bikes_disabled || 0;
      const inUse = capacity - available - disabled;
      
      // 처음 5개 디버깅
      if (debugCount < 5) {
        console.log(`Station ${debugCount}: capacity=${capacity}, avail=${available}, disabled=${disabled}, inUse=${inUse}`);
        debugCount++;
      }
      
      if (inUse > 0) {
        totalInUse += inUse;
      }
    });
    
    console.log('Total in use:', totalInUse);
    
    res.json({
      bikes: totalInUse,
      energy: Math.floor(totalInUse / 100),
      stations: data.data.stations.length,
      debug: "check logs"
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Citibike Proxy Running! Try /bikes');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running on port', PORT));

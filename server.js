const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/bikes', async (req, res) => {
  try {
    const statusRes = await fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json');
    const statusData = await statusRes.json();
    
    let totalEmptyDocks = 0;
    let totalBikesAvailable = 0;
    
    statusData.data.stations.forEach(station => {
      totalEmptyDocks += station.num_docks_available || 0;
      totalBikesAvailable += station.num_bikes_available || 0;
    });
    
    const totalSlots = totalEmptyDocks + totalBikesAvailable;
    
    // 빈 도크 비율 (0-100)
    const energy = Math.round((totalEmptyDocks / totalSlots) * 100);
    
    console.log('Empty:', totalEmptyDocks);
    console.log('Bikes:', totalBikesAvailable);
    console.log('Energy:', energy);
    
    res.json({
      empty_docks: totalEmptyDocks,
      bikes: totalBikesAvailable,
      energy: energy  // 0-100 ✅
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
app.listen(PORT, () => console.log('Server running!'));

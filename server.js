const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/bikes', async (req, res) => {
  try {
    const statusRes = await fetch('https://gbfs.lyft.com/gbfs/2.3/bkn/en/station_status.json');
    const statusData = await statusRes.json();
    
    let totalEmptyDocks = 0;
    let totalBikesAvailable = 0;
    let totalEbikesAvailable = 0;     
    let totalBikesDisabled = 0;
    let totalDocksDisabled = 0;
    
    statusData.data.stations.forEach(station => {
      totalEmptyDocks += station.num_docks_available || 0;
      totalBikesAvailable += station.num_bikes_available || 0;
      totalEbikesAvailable += station.num_ebikes_available || 0; 
      totalBikesDisabled += station.num_bikes_disabled || 0;
      totalDocksDisabled += station.num_docks_disabled || 0;
    });
    
    // 완전한 capacity
    const totalCapacity = totalEmptyDocks + totalBikesAvailable + totalEbikesAvailable + totalBikesDisabled + totalDocksDisabled;
    const energy = Math.round((totalEmptyDocks / totalCapacity) * 100);
    
    res.json({
      empty_docks: totalEmptyDocks,
      bikes: totalBikesAvailable,
      ebikes: totalEbikesAvailable,      
      bikes_disabled: totalBikesDisabled,
      docks_disabled: totalDocksDisabled,
      capacity: totalCapacity,
      energy: energy
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Citibike Proxy Running! Try /bikes');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));

const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/bikes', async (req, res) => {
  try {
    // 1. Station Info (capacity)
    const infoRes = await fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json');
    const infoData = await infoRes.json();
    
    // 2. Station Status (available bikes)
    const statusRes = await fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json');
    const statusData = await statusRes.json();
    
    // capacity 맵 만들기
    const capacityMap = {};
    infoData.data.stations.forEach(station => {
      capacityMap[station.station_id] = station.capacity;
    });
    
    let totalInUse = 0;
    
    statusData.data.stations.forEach(station => {
      const stationId = station.station_id;
      const capacity = capacityMap[stationId] || 0;
      const available = station.num_bikes_available || 0;
      const disabled = station.num_bikes_disabled || 0;
      
      const inUse = capacity - available - disabled;
      
      if (inUse > 0) {
        totalInUse += inUse;
      }
    });
    
    console.log('Total bikes in use:', totalInUse);
    
    res.json({
      bikes: totalInUse,
      energy: Math.floor(totalInUse / 100)
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

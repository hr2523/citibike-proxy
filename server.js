const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/bikes', async (req, res) => {
  try {
    const statusRes = await fetch('https://gbfs.lyft.com/gbfs/2.3/bkn/en/station_status.json');
    const statusData = await statusRes.json();
    
    const TOTAL_FLEET = 38000;
    
    let bikesAtStations = 0;
    
    statusData.data.stations.forEach(station => {
      if (station.vehicle_types_available) {
        station.vehicle_types_available.forEach(vehicleType => {
          bikesAtStations += vehicleType.count || 0;
        });
      }
    });
    
    const bikesInUse = TOTAL_FLEET - bikesAtStations;
    
    const usage = Math.round((bikesInUse / TOTAL_FLEET) * 100);
    
    res.json({
      total_fleet: TOTAL_FLEET,
      bikes_at_stations: bikesAtStations,
      bikes_in_use: bikesInUse,
      usage: usage
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

const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/bikes', async (req, res) => {
  try {
    const response = await fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json');
    const data = await response.json();
    
    let totalInUse = 0;
    
    data.data.stations.forEach(station => {
      const capacity = station.capacity || 0;
      const available = station.num_bikes_available || 0;
      const disabled = station.num_bikes_disabled || 0;
      const inUse = capacity - available - disabled;
      
      if (inUse > 0) {
        totalInUse += inUse;
      }
    });
    
    res.json({
      bikes: totalInUse,
      energy: Math.floor(totalInUse / 100)
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running!'));

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
      // 빈 도크 = 사용 중인 자전거
      totalEmptyDocks += station.num_docks_available || 0;
      // 사용 가능한 자전거
      totalBikesAvailable += station.num_bikes_available || 0;
    });
    
    console.log('Empty docks:', totalEmptyDocks);
    console.log('Available bikes:', totalBikesAvailable);
    
    // 빈 도크 = 활동량
    const activity = totalEmptyDocks;
    const energy = Math.floor(activity / 100);
    
    res.json({
      empty_docks: totalEmptyDocks,
      available_bikes: totalBikesAvailable,
      activity: activity,
      energy: energy
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
```

---

## **개념:**
```
빈 도크 많음 = 자전거 많이 사용 중
빈 도크 적음 = 자전거 스테이션에 있음

→ 빈 도크 수 = NYC 활동량 ✅

import { ClusterManager } from "discord-hybrid-sharding";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Your existing ClusterManager code...
const manager = new ClusterManager(`./src/cold.js`, {
  totalShards: "auto",
  shardsPerClusters: 2,
  totalClusters: "auto",
  mode: 'process',
  token: process.env.TOKEN, // Use process.env.TOKEN directly
});
manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });

// Simple web server to keep the process alive
app.get('/', (req, res) => {
  const message = `
─── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ───
Made By - PHV#7163 & CJ_foryou
Tutorial - [youtube.com/channel/UCGTbFucVXPA9OBTUPZj-TzQ](https://youtube.com/channel/UCGTbFucVXPA9OBTUPZj-TzQ)
Discord - [https://discord.gg/phvcommunity](https://discord.gg/phvcommunity)
─── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ───
  `;
  res.send(message);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
import { exec } from 'child_process';
exec('pm2 start src/index.js --name my-discord-bot', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});
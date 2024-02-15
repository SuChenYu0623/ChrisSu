const express = require('express');
const path = require('path');

const app = express();

// 指定伺服器監聽的埠號和主機
const port = 3000;
const hostname = '192.168.0.12';

// 靜態檔案（例如 React 應用程式的建置）的目錄
const buildPath = path.join(__dirname, 'build');

// 設定 express 使用靜態檔案目錄
app.use(express.static(buildPath));

// 所有路由都返回 React 應用程式的 HTML 頁面
app.get('*', (req, res) => {
  console.log('request')
  res.sendFile(path.join(buildPath, 'index.html'));
});

// 監聽指定埠號
app.listen(port, hostname, () => {
  console.log(`Server is running on port ${port}`);
});


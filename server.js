const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:5000', // Sesuaikan dengan URL frontend Vue.js Anda
    methods: ['GET', 'POST'],
    allowedHeaders: ['Access-Control-Allow-Origin'],
    credentials: true,
  },
});
const port = 3000;

// Middleware untuk CORS
app.use(cors({
  origin: 'http://localhost:5000', // Sesuaikan dengan URL frontend Vue.js Anda
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.static('public'));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sensor_data',
  password: '153426',
  port: 5432,
});

// Menyimpan data sensor ke database dan mengirimkannya ke client melalui WebSocket
app.post('/api/sensor-data', (req, res) => {
  const { sensor1_humidity, sensor1_temperature, sensor2_humidity, sensor2_temperature, sensor3_humidity, sensor3_temperature, sensor4_humidity, sensor4_temperature, sensor5_humidity, sensor5_temperature, sensor6_humidity, sensor6_temperature } = req.body;
  
  const query = `
    INSERT INTO sensor_data (sensor1_humidity, sensor1_temperature, sensor2_humidity, sensor2_temperature, sensor3_humidity, sensor3_temperature, sensor4_humidity, sensor4_temperature, sensor5_humidity, sensor5_temperature, sensor6_humidity, sensor6_temperature)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `;
  const values = [sensor1_humidity, sensor1_temperature, sensor2_humidity, sensor2_temperature, sensor3_humidity, sensor3_temperature, sensor4_humidity, sensor4_temperature, sensor5_humidity, sensor5_temperature, sensor6_humidity, sensor6_temperature ];

  pool.query(query, values, (error, results) => {
    if (error) {
      res.status(500).send('Gagal menyimpan data ke database');
      console.error(error);
      return;
    }
    // Kirim data ke semua client menggunakan Socket.IO
    const data = {
      sensor1_humidity, 
      sensor1_temperature, 
      sensor2_humidity, 
      sensor2_temperature, 
      sensor3_humidity, 
      sensor3_temperature,
      sensor4_humidity, 
      sensor4_temperature,
      sensor5_humidity, 
      sensor5_temperature,
      sensor6_humidity, 
      sensor6_temperature,
      timestamp: new Date()
    };
    io.emit('sensorData', data);
    console.log('Data dikirim ke klien:', data);
    res.status(200).send('Data berhasil disimpan');
  });
});

// Mengambil data sensor dari database dan mengirimkannya ke client melalui HTTP GET
app.get('/api/sensor-data', (req, res) => {
  pool.query('SELECT * FROM sensor_data', (error, results) => {
    if (error) {
      res.status(500).send('Gagal mengambil data dari database');
      console.error(error);
      return;
    }
    res.json(results.rows);
  });
});

// Socket.IO koneksi
io.on('connection', (socket) => {
  console.log('Klien terhubung.');

  // Kirim data terbaru segera setelah koneksi terhubung
  pool.query('SELECT * FROM sensor_data', (error, results) => {
    if (error) {
      socket.emit('sensorDataError', 'Gagal mengambil data dari database');
      console.error(error);
      return;
    }
    socket.emit('sensorData', results.rows);
  });

  // Menangani peristiwa ketika klien meminta data sensor
  socket.on('requestSensorData', () => {
    pool.query('SELECT * FROM sensor_data', (error, results) => {
      if (error) {
        socket.emit('sensorDataError', 'Gagal mengambil data dari database');
        console.error(error);
        return;
      }
      socket.emit('sensorData', results.rows);
    });
  });
});

app.post('/reset-data', async (req, res) => {
  try {
    await pool.query('DELETE from sensor_data');
    res.json({ success: true}); 
  } catch (error) {
    console.error(error);
    res.json({ success: false});
  }
});

app.post('/copy-data', async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO sensor_data_history (id, sensor1_humidity, sensor1_temperature, sensor2_humidity, sensor2_temperature, sensor3_humidity, sensor3_temperature, sensor4_humidity, sensor4_temperature, sensor5_humidity, sensor5_temperature, sensor6_humidity, sensor6_temperature, timestamp)
      SELECT id, sensor1_humidity, sensor1_temperature, sensor2_humidity, sensor2_temperature, sensor3_humidity, sensor3_temperature, sensor4_humidity, sensor4_temperature, sensor5_humidity, sensor5_temperature, sensor6_humidity, sensor6_temperature, timestamp
      FROM sensor_data`);
    res.json({ success: true}); 
  } catch (error) {
    console.error(error);
    res.json({ success: false});
  }
});

app.post('/delete-data', async (req, res) => {
  try {
    await pool.query('DELETE from sensor_data_history');
    res.json({ success: true}); 
  } catch (error) {
    console.error(error);
    res.json({ success: false});
  }
});

//DATA HISTORY

app.get('/api/copy-data', (req, res) => {
  pool.query('SELECT * FROM sensor_data_history', (error, results) => {
    if (error) {
      res.status(500).send('Gagal mengambil data dari database');
      console.error(error);
      return;
    }
    res.json(results.rows);
  });
});

// Socket.IO koneksi
io.on('connection', (socket) => {
  console.log('Klien terhubung.');

  // Kirim data terbaru segera setelah koneksi terhubung
  pool.query('SELECT * FROM sensor_data_history', (error, results) => {
    if (error) {
      socket.emit('sensorDataHistoryError', 'Gagal mengambil data dari database');
      console.error(error);
      return;
    }
    socket.emit('sensorDataHistory', results.rows);
  });

  // Menangani peristiwa ketika klien meminta data sensor
  socket.on('requestSensorDataHistory', () => {
    pool.query('SELECT * FROM sensor_data_history', (error, results) => {
      if (error) {
        socket.emit('sensorDataHistoryError', 'Gagal mengambil data dari database');
        console.error(error);
        return;
      }
      socket.emit('sensorDataHistory', results.rows);
    });
  });
});

// Inisialisasi server HTTP
server.listen(port, () => {
  console.log(`Server berjalan pada http://localhost:${port}`);
});
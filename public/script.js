document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  socket.on('connect', () => {
    console.log('Terhubung ke WebSocket');
    socket.emit('requestSensorData'); // Minta data sensor saat terhubung
  });

  socket.on('sensorData', (data) => {
    console.log('Data diterima dari WebSocket:', data);
    if (Array.isArray(data)) {
      appendDataToCharts(data);
    } else {
      console.error('Data yang diterima bukan array:', data);
    }
  });

  socket.on('sensorDataError', (message) => {
    console.error('Error menerima data dari WebSocket:', message);
  });

  // Sensor Bagian Atas (Upper Chart)
  const ctxTempUp = document.getElementById('temperatureUpperChart').getContext('2d');
  const ctxHumUp = document.getElementById('humidityUpperChart').getContext('2d');

  const temperatureUpperChart = new Chart(ctxTempUp, {
    type: 'line',
    data: {
      labels: [], // Akan diisi dengan waktu dari timestamp
      datasets: [
        {
          label: 'Sensor 5 Temperature',
          data: [],
          borderColor: 'orange',
          fill: false
        },
        {
          label: 'Sensor 6 Temperature',
          data: [],
          borderColor: 'purple',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            tooltipFormat: 'HH:mm', // Format tooltip waktu (HH:mm)
            displayFormats: {
              minute: 'HH:mm' // Format tampilan sumbu x (HH:mm)
            }
          },
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        }
      }
    }
  });

  const humidityUpperChart = new Chart(ctxHumUp, {
    type: 'line',
    data: {
      labels: [], // Akan diisi dengan waktu dari timestamp
      datasets: [
        {
          label: 'Sensor 5 Humidity',
          data: [],
          borderColor: 'orange',
          fill: false
        },
        {
          label: 'Sensor 6 Humidity',
          data: [],
          borderColor: 'purple',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            tooltipFormat: 'HH:mm', // Format tooltip waktu (HH:mm)
            displayFormats: {
              minute: 'HH:mm' // Format tampilan sumbu x (HH:mm)
            }
          },
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Humidity (%)'
          }
        }
      }
    }
  });

  // Sensor Bagian Bawah (Lower Chart)
  const ctxTempDown = document.getElementById('temperatureLowerChart').getContext('2d');
  const ctxHumDown = document.getElementById('humidityLowerChart').getContext('2d');

  const temperatureLowerChart = new Chart(ctxTempDown, {
    type: 'line',
    data: {
      labels: [], // Akan diisi dengan waktu dari timestamp
      datasets: [
        {
          label: 'Sensor 1 Temperature',
          data: [],
          borderColor: 'red',
          fill: false
        },
        {
          label: 'Sensor 2 Temperature',
          data: [],
          borderColor: 'blue',
          fill: false
        },
        {
          label: 'Sensor 3 Temperature',
          data: [],
          borderColor: 'green',
          fill: false
        },
        {
          label: 'Sensor 4 Temperature',
          data: [],
          borderColor: 'yellow',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            tooltipFormat: 'HH:mm', // Format tooltip waktu (HH:mm)
            displayFormats: {
              minute: 'HH:mm' // Format tampilan sumbu x (HH:mm)
            }
          },
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        }
      }
    }
  });

  const humidityLowerChart = new Chart(ctxHumDown, {
    type: 'line',
    data: {
      labels: [], // Akan diisi dengan waktu dari timestamp
      datasets: [
        {
          label: 'Sensor 1 Humidity',
          data: [],
          borderColor: 'red',
          fill: false
        },
        {
          label: 'Sensor 2 Humidity',
          data: [],
          borderColor: 'blue',
          fill: false
        },
        {
          label: 'Sensor 3 Humidity',
          data: [],
          borderColor: 'green',
          fill: false
        },
        {
          label: 'Sensor 4 Humidity',
          data: [],
          borderColor: 'yellow',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            tooltipFormat: 'HH:mm', // Format tooltip waktu (HH:mm)
            displayFormats: {
              minute: 'HH:mm' // Format tampilan sumbu x (HH:mm)
            }
          },
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Humidity (%)'
          }
        }
      }
    }
  });

  function appendDataToCharts(data) {
    console.log('Menambahkan data baru ke chart:', data);
  
    data.forEach(entry => {
      const timestamp = new Date(entry.timestamp);
      
      // Append data for temperature Upper chart (Sensor 5 and Sensor 6)
      if (!temperatureUpperChart.data.labels.includes(timestamp)) {
        temperatureUpperChart.data.labels.push(timestamp);
        temperatureUpperChart.data.datasets[0].data.push(entry.sensor5_temperature);
        temperatureUpperChart.data.datasets[1].data.push(entry.sensor6_temperature);
      }
      
      // Append data for humidity Upper chart (Sensor 5 and Sensor 6)
      if (!humidityUpperChart.data.labels.includes(timestamp)) {
        humidityUpperChart.data.labels.push(timestamp);
        humidityUpperChart.data.datasets[0].data.push(entry.sensor5_humidity);
        humidityUpperChart.data.datasets[1].data.push(entry.sensor6_humidity);
      }
  
      // Append data for temperature Lower chart (Sensor 1, 2, 3, and 4)
      if (!temperatureLowerChart.data.labels.includes(timestamp)) {
        temperatureLowerChart.data.labels.push(timestamp);
        temperatureLowerChart.data.datasets[0].data.push(entry.sensor1_temperature);
        temperatureLowerChart.data.datasets[1].data.push(entry.sensor2_temperature);
        temperatureLowerChart.data.datasets[2].data.push(entry.sensor3_temperature);
        temperatureLowerChart.data.datasets[3].data.push(entry.sensor4_temperature);
      }
      
      // Append data for humidity Lower chart (Sensor 1, 2, 3, and 4)
      if (!humidityLowerChart.data.labels.includes(timestamp)) {
        humidityLowerChart.data.labels.push(timestamp);
        humidityLowerChart.data.datasets[0].data.push(entry.sensor1_humidity);
        humidityLowerChart.data.datasets[1].data.push(entry.sensor2_humidity);
        humidityLowerChart.data.datasets[2].data.push(entry.sensor3_humidity);
        humidityLowerChart.data.datasets[3].data.push(entry.sensor4_humidity);
      }
    });
  
    // Update the charts
    temperatureUpperChart.update();
    humidityUpperChart.update();
    temperatureLowerChart.update();
    humidityLowerChart.update();
  }
});
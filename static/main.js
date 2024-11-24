// Standard Chart.js Optionen
const chartOptions = {
    responsive: true,
    scales: {
        y: {
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',  // Gitterfarbe im Dark Mode, wird später angepasst
            },
            ticks: {
                color: 'rgba(255, 255, 255, 0.7)',  // Achsenbeschriftungen im Dark Mode, wird später angepasst
            }
        },
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',  // Gitterfarbe im Dark Mode, wird später angepasst
            },
            ticks: {
                color: 'rgba(255, 255, 255, 0.7)',  // Achsenbeschriftungen im Dark Mode, wird später angepasst
            }
        }
    },
    plugins: {
        legend: {
            labels: {
                color: 'rgba(255, 255, 255, 0.7)',  // Legendenfarbe im Dark Mode, wird später angepasst
            }
        }
    }
};

// Funktion, um die Farben basierend auf dem aktuellen Modus zu setzen
function updateChartColors() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Setze die Farben für den Dark Mode oder Light Mode
    const ticksColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#333';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#ddd';
    const legendColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#333';

    // Aktualisieren der Optionen
    chartOptions.scales.y.ticks.color = ticksColor;
    chartOptions.scales.x.ticks.color = ticksColor;
    chartOptions.scales.y.grid.color = gridColor;
    chartOptions.scales.x.grid.color = gridColor;
    chartOptions.plugins.legend.labels.color = legendColor;
    
    // Updates der Diagramme mit den neuen Optionen
    loadChart.options = {...loadChart.options, ...chartOptions};
    memoryChart.options = {...memoryChart.options, ...chartOptions, scales: {} }; // Keine Achsen für Doughnut Diagramme
    diskChart.options = {...diskChart.options, ...chartOptions, scales: {} }; // Keine Achsen für Doughnut Diagramme
    networkChart.options = {...networkChart.options, ...chartOptions};
    tempGraph.options = {...tempGraph.options, ...chartOptions};

    loadChart.update();
    memoryChart.update();
    diskChart.update();
    networkChart.update();
    tempGraph.update();
}

// Load Chart
const loadChart = new Chart(document.getElementById('loadChart'), {
    type: 'bar',
    data: {
        labels: ['1 min', '5 min', '15 min'],
        datasets: [{
            label: 'Load Average (%)',
            data: [],
            backgroundColor: '#0073e6'
        }]
    },
    options: {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value + '%';  // Wir fügen "%" hinzu, um es als Prozentsatz darzustellen
                    }
                },
                max: 100, // Maximum Wert auf der Y-Achse als 100%
            }
        }
    }
});

// Memory Chart (in MB)
const memoryChart = new Chart(document.getElementById('memoryChart'), {
    type: 'doughnut',
    data: {
        labels: ['Used', 'Free'],
        datasets: [{
            label: 'Memory Usage (MB)',
            data: [],
            backgroundColor: ['#ff6384', '#36a2eb']
        }]
    },
    options: chartOptions
});

// Disk Chart (in GB)
const diskChart = new Chart(document.getElementById('diskChart'), {
    type: 'doughnut',
    data: {
        labels: ['Used', 'Free'],
        datasets: [{
            label: 'Disk Usage (GB)',
            data: [],
            backgroundColor: ['#4bc0c0', '#ffcd56']
        }]
    },
    options: chartOptions
});

// Network Chart (in KB)
const networkChart = new Chart(document.getElementById('networkChart'), {
    type: 'line',
    data: {
        labels: Array(20).fill(''),
        datasets: [
            { 
                label: 'Sent (KB)', 
                data: [], 
                borderColor: '#0073e6', 
                fill: false 
            },
            { 
                label: 'Received (KB)', 
                data: [], 
                borderColor: '#ff6384', 
                fill: false 
            }
        ]
    },
    options: chartOptions
});

// Temp Graph (in °C)
const tempGraph = new Chart(document.getElementById('tempGraph'), {
    type: 'line',
    data: {
        labels: Array(20).fill(''), // Leere Labels für die Achse
        datasets: [
            {
                label: 'CPU Temperature (°C)',
                data: Array(20).fill(0), // Anfangswerte
                borderColor: '#36a2eb',  // Anfangsfarbe
                fill: false,             // Kein Füllen unter der Linie
                tension: 0.1             // Leichte Wellenform
            }
        ]
    },
    options: {
        ...chartOptions,
        responsive: true,
        scales: {
            x: { 
                display: false, // Verstecke die x-Achse
            },
            y: {
                min: 0,
                max: 100,
                ticks: { stepSize: 10 },
                title: { text: 'Temperature (°C)', display: true },
            }
        },
        animation: { animateRotate: true }, // Animation für die Linie
    }
});

// Funktion, um den Graphen zu aktualisieren
function updateTemperatureGraph(temp) {
    // Holen der aktuellen Daten
    const currentData = tempGraph.data.datasets[0].data;

    // Schiebe alle Werte um 1 nach links, um Platz für den neuen Wert zu schaffen
    currentData.push(temp);
    currentData.shift();

    // Berechne die Farbe basierend auf der Temperatur
    let color = `rgb(${Math.min(255, (temp * 2.55))}, ${Math.max(0, 255 - (temp * 2.55))}, 0)`; // Übergang von grün zu rot

    // Aktualisiere die Daten des Graphen
    tempGraph.data.datasets[0].data = currentData;
    tempGraph.data.datasets[0].borderColor = color;

    // Update den Graphen
    tempGraph.update();
}

// Update-Charts und Dark Mode Integration
setInterval(async () => {
    const stats = await fetchStats();
    updateCharts(stats);
}, 2000);

async function fetchStats() {
    const response = await fetch('/stats');
    return response.json();
}

function updateCharts(stats) {
    // Load Average in Prozent (multiplizieren mit 100)
    const loadData = [
        (stats.load[0] * 100).toFixed(2),  // Wert in Prozent umrechnen und auf 2 Dezimalstellen runden
        (stats.load[1] * 100).toFixed(2),
        (stats.load[2] * 100).toFixed(2)
    ];
    loadChart.data.datasets[0].data = loadData;
    loadChart.update();

    // Memory Usage in MB
    const usedMemoryMB = (stats.memory.used / (1024 * 1024)).toFixed(1);  // Umrechnung in MB
    const freeMemoryMB = (stats.memory.free / (1024 * 1024)).toFixed(1);  // Umrechnung in MB
    memoryChart.data.datasets[0].data = [usedMemoryMB, freeMemoryMB];
    memoryChart.update();

    // Disk Usage in GB
    const usedDiskGB = (stats.disk.used / (1024 * 1024 * 1024)).toFixed(1);  // Umrechnung in GB
    const freeDiskGB = (stats.disk.free / (1024 * 1024 * 1024)).toFixed(1);  // Umrechnung in GB
    diskChart.data.datasets[0].data = [usedDiskGB, freeDiskGB];
    diskChart.update();

    // Netzwerk Traffic in KB
    const sentKB = (stats.network.sent / 1024).toFixed(1);
    const receivedKB = (stats.network.received / 1024).toFixed(1);
    networkChart.data.datasets[0].data.push(sentKB);
    networkChart.data.datasets[1].data.push(receivedKB);
    networkChart.data.labels.push('');
    networkChart.update();

    // CPU Temp
    const cpuTemp = stats.cpuTemperature;
    updateTemperatureGraph(cpuTemp);
}

// Dark Mode Button und Icon umschalten
const darkModeButton = document.getElementById('darkModeToggle');
const icon = document.getElementById('modeIcon');

// Überprüfen, ob der Dark Mode zuvor aktiviert wurde (mit localStorage)
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
} else {
    document.body.classList.remove('dark-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

// Dark Mode Toggle Event Listener
darkModeButton.addEventListener('click', () => {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('darkMode', 'disabled');
    }

    // Farbänderungen nach dem Wechsel anwenden
    updateChartColors();
});

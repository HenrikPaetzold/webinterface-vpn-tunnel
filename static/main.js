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

// Memory Chart
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

// Disk Chart
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

// Network Chart
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

// Temp Graph
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

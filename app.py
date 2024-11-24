from flask import Flask, jsonify, render_template
import psutil
import os

app = Flask(__name__)

def get_system_stats():
    load_avg = os.getloadavg()
    temp = psutil.sensors_temperatures().get('cpu_thermal', [])[0].current if psutil.sensors_temperatures() else 0
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    net_io = psutil.net_io_counters()

    return {
        "load_avg": load_avg,
        "cpu_temp": temp,
        "memory": {"used": memory.used, "total": memory.total, "percent": memory.percent},
        "disk": {"used": disk.used, "total": disk.total, "percent": disk.percent},
        "network": {"sent": net_io.bytes_sent, "received": net_io.bytes_recv}
    }

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/stats')
def stats():
    # Holt die Systemstatistiken
    load = psutil.getloadavg()  # Holt die Load-Avg für 1, 5 und 15 Minuten
    memory = psutil.virtual_memory()  # Holt die Speicherinformationen
    disk = psutil.disk_usage('/')  # Holt die Festplattennutzung
    network = psutil.net_io_counters()  # Holt Netzwerkstatistiken
    temp = psutil.sensors_temperatures().get('cpu_thermal', [])[0].current if psutil.sensors_temperatures() else 0  # Holt die CPU-Temperatur

    # Gebe die Daten als JSON zurück
    return jsonify({
        'load': load,
        'memory': {
            'used': memory.used,
            'free': memory.free,
        },
        'disk': {
            'used': disk.used,
            'free': disk.free,
        },
        'network': {
            'sent': network.bytes_sent,
            'received': network.bytes_recv,
        },
        'cpuTemperature': temp  # Aktuelle CPU-Temperatur zurückgeben
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=True)  # Läuft auf allen IP-Adressen des Hosts und Port 80

from flask import Flask, jsonify, render_template
import psutil
import os
import subprocess
import time

app = Flask(__name__)

def get_system_stats():
    try:
        load_avg = os.getloadavg()
    except Exception as e:
        load_avg = [0, 0, 0]  # Defaultwerte, wenn Fehler auftreten

    try:
        temp = psutil.sensors_temperatures().get('cpu_thermal', [])[0].current if psutil.sensors_temperatures() else 0
    except Exception as e:
        temp = 0  # Setze Temperatur auf 0, wenn Fehler auftreten

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
    
@app.route('/quickstats')
def quickstats():
    # Check if services are active
    services = ['wireguard', 'hostapd', 'dnsmasq', 'dhcpcd']
    service_status = []
    
    for service in services:
        status = check_service_status(service)
        service_status.append({"service": service, "status": status})
    
    # Check WireGuard Tunnelling Status
    wireguard_status = check_wireguard_status()

    # Get Uptime
    uptime = get_uptime()

    # Get number of connected devices to the access point
    connected_devices = get_connected_devices()

    return jsonify({
        'services': service_status,
        'wireguardStatus': wireguard_status,
        'uptime': uptime,
        'connectedDevices': connected_devices
    })

def check_service_status(service_name):
    try:
        result = subprocess.run(['systemctl', 'is-active', service_name], capture_output=True, text=True)
        return result.stdout.strip() == 'active'
    except subprocess.CalledProcessError:
        return False

def check_wireguard_status():
    try:
        result = subprocess.run(['wg', 'show'], capture_output=True, text=True)
        output = result.stdout.strip()
        
        # Additional check: Look for a valid handshake
        if "latest handshake" in output:
            return True
        return False
    except subprocess.CalledProcessError:
        return False

def get_uptime():
    uptime_seconds = int(time.time() - psutil.boot_time())
    hours = uptime_seconds // 3600
    minutes = (uptime_seconds % 3600) // 60
    return f"{hours} hours {minutes} minutes"

def get_connected_devices():
    try:
        result = subprocess.run(['iw', 'dev', 'wlan0', 'station', 'dump'], capture_output=True, text=True)
        output = result.stdout.strip()

        # Find all MAC addresses in the output
        mac_addresses = re.findall(r'([0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2})', output)

        # Return the number of found MAC addresses
        return len(mac_addresses)
    except subprocess.CalledProcessError:
        return 0

@app.route('/shutdown', methods=['POST'])
def shutdown():
    try:
        os.system('sudo shutdown now')
    except Exception as e:
        return f"An error occurred: {e}", 500
    return '', 204  # No content, stays on the same page

@app.route('/restart', methods=['POST'])
def restart():
    try:
        os.system('sudo reboot')
    except Exception as e:
        return f"An error occurred: {e}", 500
    return '', 204  # No content, stays on the same page

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=True)  # Läuft auf allen IP-Adressen des Hosts und Port 80
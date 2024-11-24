from flask import Flask, jsonify, render_template
import psutil
import os
import time

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

@app.route("/stats")
def stats():
    return jsonify(get_system_stats())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)

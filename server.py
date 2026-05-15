from flask import Flask, request, jsonify, send_file, abort
import json, os, threading

app = Flask(__name__)
DATA_FILE = 'sow_data.json'
_lock = threading.Lock()

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    with _lock:
        return jsonify(load_data())

@app.route('/api/data', methods=['POST'])
def post_data():
    data = request.get_json(force=True, silent=True)
    if data is None:
        abort(400)
    with _lock:
        save_data(data)
    return jsonify({'ok': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

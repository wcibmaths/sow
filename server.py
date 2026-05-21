from flask import Flask, request, jsonify, send_file, abort
import os
import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool

app = Flask(__name__)

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(
            minconn=1,
            maxconn=5,
            dsn=os.environ['DATABASE_URL']
        )
    return _pool

def load_data():
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT data FROM sow_store WHERE id = 1")
            row = cur.fetchone()
            return dict(row['data']) if row else {}
    finally:
        pool.putconn(conn)

def save_data(data):
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO sow_store (id, data, updated_at)
                VALUES (1, %s::jsonb, NOW())
                ON CONFLICT (id) DO UPDATE
                    SET data = EXCLUDED.data,
                        updated_at = NOW()
                """,
                (psycopg2.extras.Json(data),)
            )
        conn.commit()
    finally:
        pool.putconn(conn)

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/wellington-logo.png')
def wellington_logo():
    return send_file('attached_assets/wellington-logo.png', mimetype='image/png')

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(load_data())

@app.route('/api/data', methods=['POST'])
def post_data():
    data = request.get_json(force=True, silent=True)
    if data is None:
        abort(400)
    save_data(data)
    return jsonify({'ok': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

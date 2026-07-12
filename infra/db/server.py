import json
import sqlite3
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

DB_PATH = Path(__file__).parent / 'data.db'
PORT = int(__import__('os').environ.get('DB_SERVER_PORT', '4000'))

class Handler(BaseHTTPRequestHandler):
    def _send_json(self, obj, status=200):
        data = json.dumps(obj).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.startswith('/users'):
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute('SELECT id, name, email FROM users')
            rows = cur.fetchall()
            conn.close()
            users = [{'id': r[0], 'name': r[1], 'email': r[2]} for r in rows]
            self._send_json({'users': users})
        else:
            self._send_json({'error': 'not found'}, status=404)

    def do_POST(self):
        if self.path.startswith('/users'):
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length) if length else b''
            try:
                payload = json.loads(body.decode('utf-8'))
                name = payload.get('name')
                email = payload.get('email')
                if not name or not email:
                    raise ValueError('name and email required')
                conn = sqlite3.connect(DB_PATH)
                cur = conn.cursor()
                cur.execute('INSERT INTO users (name,email) VALUES (?,?)', (name, email))
                conn.commit()
                uid = cur.lastrowid
                conn.close()
                self._send_json({'id': uid, 'name': name, 'email': email}, status=201)
            except Exception as e:
                self._send_json({'error': str(e)}, status=400)
        else:
            self._send_json({'error': 'not found'}, status=404)

    def log_message(self, format, *args):
        # reduce verbosity
        print("%s - - [%s] %s" % (self.client_address[0], self.log_date_time_string(), format%args))

if __name__ == '__main__':
    httpd = HTTPServer(('127.0.0.1', PORT), Handler)
    print(f"DB server listening on 127.0.0.1:{PORT}")
    httpd.serve_forever()

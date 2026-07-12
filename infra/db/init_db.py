import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / 'data.db'

def init():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    );
    ''')
    cur.execute('INSERT OR IGNORE INTO users (id, name, email) VALUES (1, "Alice", "alice@example.com")')
    cur.execute('INSERT OR IGNORE INTO users (id, name, email) VALUES (2, "Bob", "bob@example.com")')
    conn.commit()
    conn.close()
    print('Initialized DB at', DB_PATH)

if __name__ == "__main__":
    init()

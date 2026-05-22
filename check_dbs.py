import sqlite3
import os

dbs = [
    'training_history.db',
    'race_database.db',
    'keiba_ai_v5.db',
    'keiba_v5.db',
    'training_logs.db'
]

for db in dbs:
    path = os.path.join('Keiba_AI_Models', db)
    if os.path.exists(path):
        conn = sqlite3.connect(path)
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        print(f"--- {db} ---")
        for table in tables:
            t_name = table[0]
            count = conn.execute(f"SELECT count(*) FROM {t_name}").fetchone()[0]
            print(f"Table: {t_name}, rows: {count}")
        conn.close()

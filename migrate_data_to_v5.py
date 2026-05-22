import os
import glob
import sqlite3
import pandas as pd
import re

VENUE_MAP = {
    'tokyo': '東京',
    'nakayama': '中山',
    'kyoto': '京都',
    'hanshin': '阪神',
    'chukyo': '中京',
    'sapporo': '札幌',
    'hakodate': '函館',
    'fukushima': '福島',
    'niigata': '新潟',
    'kokura': '小倉'
}

def extract_weight(weight_str):
    if pd.isna(weight_str) or weight_str == '計不':
        return 480.0
    match = re.search(r'^(\d+)', str(weight_str))
    if match:
        return float(match.group(1))
    return 480.0

def main():
    db_path = os.path.join('Keiba_AI_Models', 'keiba_v5.db')
    conn = sqlite3.connect(db_path)
    
    # Ensure table exists
    conn.execute('''
        CREATE TABLE IF NOT EXISTS training_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT, track_name TEXT, race_num INTEGER, distance INTEGER,
            horse_number INTEGER, horse_name TEXT, jockey TEXT, trainer TEXT,
            sire TEXT, broodmare_sire TEXT, horse_weight REAL, jockey_weight REAL,
            pwr REAL, inertia REAL, darkness_score REAL,
            actual_rank INTEGER, actual_time REAL, is_truth INTEGER DEFAULT 0
        )
    ''')
    
    # Clear existing data to avoid duplicates if re-running
    conn.execute('DELETE FROM training_logs WHERE is_truth = 1')
    
    files = glob.glob('keiba_data/*_*_full.csv')
    total_inserted = 0
    
    for f in files:
        filename = os.path.basename(f)
        venue_key = filename.split('_')[0]
        track_name = VENUE_MAP.get(venue_key, '不明')
        
        try:
            df = pd.read_csv(f, encoding='utf-8-sig')
        except Exception as e:
            print(f"Failed to read {f}: {e}")
            continue
            
        print(f"Processing {f} ({len(df)} rows)")
        
        # We need to map columns
        # ['着順', '枠番', '馬番', '馬名', '性齢', '斤量', '騎手', 'タイム', '着差', '単勝', '人気', '馬体重', '調教師', 'race_id']
        # Handle cases where CSV columns are slightly different
        
        records = []
        for _, row in df.iterrows():
            try:
                actual_rank = int(row.get('着順', 0))
            except ValueError:
                actual_rank = 99
                
            horse_number = row.get('馬番', 0)
            try:
                horse_number = int(horse_number)
            except:
                horse_number = 0
                
            horse_weight_raw = row.get('馬体重', '480')
            horse_weight = extract_weight(horse_weight_raw)
            
            jockey_weight_raw = row.get('斤量', '55')
            try:
                jockey_weight = float(jockey_weight_raw)
            except:
                jockey_weight = 55.0
                
            pwr = horse_weight / jockey_weight if jockey_weight > 0 else 0
            inertia = horse_weight * jockey_weight
            
            # Using 1200 as default distance since it's missing in these CSVs
            # Time could be converted to seconds, but model currently just requires 'actual_rank'
            
            records.append((
                '2024年01月01日', track_name, 1, 1200,
                horse_number, str(row.get('馬名', '不明')), str(row.get('騎手', '不明')), str(row.get('調教師', '不明')),
                '不明', '不明', horse_weight, jockey_weight,
                pwr, inertia, 0.0,
                actual_rank, 0.0, 1
            ))
            
        conn.executemany('''
            INSERT INTO training_logs (
                date, track_name, race_num, distance,
                horse_number, horse_name, jockey, trainer,
                sire, broodmare_sire, horse_weight, jockey_weight,
                pwr, inertia, darkness_score,
                actual_rank, actual_time, is_truth
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', records)
        
        total_inserted += len(records)
        
    conn.commit()
    conn.close()
    print(f"Successfully inserted {total_inserted} records into training_logs.")

if __name__ == '__main__':
    main()

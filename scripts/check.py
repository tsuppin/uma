import json
import sys

try:
    with open('parsed.json', 'rb') as f:
        raw = f.read()
    
    # It might be utf-16le
    try:
        if raw.startswith(b'\xff\xfe'):
            text = raw.decode('utf-16le')
        else:
            text = raw.decode('utf-8')
    except Exception as e:
        print("Decode error:", e)
        text = raw.decode('utf-16le', errors='ignore')
    
    # try parsing
    # strip control characters that might break json except \n \r \t
    import re
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
    if text.startswith('\ufeff'):
        text = text[1:]
        
    data = json.loads(text)
    tags = data.get('tagStats', [])
    review = [t for t in tags if t.get('fired', 0) >= 5 and (t.get('top3', 0) / t.get('fired', 1)) < 0.25]
    print(json.dumps(review, ensure_ascii=False, indent=2))
except Exception as e:
    print(e)

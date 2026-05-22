
import numpy as np
import joblib
import os

def calculate_advanced_physical_score(row, model_dir='/content/drive/MyDrive/Keiba_AI_Models/'):
    score = 50.0
    
    # 既存ロジック：斤量・馬体重比（パワー評価）
    weight_ratio = row.get('馬体重', 480) / row.get('斤量', 55.0)
    score += (weight_ratio - (480 / 55.0)) * 2.5
    
    # 東京特化バイアスの動的適用
    if row.get('場名', '') == '東京':
        try:
            knowledge_path = os.path.join(model_dir, 'tokyo_knowledge_base.pkl')
            knowledge = joblib.load(knowledge_path)
            
            # (1) 外枠有利の原則（6〜8枠）
            if row.get('枠', 1) >= knowledge['outer_frame_min']:
                score += 5.5
                
            # (2) 上位人気（上がり最速候補）の堅実性
            if row.get('人気', 10) <= knowledge['favored_popularity_max']:
                score += 3.5
                
            # (3) 血統バイアスの適用（芝/ダート別）
            sire = row.get('父', '')
            surface = row.get('馬場', '芝')
            if surface == '芝' and sire in knowledge['target_sire_turf']:
                score += 4.5
            elif surface == 'ダート' and sire in knowledge['target_sire_dirt']:
                score += 4.5
                
            # (4) 東京特化・騎手シナジー
            jockey = row.get('騎手', '')
            if jockey in knowledge['jockey_synergy']:
                score *= knowledge['jockey_synergy'][jockey]
                
        except Exception as e:
            print(f"ナレッジベースの読み込みに失敗しました: {e}")
            pass
            
    return score

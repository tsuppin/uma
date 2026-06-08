# -*- coding: utf-8 -*-
# =============================================================================
# ml/text_parser.py
# JRA/NAR テキスト出馬表・成績テキストの Python パーサー
#
# parser.ts (TypeScript) と同等のロジックを Python で実装。
#
# テキストフォーマットの特徴:
#   NAR: "着順\t馬番\t馬名\n過去走: 着順 YY/MM/DD 場所 コース 馬場..."
#   JRA: "枠X\t馬番\n馬名\n...過去走: YYYY年MM月DD日\n場所..."
#
# 学習データ生成の仕組み:
#   各馬のプロフィールには「過去走」が複数含まれる。
#   past_races[0]（最新の過去走）を「学習ターゲット」として使い、
#   past_races[1]（1つ前の過去走）を「前走特徴量」として使う。
#   これにより、1枚のテキストから馬1頭につき1学習サンプルを生成できる。
# =============================================================================

import re
import sys
import io
import os
from typing import Optional, Dict, List, Any
from datetime import datetime, date

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# =============================================================================
# 定数
# =============================================================================

ALL_TRACKS_JRA = ["東京", "中山", "京都", "阪神", "中京", "新潟", "福島", "小倉", "函館", "札幌"]
ALL_TRACKS_NAR = [
    "大井", "川崎", "船橋", "浦和", "門別", "盛岡", "水沢", "金沢",
    "笠松", "名古屋", "園田", "姫路", "高知", "佐賀", "帯広"
]
ALL_TRACKS = ALL_TRACKS_JRA + ALL_TRACKS_NAR

CONDITION_VALUES = {"良": 0, "稍重": 1, "重": 2, "不良": 3}
SURFACE_VALUES   = {"芝": 0, "ダート": 1}
GENDER_VALUES    = {"牡": 0, "牝": 1, "セ": 2, "セン": 2}


# =============================================================================
# 1. フォーマット判定
# =============================================================================

def detect_format(text: str) -> str:
    """テキストが JRA フォーマットか NAR フォーマットかを判定する"""
    # JRA特有: "枠X[白黒赤青...]" または "X回OO場YY日 ZR"
    if re.search(r'枠\s*\d\s*[白黒赤青黄緑橙桃]', text):
        return 'jra'
    if re.search(r'\d+回.+?\d+日\s+\d+R', text):
        return 'jra'
    return 'nar'


def extract_venue(text: str) -> Optional[str]:
    """テキストから競馬場名を抽出する"""
    for track in ALL_TRACKS:
        if track in text:
            return track
    return None


# =============================================================================
# 2. NAR テキストパーサー
# =============================================================================

def _parse_nar_race_header(lines: List[str]) -> Dict[str, Any]:
    """NAR テキストのレースヘッダー（場所・日付・距離等）を解析する"""
    info: Dict[str, Any] = {
        'venue': '', 'race_number': 0, 'date': '',
        'distance': 0, 'surface': 'ダート', 'condition': '良',
        'head_count': 0, 'race_name': '', 'weather': ''
    }

    for i, raw in enumerate(lines[:25]):
        l = raw.strip()
        if not l:
            continue

        # 日付: 2026/5/12
        m = re.search(r'(\d{4})/(\d{1,2})/(\d{1,2})', l)
        if m:
            info['date'] = f"{m.group(1)}-{m.group(2).zfill(2)}-{m.group(3).zfill(2)}"

        # 場名 + R: "川崎 11R"
        m = re.match(r'^(.+?)\s+(\d+)R$', l)
        if m:
            info['venue'] = m.group(1).strip()
            info['race_number'] = int(m.group(2))

        # 距離
        m = re.search(r'(\d+)m', l)
        if m:
            info['distance'] = int(m.group(1))

        # 頭数
        m = re.search(r'(\d+)頭', l)
        if m:
            info['head_count'] = int(m.group(1))

        # 馬場状態
        m = re.search(r'馬場状態[：:]\s*([良稍重不]{1,3})', l)
        if m:
            info['condition'] = m.group(1)

        # 天候
        m = re.search(r'天候[：:]\s*([^\s]+)', l)
        if m:
            info['weather'] = m.group(1).strip()

        # レース名（特別・重賞など）
        if any(kw in l for kw in ["特別", "オープン", "重賞", "スプリント", "カップ"]):
            if not info['race_name']:
                info['race_name'] = l

    # venue フォールバック
    if not info['venue']:
        for l in lines[:25]:
            v = extract_venue(l)
            if v:
                info['venue'] = v
                break

    return info


def _parse_nar_past_races(lines: List[str], start_idx: int) -> List[Dict[str, Any]]:
    """
    NAR の過去走ブロックを解析する。
    フォーマット:
      Line1: "着順 YY/MM/DD 場所 コース 馬場"
      Line2: クラス
      Line3: "頭数 枠番 人気 騎手 体重 斤量 通過順"
      Line4: "タイム (上がり3F) 1着馬(タイム差)"
    """
    past_races: List[Dict[str, Any]] = []
    idx = start_idx

    PAST_HEADER_RE = re.compile(
        r'^(?:\d+|取消|除外|中止|失格)[\t\s]+\d{2}/\d{2}/\d{2}'
    )

    while idx < len(lines) and len(past_races) < 10:
        l1 = lines[idx].strip()
        if not l1:
            idx += 1
            continue

        if not PAST_HEADER_RE.match(l1):
            idx += 1
            continue

        p1 = re.split(r'[\t\s]+', l1)
        if len(p1) < 3:
            idx += 1
            continue

        # 着順
        raw_result = p1[0]
        pr_result = int(raw_result) if raw_result.isdigit() else 0

        # 日付 (YY/MM/DD -> 20YY-MM-DD)
        dm = re.match(r'(\d{2})/(\d{2})/(\d{2})', p1[1])
        pr_date = f"20{dm.group(1)}-{dm.group(2)}-{dm.group(3)}" if dm else ""

        pr_venue = p1[2] if len(p1) > 2 else ""

        # コース: "右1200m" / "左1800m芝" / "1200m"
        course_attr = p1[3] if len(p1) > 3 else ""
        dist_m = re.search(r'(\d+)m', course_attr)
        pr_dist = int(dist_m.group(1)) if dist_m else 0
        pr_surf = "芝" if "芝" in course_attr else "ダート"

        pr_cond = p1[4] if len(p1) > 4 else "良"
        if pr_cond not in CONDITION_VALUES:
            pr_cond = "良"

        idx += 1

        # クラス行
        pr_class = lines[idx].strip() if idx < len(lines) else ""
        idx += 1

        # 次が別の過去走ヘッダーかチェック
        next_line = lines[idx].strip() if idx < len(lines) else ""
        is_next_header = PAST_HEADER_RE.match(next_line) is not None

        pr_head_count = 0
        pr_frame = 0
        pr_popularity = 0
        pr_kinryo = 0.0
        pr_weight = 480
        pr_last3f = 0.0
        pr_last3f_rank = 0
        pr_time_diff = 0.0
        pr_time = ""
        pr_jockey = ""
        pr_passing = ""

        if not is_next_header and idx < len(lines):
            l3 = lines[idx].strip()
            p3 = re.split(r'[\t\s]+', l3)

            m = re.search(r'(\d+)頭', l3)
            if m:
                pr_head_count = int(m.group(1))
            m = re.search(r'(\d+)番', l3)
            if m:
                pr_frame = int(m.group(1))
            m = re.search(r'(\d+)人', l3)
            if m:
                pr_popularity = int(m.group(1))

            jockey_found = False
            for part in p3:
                if any(x in part for x in ["頭", "番", "人"]):
                    continue
                if re.match(r'^\d{3}kg$', part):
                    pr_weight = int(part.replace("kg", ""))
                elif re.match(r'^\d{2}\.\d$', part):
                    pr_kinryo = float(part)
                elif re.match(r'^\d+(?:-\d+)+$', part):
                    pr_passing = part
                elif 2 <= len(part) <= 5 and not jockey_found:
                    pr_jockey = part
                    jockey_found = True

            idx += 1

            if idx < len(lines):
                l4 = lines[idx].strip()
                # タイム
                tm = re.match(r'^(\d+:\d+[:.]\d+)', l4) or re.match(r'^(\d+[:.]\d+)', l4)
                if tm:
                    pr_time = tm.group(1)
                # 上がり3F
                f3m = re.search(r'\((\d{2}\.\d)\)', l4)
                if f3m:
                    pr_last3f = float(f3m.group(1))
                    rank_m = re.search(r'([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])', l4)
                    if rank_m:
                        char_to_rank = {'①':1,'②':2,'③':3,'④':4,'⑤':5,'⑥':6,'⑦':7,'⑧':8,'⑨':9,'⑩':10,
                                        '⑪':11,'⑫':12,'⑬':13,'⑭':14,'⑮':15,'⑯':16,'⑰':17,'⑱':18,'⑲':19,'⑳':20}
                        pr_last3f_rank = char_to_rank.get(rank_m.group(1), 0)
                    else:
                        rank_m2 = re.search(r'\[(\d+)\]', l4)
                        if rank_m2:
                            pr_last3f_rank = int(rank_m2.group(1))
                # タイム差
                wm = re.search(r'\s+[^\s(]+\(([-+]\d+\.?\d*)\)', l4)
                if wm:
                    pr_time_diff = float(wm.group(1))
                idx += 1

        if pr_date:
            past_races.append({
                'result':      pr_result,
                'date':        pr_date,
                'venue':       pr_venue,
                'race_class':  pr_class,
                'distance':    pr_dist,
                'surface':     pr_surf,
                'condition':   pr_cond,
                'head_count':  pr_head_count,
                'frame':       pr_frame,
                'popularity':  pr_popularity,
                'kinryo':      pr_kinryo,
                'weight':      pr_weight,
                'jockey':      pr_jockey,
                'last3f':      pr_last3f,
                'last3f_rank': pr_last3f_rank,
                'time_diff':   pr_time_diff,
                'time':        pr_time,
                'passing':     pr_passing,
            })

    return past_races


def parse_nar_text(text: str) -> Dict[str, Any]:
    """
    NAR 出馬表テキストを解析してレース情報と馬データを返す。
    戻り値: {'race_info': {...}, 'horses': [{...}, ...]}
    """
    lines = [l.rstrip('\r') for l in text.split('\n')]

    race_info = _parse_nar_race_header(lines)

    # 馬ブロックの開始行インデックスを検出
    # パターン: "数字[タブ/スペース]数字[タブ/スペース]馬名..."
    HORSE_BLOCK_RE = re.compile(r'^\d+[\t\s]+\d+[\t\s]+[^\t\s]')
    SKIP_KEYWORDS  = ["頭", "番", "人", "kg", "m", ":", "/"]

    block_starts = []
    for i, l in enumerate(lines):
        if HORSE_BLOCK_RE.match(l.strip()):
            if not any(kw in l for kw in SKIP_KEYWORDS) and not re.search(r'\d{2}/\d{2}/\d{2}', l):
                block_starts.append(i)

    horses = []
    for bi, start in enumerate(block_starts):
        end = block_starts[bi + 1] if bi + 1 < len(block_starts) else len(lines)
        h = _parse_nar_horse(lines[start:end])
        if h and h.get('name'):
            horses.append(h)

    if not race_info['head_count']:
        race_info['head_count'] = len(horses)

    return {'race_info': race_info, 'horses': horses}


def _parse_nar_horse(lines: List[str]) -> Optional[Dict[str, Any]]:
    """NAR の馬ブロック（1頭分）を解析する"""
    if not lines:
        return None

    hp = re.split(r'[\t\s]+', lines[0].strip())
    if len(hp) < 3:
        return None

    # 枠番 (または着順) / 馬番 / 馬名
    frame  = int(hp[0]) if hp[0].isdigit() else 0
    number = int(hp[1]) if hp[1].isdigit() else 0
    name   = hp[2]

    # 過去走開始インデックスを探す
    PAST_HEADER_RE = re.compile(r'^(?:\d+|取消|除外|中止|失格)[\t\s]+\d{2}/\d{2}/\d{2}')
    past_start_idx = -1
    for i in range(1, len(lines)):
        if PAST_HEADER_RE.match(lines[i].strip()):
            past_start_idx = i
            break

    profile_end = past_start_idx if past_start_idx != -1 else len(lines)

    # プロフィール部分の解析
    gender     = "牡"
    age        = 4
    coat_color = ""
    weight     = 480
    weight_chg = 0
    kinryo     = 55.0
    jockey     = ""
    trainer    = ""
    owner      = ""
    sire       = ""
    dam        = ""

    for i in range(1, profile_end):
        l = lines[i].strip()
        if not l:
            continue

        if "父" in l and not sire:
            sire = re.sub(r'^.*?父\s+', '', l).strip()
        elif "母" in l and not dam:
            dam = re.sub(r'^.*?母\s+', '', l).strip()

        gm = re.search(r'([牡牝セ]|せん)(\d+)', l)
        if gm:
            g = gm.group(1)
            gender = "セン" if g in ("セ", "せん") else g
            age    = int(gm.group(2))

        if re.match(r'^(?:栗|栃栗|鹿|黒鹿|青鹿|青|芦|白|粕)毛$', l):
            coat_color = l

        m = re.match(r'^(\d+)kg$', l)
        if m:
            weight = int(m.group(1))

        m = re.match(r'^\(([±+\-]?\d+|初出走)\)$', l)
        if m:
            v = m.group(1).replace("±", "")
            weight_chg = 0 if v == "初出走" else (int(v) if v.lstrip('+-').isdigit() else 0)

        m = re.match(r'^\((\d{2,3}(?:\.\d)?)\)$', l)
        if m:
            kinryo = float(m.group(1))
            if i > 1:
                jockey = lines[i - 1].strip()
            if i + 1 < profile_end:
                raw_trainer = lines[i + 1].strip()
                tm2 = re.match(r'^(.+?)\((.+?)\)$', raw_trainer)
                trainer = tm2.group(1).strip() if tm2 else raw_trainer
            if i + 2 < profile_end:
                owner = lines[i + 2].strip()

    # 過去走を解析
    past_races = []
    if past_start_idx != -1:
        past_races = _parse_nar_past_races(lines, past_start_idx)

    return {
        'frame':       frame,
        'number':      number,
        'name':        name,
        'gender':      gender,
        'age':         age,
        'coat_color':  coat_color,
        'weight':      weight,
        'weight_chg':  weight_chg,
        'kinryo':      kinryo,
        'jockey':      jockey,
        'trainer':     trainer,
        'owner':       owner,
        'sire':        sire,
        'dam':         dam,
        'odds':        0.0,
        'popularity':  0,
        'past_races':  past_races,
    }


# =============================================================================
# 3. JRA テキストパーサー
# =============================================================================

def _parse_jra_race_header(text: str, lines: List[str]) -> Dict[str, Any]:
    """JRA テキストのレースヘッダーを解析する"""
    info: Dict[str, Any] = {
        'venue': '', 'race_number': 0, 'date': '',
        'distance': 0, 'surface': 'ダート', 'condition': '良',
        'head_count': 0, 'race_name': '',
        'cushion_value': None, 'moisture': None
    }

    # "3回東京6日 11R"
    hm = re.search(r'(\d+)回(.+?)(\d+)日\s*(\d+)R', text)
    if hm:
        info['venue']       = hm.group(2).strip()
        info['race_number'] = int(hm.group(4))

    for l in lines[:30]:
        l = l.strip()
        # 距離・芝/ダート: "2400芝" "1600ダ"
        dm = re.search(r'(\d{3,4})(ダ|芝)', l)
        if dm:
            info['distance'] = int(dm.group(1))
            info['surface']  = "芝" if dm.group(2) == "芝" else "ダート"

        # 馬場状態
        if re.match(r'^(良|稍重|重|不良)$', l):
            info['condition'] = l

        # レース名
        if re.search(r'[GS][ⅠⅡⅢ]|リステッド|特別|勝クラス|OP|オープン', l) and not info['race_name']:
            info['race_name'] = l

        # クッション値
        cm = re.search(r'クッション値[：:\s]*(\d+\.?\d*)', l)
        if cm:
            info['cushion_value'] = float(cm.group(1))

        # 含水率
        mm = re.search(r'含水率[：:\s]*(\d+\.?\d*)%?', l)
        if mm:
            info['moisture'] = float(mm.group(1))

    if not info['venue']:
        v = extract_venue(text)
        if v:
            info['venue'] = v

    return info


def _parse_jra_past_races(lines: List[str], start_idx: int) -> List[Dict[str, Any]]:
    """
    JRA の過去走ブロックを解析する。
    フォーマット:
      Line1: "YYYY年MM月DD日 場所" (または行が分かれる場合もあり)
      Line2: レース名
      Line3: クラス
      Line4: "X着 Y頭Z番"
      Line5: "A番人気"
      Line6: "騎手 斤量kg"
      Line7: "距離 芝/ダ"
      Line8: タイム
      Line9: 馬場状態
      Line10: 馬体重
      Line11: 通過順
      Line12: 上がり3F
      Line13: 1着馬(タイム差)
    """
    past_races: List[Dict[str, Any]] = []
    idx = start_idx

    DATE_RE = re.compile(r'(\d{4})年(\d{1,2})月(\d{1,2})日')

    while idx < len(lines) and len(past_races) < 10:
        dl = lines[idx] if idx < len(lines) else ""
        dm = DATE_RE.search(dl)
        if not dm:
            idx += 1
            continue

        pr_date = f"{dm.group(1)}-{dm.group(2).zfill(2)}-{dm.group(3).zfill(2)}"
        dl_parts = re.split(r'[\t\s]+', dl.strip())
        pr_venue = dl_parts[-1].strip() if dl_parts else ""
        idx += 1

        # 場所が日付と同じ行にない場合
        if pr_venue == dm.group(0) or re.match(r'^\d{4}年', pr_venue):
            pr_venue = lines[idx].strip() if idx < len(lines) else ""
            idx += 1

        pr_race_name  = lines[idx].strip() if idx < len(lines) else ""
        idx += 1
        pr_race_class = lines[idx].strip() if idx < len(lines) else ""
        idx += 1

        # "X着 Y頭Z番"
        rl = lines[idx].strip() if idx < len(lines) else ""
        rm = re.search(r'(\d+)着', rl)
        pr_result = int(rm.group(1)) if rm else 0
        pr_head_count = 0
        pr_frame = 0
        hm2 = re.search(r'(\d+)頭\s*(\d+)番', rl)
        if hm2:
            pr_head_count = int(hm2.group(1))
            pr_frame      = int(hm2.group(2))
        idx += 1

        # 人気
        pr_popularity = 0
        if idx < len(lines):
            pm = re.search(r'(\d+)番人気', lines[idx])
            if pm:
                pr_popularity = int(pm.group(1))
                idx += 1

        # 騎手 斤量
        pr_jockey = ""
        pr_kinryo = 0.0
        if idx < len(lines):
            jl = lines[idx].strip()
            jp = re.split(r'[\t\s]+', jl)
            pr_jockey = re.sub(r'^[▲△☆◇]', '', jp[0]).strip() if jp else ""
            km = re.search(r'(\d+\.?\d*)kg', jl)
            if km:
                pr_kinryo = float(km.group(1))
            idx += 1

        # 距離・芝ダ
        pr_dist = 0
        pr_surf = "ダート"
        if idx < len(lines):
            distl = lines[idx].strip()
            dm2 = re.search(r'(\d+)(ダ|芝)', distl)
            if dm2:
                pr_dist = int(dm2.group(1))
                pr_surf = "芝" if dm2.group(2) == "芝" else "ダート"
            idx += 1

        # タイム
        pr_time = ""
        if idx < len(lines):
            tl = lines[idx].strip()
            if re.search(r'\d+:\d+', tl):
                pr_time = tl
                idx += 1

        # 空行スキップ
        while idx < len(lines) and not lines[idx].strip():
            idx += 1

        # 馬場状態
        pr_cond = "良"
        if idx < len(lines) and lines[idx].strip() in ("良", "稍重", "重", "不良"):
            pr_cond = lines[idx].strip()
            idx += 1

        # 馬体重
        pr_weight = 480
        if idx < len(lines):
            wm2 = re.match(r'^(\d+)kg', lines[idx].strip())
            if wm2:
                pr_weight = int(wm2.group(1))
                idx += 1

        # 空行スキップ
        while idx < len(lines) and not lines[idx].strip():
            idx += 1

        # 通過順
        pr_passing = ""
        if idx < len(lines):
            posl = lines[idx].strip()
            if re.match(r'^\d+(?:[\t\-]\d+)+$', posl):
                pr_passing = posl.replace('\t', '-')
                idx += 1

        # 上がり3F
        pr_last3f = 0.0
        pr_last3f_rank = 0
        if idx < len(lines):
            f3l = lines[idx].strip()
            f3m = re.search(r'3F\s*(\d+\.\d)', f3l) or re.match(r'^(\d{2}\.\d)$', f3l)
            if f3m:
                pr_last3f = float(f3m.group(1))
                rank_m = re.search(r'([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])', f3l)
                if rank_m:
                    char_to_rank = {'①':1,'②':2,'③':3,'④':4,'⑤':5,'⑥':6,'⑦':7,'⑧':8,'⑨':9,'⑩':10,
                                    '⑪':11,'⑫':12,'⑬':13,'⑭':14,'⑮':15,'⑯':16,'⑰':17,'⑱':18,'⑲':19,'⑳':20}
                    pr_last3f_rank = char_to_rank.get(rank_m.group(1), 0)
                else:
                    rank_m2 = re.search(r'\[(\d+)\]', f3l)
                    if rank_m2:
                        pr_last3f_rank = int(rank_m2.group(1))
                idx += 1

        # タイム差
        pr_time_diff = 0.0
        temp_idx = idx
        while temp_idx < len(lines) and temp_idx < idx + 3:
            wn = lines[temp_idx].strip()
            if not wn:
                temp_idx += 1
                continue
            wnm = re.match(r'^(.+?)\(([-+]?\d+\.?\d*)\)$', wn)
            if wnm and re.search(r'[\u3040-\u9FFF\u30A0-\u30FF]', wnm.group(1)):
                pr_time_diff = float(wnm.group(2))
                idx = temp_idx + 1
                break
            temp_idx += 1

        if pr_date and pr_result:
            past_races.append({
                'result':     pr_result,
                'date':       pr_date,
                'venue':      pr_venue,
                'race_name':  pr_race_name,
                'race_class': pr_race_class,
                'distance':   pr_dist,
                'surface':    pr_surf,
                'condition':  pr_cond,
                'head_count': pr_head_count,
                'frame':      pr_frame,
                'popularity': pr_popularity,
                'kinryo':     pr_kinryo,
                'weight':     pr_weight,
                'jockey':     pr_jockey,
                'last3f':     pr_last3f,
                'last3f_rank': pr_last3f_rank,
                'time_diff':  pr_time_diff,
                'time':       pr_time,
                'passing':    pr_passing,
            })

    return past_races


def _parse_jra_horse(lines: List[str]) -> Optional[Dict[str, Any]]:
    """JRA の馬ブロック（1頭分）を解析する"""
    if not lines:
        return None

    fm = re.search(r'枠[\s\t　]*(\d)', lines[0])
    frame = int(fm.group(1)) if fm else 1

    tab_parts = lines[0].split('\t')
    number = int(tab_parts[1].strip()) if len(tab_parts) > 1 and tab_parts[1].strip().isdigit() else 0

    idx = 1
    while idx < len(lines):
        cl = lines[idx].strip()
        if cl.isdigit():
            number = int(cl)
            idx += 1
            break
        if cl in ("", "ブリンカー", "勝負服の画像"):
            idx += 1
        else:
            break

    has_blinker = False
    if idx < len(lines) and "ブリンカー" in lines[idx]:
        has_blinker = True
        idx += 1

    name    = lines[idx].strip() if idx < len(lines) else ""
    idx += 1

    # 空行スキップ
    while idx < len(lines) and (not lines[idx].strip() or lines[idx].strip().isdigit()):
        idx += 1

    owner = lines[idx].strip() if idx < len(lines) else ""
    idx += 1
    while idx < len(lines) and not lines[idx].strip():
        idx += 1

    # 生産牧場
    breeder = lines[idx].strip() if idx < len(lines) else ""
    idx += 1
    while idx < len(lines) and not lines[idx].strip():
        idx += 1

    # 調教師
    trainer     = ""
    stable_loc  = ""
    if idx < len(lines):
        tm = re.match(r'^(.+?)\s*[（(]([栗美][東浦])[）)]', lines[idx])
        if tm:
            trainer    = tm.group(1).strip()
            stable_loc = tm.group(2)
        else:
            trainer = lines[idx].strip()
        idx += 1

    # 血統
    sire = ""
    dam  = ""
    bms  = ""
    while idx < len(lines):
        l = lines[idx].strip()
        if l.startswith("父：") or l.startswith("父:"):
            sire = l.lstrip("父：").lstrip("父:").strip()
            idx += 1
        elif l.startswith("母：") or l.startswith("母:"):
            dam = l.lstrip("母：").lstrip("母:").strip()
            idx += 1
        elif "母の父" in l:
            bms = re.sub(r'^.*?母の父[：:]?', '', l).strip("（）()").strip()
            idx += 1
        elif not l or "：" in l or ":" in l:
            idx += 1
        else:
            break

    # オッズ
    odds = 0.0
    popularity = 0
    while idx < len(lines):
        l = lines[idx].strip()
        if re.match(r'^\d+\.?\d+$', l) and ":" not in l:
            odds = float(l)
            idx += 1
            break
        idx += 1

    pm = re.search(r'(\d+)番人気', lines[idx].strip()) if idx < len(lines) else None
    if pm:
        popularity = int(pm.group(1))
        idx += 1

    # 馬体重・性齢
    horse_weight = 480
    horse_weight_chg = 0
    gender = "牡"
    age    = 4
    coat_color = ""
    kinryo = 55.0
    jockey = ""

    while idx < len(lines):
        l = lines[idx].strip()
        wm = re.match(r'^(\d+)kg', l)
        if wm:
            horse_weight = int(wm.group(1))
            idx += 1
            if idx < len(lines):
                wcm = re.match(r'\(([+\-]?\d+|初出走)\)', lines[idx].strip())
                if wcm:
                    v = wcm.group(1)
                    horse_weight_chg = 0 if v == "初出走" else (int(v) if v.lstrip('+-').isdigit() else 0)
                    idx += 1
            break
        idx += 1

    while idx < len(lines) and not lines[idx].strip():
        idx += 1

    # 性齢/毛色: "牡3/鹿毛"
    if idx < len(lines):
        gm2 = re.match(r'([牡牝セ]|せん)(\d+)/(.+)', lines[idx].strip())
        if gm2:
            g = gm2.group(1)
            gender     = "セン" if g in ("セ", "せん") else g
            age        = int(gm2.group(2))
            coat_color = gm2.group(3).strip()
            idx += 1

    while idx < len(lines) and not lines[idx].strip():
        idx += 1

    # 斤量
    if idx < len(lines):
        km = re.match(r'^(\d+\.?\d*)kg', lines[idx].strip())
        if km:
            kinryo = float(km.group(1))
            idx += 1

    while idx < len(lines) and not lines[idx].strip():
        idx += 1

    # 騎手
    jockey = lines[idx].strip() if idx < len(lines) else ""
    idx += 1

    while idx < len(lines) and not lines[idx].strip():
        idx += 1

    # 過去走
    DATE_RE = re.compile(r'\d{4}年\d{1,2}月\d{1,2}日')
    past_races = []
    while idx < len(lines) and len(past_races) < 10:
        if DATE_RE.search(lines[idx]):
            past_races = _parse_jra_past_races(lines, idx)
            break
        idx += 1

    return {
        'frame':       frame,
        'number':      number,
        'name':        name,
        'gender':      gender,
        'age':         age,
        'coat_color':  coat_color,
        'weight':      horse_weight,
        'weight_chg':  horse_weight_chg,
        'kinryo':      kinryo,
        'jockey':      jockey,
        'trainer':     trainer,
        'owner':       owner,
        'sire':        sire,
        'dam':         dam,
        'bms':         bms,
        'odds':        odds,
        'popularity':  popularity,
        'has_blinker': has_blinker,
        'stable_loc':  stable_loc,
        'past_races':  past_races,
    }


def parse_jra_text(text: str) -> Dict[str, Any]:
    """
    JRA 出馬表テキストを解析してレース情報と馬データを返す。
    """
    lines = [l.rstrip('\r') for l in text.split('\n')]
    race_info = _parse_jra_race_header(text, lines)

    # 馬ブロックの検出: "枠X" で始まる行
    block_starts = [
        i for i, l in enumerate(lines)
        if re.match(r'^[\s\t　]*枠[\s\t　]*\d', l)
    ]

    horses = []
    for bi, start in enumerate(block_starts):
        end = block_starts[bi + 1] if bi + 1 < len(block_starts) else len(lines)
        h = _parse_jra_horse(lines[start:end])
        if h and h.get('name'):
            horses.append(h)

    if not race_info['head_count']:
        race_info['head_count'] = len(horses)

    return {'race_info': race_info, 'horses': horses}


# =============================================================================
# 4. 統合パーサー（フォーマット自動判定）
# =============================================================================

def parse_text(text: str) -> Dict[str, Any]:
    """
    テキストフォーマットを自動判定して解析する。
    戻り値: {'format': 'jra'/'nar', 'race_info': {...}, 'horses': [...]}
    """
    fmt = detect_format(text)
    if fmt == 'jra':
        result = parse_jra_text(text)
    else:
        result = parse_nar_text(text)
    result['format'] = fmt
    return result


# =============================================================================
# 5. デバッグ用の直接実行テスト
# =============================================================================

if __name__ == '__main__':
    # NAR テキストサンプルでテスト
    sample_nar = """川崎 11R
2025/5/12
900m  12頭  発走20:15
天候：晴 馬場状態：良

1  1  テストウマ
父 ヘニーヒューズ牡5  鹿毛
480kg
(+2)
(55.0)
森泰斗
橋本忠男(川崎)

1 25/11/01 大井 右1200m 良
C3
12頭 3番 2人 森  490kg 55.0
1:14.5 (36.8) 勝ち馬(-0.5)
2 25/08/15 川崎 右900m 良
C4
10頭 5番 4人 山崎  488kg 55.0
0:57.2 (37.1) 勝ち馬(-0.8)
"""

    result = parse_text(sample_nar)
    print(f"[FORMAT] {result['format']}")
    print(f"[RACE]   venue={result['race_info']['venue']}, dist={result['race_info']['distance']}")
    print(f"[HORSES] count={len(result['horses'])}")
    if result['horses']:
        h = result['horses'][0]
        print(f"  horse: {h['name']} / past_races={len(h['past_races'])}")
        for i, pr in enumerate(h['past_races']):
            print(f"    past[{i}] result={pr['result']} last3f={pr['last3f']} timediff={pr['time_diff']}")

    print("\n[OK] text_parser.py 動作確認完了")

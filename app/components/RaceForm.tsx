"use client";
import { useState } from "react";
import { Race, Horse, PastRace } from "../types";
import { generateId } from "../lib/storage";

interface Props {
  onSubmit: (race: Race) => void;
  onCancel: () => void;
}

const TRACKS = ["大井","門別","笠松","名古屋","弥富","阪神","中山","東京","京都","小倉","新潟","福島","函館","札幌","中京","船橋","浦和","川崎","金沢","高知","佐賀","荒尾","その他"];
const CONDITIONS: Race["condition"][] = ["良","稍重","重","不良"];
const SURFACES: Race["surface"][] = ["ダート","芝"];
const GENDERS: Horse["gender"][] = ["牡","牝","セン"];
const STYLES: Horse["style"][] = ["逃げ","先行","好位","中団","後方","追込",""];

function emptyHorse(number: number): Horse {
  return {
    id: generateId(), number, frame: Math.ceil(number / 2),
    name: "", age: 4, gender: "牡", weight: 480, weightChange: 0,
    jockey: "", jockeyWeight: 55, trainer: "", owner: "",
    sire: "", dam: "", bms: "", bloodline: "", style: "", odds: 0, popularity: number,
    pastRaces: [],
  };
}

function emptyPastRace(): PastRace {
  return {
    date: "", venue: "", raceName: "", raceClass: "", distance: 1200,
    surface: "ダート", condition: "良", result: 0, time: "",
    corner4Position: 5, cornerOuterCount: 1, weight: 480,
    jockey: "", odds: 0, prize: 0,
  };
}

export default function RaceForm({ onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [venue, setVenue] = useState("大井");
  const [raceNumber, setRaceNumber] = useState(1);
  const [raceName, setRaceName] = useState("");
  const [distance, setDistance] = useState(1400);
  const [surface, setSurface] = useState<Race["surface"]>("ダート");
  const [condition, setCondition] = useState<Race["condition"]>("良");
  const [headCount, setHeadCount] = useState(12);
  const [isWin5, setIsWin5] = useState(false);
  const [windSpeed, setWindSpeed] = useState(0);
  const [season, setSeason] = useState<"winter" | "summer">("winter");
  const [isNight, setIsNight] = useState(false);
  const [horses, setHorses] = useState<Horse[]>(Array.from({ length: 12 }, (_, i) => emptyHorse(i + 1)));
  const [tab, setTab] = useState<"race" | "horses" | "paste">("race");
  const [pasteText, setPasteText] = useState("");
  const [selectedHorse, setSelectedHorse] = useState(0);

  // テキスト貼り付けパーサー (出馬表テキスト → 馬情報)
  const parsePasteText = () => {
    const lines = pasteText.split("\n").filter(l => l.trim());
    const parsed: Partial<Horse>[] = [];
    let current: Partial<Horse> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      // 馬番検出
      const numMatch = trimmed.match(/^(\d+)\s+(.+)/);
      if (numMatch) {
        if (current.name) parsed.push(current);
        current = {
          number: parseInt(numMatch[1]),
          frame: Math.ceil(parseInt(numMatch[1]) / 2),
          name: numMatch[2].split(/\s+/)[0],
          id: generateId(),
          age: 4, gender: "牡", weight: 480, weightChange: 0,
          jockey: "", jockeyWeight: 55, trainer: "", owner: "",
          sire: "", dam: "", bms: "", bloodline: "", style: "", odds: 0,
          popularity: parseInt(numMatch[1]),
          pastRaces: [],
        };
        const rest = numMatch[2].split(/\s+/);
        if (rest[1]) current.jockey = rest[1];
        if (rest[2]) current.weight = parseInt(rest[2]) || 480;
      } else if (trimmed.includes("kg") && current.name) {
        const wMatch = trimmed.match(/(\d+)\(([+-]?\d+)\)/);
        if (wMatch) {
          current.weight = parseInt(wMatch[1]);
          current.weightChange = parseInt(wMatch[2]);
        }
      }
    }
    if (current.name) parsed.push(current);

    if (parsed.length > 0) {
      const newHorses = Array.from({ length: headCount }, (_, i) => {
        const p = parsed.find(h => h.number === i + 1);
        return p ? { ...emptyHorse(i + 1), ...p } : emptyHorse(i + 1);
      });
      setHorses(newHorses);
      alert(`${parsed.length}頭の情報を読み込みました`);
      setTab("horses");
    } else {
      alert("テキストを解析できませんでした。\n形式: [馬番] [馬名] [騎手] [馬体重(増減)]");
    }
  };

  const updateHorse = (idx: number, field: keyof Horse, value: unknown) => {
    setHorses(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const updateHeadCount = (n: number) => {
    setHeadCount(n);
    setHorses(prev => {
      if (n > prev.length) return [...prev, ...Array.from({ length: n - prev.length }, (_, i) => emptyHorse(prev.length + i + 1))];
      return prev.slice(0, n);
    });
  };

  const addPastRace = (horseIdx: number) => {
    setHorses(prev => prev.map((h, i) => i === horseIdx ? { ...h, pastRaces: [...h.pastRaces, emptyPastRace()] } : h));
  };

  const updatePastRace = (horseIdx: number, prIdx: number, field: keyof PastRace, value: unknown) => {
    setHorses(prev => prev.map((h, i) => {
      if (i !== horseIdx) return h;
      return { ...h, pastRaces: h.pastRaces.map((pr, j) => j === prIdx ? { ...pr, [field]: value } : pr) };
    }));
  };

  const removePastRace = (horseIdx: number, prIdx: number) => {
    setHorses(prev => prev.map((h, i) => {
      if (i !== horseIdx) return h;
      return { ...h, pastRaces: h.pastRaces.filter((_, j) => j !== prIdx) };
    }));
  };

  const handleSubmit = () => {
    if (!raceName && !venue) { alert("競馬場とレース名を入力してください"); return; }
    const race: Race = {
      id: generateId(),
      date, venue, raceNumber, raceName: raceName || `${raceNumber}R`,
      distance, surface, condition, headCount, isWin5, windSpeed,
      trackName: venue,
      season, isNight,
      horses: horses.slice(0, headCount),
    };
    onSubmit(race);
  };

  const horse = horses[selectedHorse];

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">➕ 新規レース登録</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={onCancel}>キャンセル</button>
          <button className="btn btn-primary" onClick={handleSubmit}>💾 保存して予想へ</button>
        </div>
      </div>

      <div className="tabs">
        {(["race", "horses", "paste"] as const).map(t => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "race" ? "🏇 レース情報" : t === "horses" ? "🐴 出馬表" : "📋 テキスト貼付"}
          </button>
        ))}
      </div>

      {tab === "race" && (
        <div className="card">
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">開催日</label>
              <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">競馬場</label>
              <select className="form-select" value={venue} onChange={e => setVenue(e.target.value)}>
                {TRACKS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">レース番号</label>
              <input type="number" className="form-input" min={1} max={12} value={raceNumber} onChange={e => setRaceNumber(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">レース名</label>
              <input className="form-input" value={raceName} onChange={e => setRaceName(e.target.value)} placeholder="例: 未勝利戦" />
            </div>
            <div className="form-group">
              <label className="form-label">距離 (m)</label>
              <input type="number" className="form-input" value={distance} onChange={e => setDistance(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">頭数</label>
              <input type="number" className="form-input" min={2} max={18} value={headCount} onChange={e => updateHeadCount(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">馬場種別</label>
              <select className="form-select" value={surface} onChange={e => setSurface(e.target.value as Race["surface"])}>
                {SURFACES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">馬場状態</label>
              <select className="form-select" value={condition} onChange={e => setCondition(e.target.value as Race["condition"])}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">風速 (m/s)</label>
              <input type="number" className="form-input" step={0.5} value={windSpeed} onChange={e => setWindSpeed(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">季節</label>
              <select className="form-select" value={season} onChange={e => setSeason(e.target.value as "winter" | "summer")}>
                <option value="winter">冬（北風）</option>
                <option value="summer">夏（南風）</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">夜間開催</label>
              <select className="form-select" value={isNight ? "1" : "0"} onChange={e => setIsNight(e.target.value === "1")}>
                <option value="0">昼間</option>
                <option value="1">夜間（トゥインクル）</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">WIN5対象</label>
              <select className="form-select" value={isWin5 ? "1" : "0"} onChange={e => setIsWin5(e.target.value === "1")}>
                <option value="0">通常</option>
                <option value="1">WIN5対象</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {tab === "paste" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 出馬表テキスト貼り付け</div>
          </div>
          <div className="alert alert-info">
            💡 出馬表テキストをそのまま貼り付けると自動解析します（5000文字程度まで対応）
          </div>
          <div className="form-group">
            <label className="form-label">出馬表テキスト（前走・前前走含む）</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: "200px", fontFamily: "monospace", fontSize: "0.8rem" }}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder={`例:\n1 ゴールデンアイル 井上瑛 442(-4)\n  前走: 門別1000m 良 1着 59.8秒\n2 スマイルムーン 小野俊 476(+20)\n  前走: 門別1200m 良 3着 1:14.2\n...`}
            />
          </div>
          <button className="btn btn-primary" onClick={parsePasteText}>🔍 テキストを解析</button>
        </div>
      )}

      {tab === "horses" && (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "16px" }}>
          {/* Horse selector */}
          <div className="card" style={{ padding: "12px", height: "fit-content" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700 }}>馬を選択</div>
            {horses.map((h, i) => (
              <div
                key={i}
                onClick={() => setSelectedHorse(i)}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: selectedHorse === i ? "var(--bg-elevated)" : "transparent",
                  borderLeft: selectedHorse === i ? "2px solid var(--accent-gold)" : "2px solid transparent",
                  marginBottom: "2px",
                  fontSize: "0.8rem",
                  display: "flex", alignItems: "center", gap: "8px",
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--accent-gold)", minWidth: "20px" }}>{h.number}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name || "（未入力）"}</span>
              </div>
            ))}
          </div>

          {/* Horse detail form */}
          {horse && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">🐴 {horse.number}番 馬情報</div>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">馬番</label>
                  <input type="number" className="form-input" value={horse.number} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">枠番</label>
                  <input type="number" className="form-input" min={1} max={8} value={horse.frame} onChange={e => updateHorse(selectedHorse, "frame", +e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">馬名</label>
                  <input className="form-input" value={horse.name} onChange={e => updateHorse(selectedHorse, "name", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">性別</label>
                  <select className="form-select" value={horse.gender} onChange={e => updateHorse(selectedHorse, "gender", e.target.value)}>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">年齢</label>
                  <input type="number" className="form-input" min={2} max={10} value={horse.age} onChange={e => updateHorse(selectedHorse, "age", +e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">馬体重 (kg)</label>
                  <input type="number" className="form-input" value={horse.weight} onChange={e => updateHorse(selectedHorse, "weight", +e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">増減 (kg)</label>
                  <input type="number" className="form-input" value={horse.weightChange} onChange={e => updateHorse(selectedHorse, "weightChange", +e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">騎手</label>
                  <input className="form-input" value={horse.jockey} onChange={e => updateHorse(selectedHorse, "jockey", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">斤量</label>
                  <input type="number" className="form-input" step={0.5} value={horse.jockeyWeight} onChange={e => updateHorse(selectedHorse, "jockeyWeight", +e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">調教師</label>
                  <input className="form-input" value={horse.trainer} onChange={e => updateHorse(selectedHorse, "trainer", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">父（種牡馬）</label>
                  <input className="form-input" value={horse.sire} onChange={e => updateHorse(selectedHorse, "sire", e.target.value)} placeholder="例: ヘニーヒューズ" />
                </div>
                <div className="form-group">
                  <label className="form-label">母父（BMS）</label>
                  <input className="form-input" value={horse.bms} onChange={e => updateHorse(selectedHorse, "bms", e.target.value)} placeholder="例: キングカメハメハ" />
                </div>
                <div className="form-group">
                  <label className="form-label">血統系統</label>
                  <input className="form-input" value={horse.bloodline} onChange={e => updateHorse(selectedHorse, "bloodline", e.target.value)} placeholder="例: パイロ / ホッコータルマエ" />
                </div>
                <div className="form-group">
                  <label className="form-label">脚質</label>
                  <select className="form-select" value={horse.style} onChange={e => updateHorse(selectedHorse, "style", e.target.value)}>
                    {STYLES.map(s => <option key={s} value={s}>{s || "不明"}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">オッズ</label>
                  <input type="number" className="form-input" step={0.1} value={horse.odds || ""} onChange={e => updateHorse(selectedHorse, "odds", +e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">人気</label>
                  <input type="number" className="form-input" min={1} value={horse.popularity || horse.number} onChange={e => updateHorse(selectedHorse, "popularity", +e.target.value)} />
                </div>
              </div>

              <hr className="divider" />
              <div className="form-group">
                <label className="form-label">前走騎手</label>
                <input className="form-input" value={horse.prevJockey || ""} onChange={e => updateHorse(selectedHorse, "prevJockey", e.target.value)} />
              </div>

              {/* Flags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                {([
                  ["isTransferFirstRace", "転入初戦"],
                  ["isAuction", "オークション馬"],
                  ["isAfterRest", "休み明け"],
                  ["isHelmetChange", "ヘルメット変更"],
                  ["prizeCloseFlag", "賞金上限接近"],
                  ["prevInnerLoadExp", "前走内負荷経験"],
                ] as [keyof Horse, string][]).map(([field, label]) => (
                  <label key={field} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.8rem" }}>
                    <input type="checkbox" checked={!!(horse[field] as unknown as boolean)} onChange={e => updateHorse(selectedHorse, field, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>

              {/* Past races */}
              <hr className="divider" />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>📋 過去成績</div>
                <button className="btn btn-secondary btn-sm" onClick={() => addPastRace(selectedHorse)}>＋ 前走追加</button>
              </div>
              {horse.pastRaces.map((pr, prIdx) => (
                <div key={prIdx} style={{ background: "var(--bg-surface)", borderRadius: "8px", padding: "12px", marginBottom: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-gold)" }}>
                      {prIdx === 0 ? "前走" : prIdx === 1 ? "前前走" : `${prIdx + 1}走前`}
                    </span>
                    <button className="btn btn-danger btn-sm" onClick={() => removePastRace(selectedHorse, prIdx)}>削除</button>
                  </div>
                  <div className="grid-4" style={{ gap: "8px" }}>
                    <div><label className="form-label">日付</label><input type="date" className="form-input" value={pr.date} onChange={e => updatePastRace(selectedHorse, prIdx, "date", e.target.value)} /></div>
                    <div><label className="form-label">競馬場</label><input className="form-input" value={pr.venue} onChange={e => updatePastRace(selectedHorse, prIdx, "venue", e.target.value)} /></div>
                    <div><label className="form-label">距離</label><input type="number" className="form-input" value={pr.distance} onChange={e => updatePastRace(selectedHorse, prIdx, "distance", +e.target.value)} /></div>
                    <div>
                      <label className="form-label">馬場</label>
                      <select className="form-select" value={pr.condition} onChange={e => updatePastRace(selectedHorse, prIdx, "condition", e.target.value)}>
                        {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label className="form-label">着順</label><input type="number" className="form-input" min={1} value={pr.result} onChange={e => updatePastRace(selectedHorse, prIdx, "result", +e.target.value)} /></div>
                    <div><label className="form-label">走破タイム</label><input className="form-input" value={pr.time} onChange={e => updatePastRace(selectedHorse, prIdx, "time", e.target.value)} placeholder="1:14.2" /></div>
                    <div><label className="form-label">4角順位</label><input type="number" className="form-input" min={1} value={pr.corner4Position} onChange={e => updatePastRace(selectedHorse, prIdx, "corner4Position", +e.target.value)} /></div>
                    <div><label className="form-label">外回し頭数</label><input type="number" className="form-input" min={1} value={pr.cornerOuterCount} onChange={e => updatePastRace(selectedHorse, prIdx, "cornerOuterCount", +e.target.value)} /></div>
                    <div><label className="form-label">馬体重</label><input type="number" className="form-input" value={pr.weight} onChange={e => updatePastRace(selectedHorse, prIdx, "weight", +e.target.value)} /></div>
                    <div><label className="form-label">騎手</label><input className="form-input" value={pr.jockey} onChange={e => updatePastRace(selectedHorse, prIdx, "jockey", e.target.value)} /></div>
                    <div><label className="form-label">オッズ</label><input type="number" className="form-input" step={0.1} value={pr.odds} onChange={e => updatePastRace(selectedHorse, prIdx, "odds", +e.target.value)} /></div>
                    <div><label className="form-label">基準タイム</label><input type="number" className="form-input" step={0.1} value={pr.classBaseTime || ""} onChange={e => updatePastRace(selectedHorse, prIdx, "classBaseTime", +e.target.value)} placeholder="任意" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

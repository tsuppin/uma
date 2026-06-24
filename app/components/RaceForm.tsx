"use client";
import { useState } from "react";
import { Race, Horse, RaceResult } from "../types";
import { generateId } from "../lib/storage";
import { detectFormat, parseNARText, parseJRAText, parseRakutenKeibaText, parseJRAOfficialText, parseRakutenKeibaResultText } from "../lib/parser";

const CONDITIONS: Race["condition"][] = ["良","稍重","重","不良"];
const SURFACES: Race["surface"][] = ["ダート","芝","障害"];

export default function RaceForm({ onSubmit, onSubmitResult, onCancel }: {
  onSubmit: (race: Race) => void;
  onSubmitResult?: (race: Race, result: RaceResult) => void;
  onCancel: () => void;
}) {
  const [pasteText, setPasteText] = useState("");
  const [parseError, setParseError] = useState("");
  const [parsed, setParsed] = useState<{
    horses: Horse[]; venue: string; raceNumber: number;
    date?: string; distance?: number; surface?: Race["surface"];
    condition?: Race["condition"]; headCount?: number; raceName?: string;
  } | null>(null);
  const [parsedResult, setParsedResult] = useState<{ race: Partial<Race>, result: RaceResult } | null>(null);

  // レース基本情報（解析後に確認・修正）
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [venue, setVenue] = useState("");
  const [raceNumber, setRaceNumber] = useState(1);
  const [raceName, setRaceName] = useState("");
  const [distance, setDistance] = useState(1400);
  const [surface, setSurface] = useState<Race["surface"]>("ダート");
  const [condition, setCondition] = useState<Race["condition"]>("良");
  const [isWin5, setIsWin5] = useState(false);
  const [windSpeed, setWindSpeed] = useState(0);
  const [isHeadwind, setIsHeadwind] = useState(false);
  const [isInBiasActive, setIsInBiasActive] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [weather, setWeather] = useState("晴");

  const handleParse = () => {
    setParseError("");
    if (!pasteText.trim()) { setParseError("テキストを貼り付けてください"); return; }

    const fmt = detectFormat(pasteText);
    if (fmt === "rakuten_result") {
      const { race: partialRace, result: parsedResultObj } = parseRakutenKeibaResultText(pasteText);
      if (!partialRace.venue || parsedResultObj.result.length === 0) {
        setParseError("競走成績を正しく解析できませんでした。出馬表ではなく成績表か確認してください。");
        return;
      }
      setParsedResult({ race: partialRace, result: parsedResultObj });
      if (partialRace.venue) setVenue(partialRace.venue);
      if (partialRace.raceNumber) setRaceNumber(partialRace.raceNumber);
      if (partialRace.date) setDate(partialRace.date);
      if (partialRace.distance) setDistance(partialRace.distance);
      if (partialRace.surface) setSurface(partialRace.surface);
      if (partialRace.condition) setCondition(partialRace.condition);
      if (partialRace.raceName) setRaceName(partialRace.raceName);
      return;
    }

    let result: ReturnType<typeof parseNARText> | ReturnType<typeof parseJRAText> | ReturnType<typeof parseRakutenKeibaText> | ReturnType<typeof parseJRAOfficialText>;

    if (fmt === "rakuten") {
      result = parseRakutenKeibaText(pasteText);
    } else if (fmt === "nar") {
      result = parseNARText(pasteText);
    } else if (fmt === "jra_official") {
      result = parseJRAOfficialText(pasteText);
    } else {
      result = parseJRAText(pasteText);
    }

    if (result.horses.length === 0) {
      setParseError(`馬情報を解析できませんでした（検出フォーマット: ${fmt === "rakuten" ? "楽天競馬" : fmt === "nar" ? "地方競馬" : "JRA"}）\n出馬表の全テキストをコピーして貼り付けてください。`);
      return;
    }

    setParsed(result);
    if (result.venue) setVenue(result.venue);
    if (result.raceNumber) setRaceNumber(result.raceNumber);
    if ("date" in result && result.date) setDate(result.date);
    if ("distance" in result && result.distance) setDistance(result.distance);
    if ("surface" in result && result.surface) setSurface(result.surface);
    if ("condition" in result && result.condition) setCondition(result.condition);
    if ("raceName" in result && result.raceName) setRaceName(result.raceName);
    if ("startTime" in result && result.startTime) setStartTime(result.startTime);
    if ("weather" in result && result.weather) setWeather(result.weather);
  };

  const handleSubmit = () => {
    if (!parsed || parsed.horses.length === 0) { alert("先に出馬表を解析してください"); return; }
    if (!venue) { alert("競馬場を入力してください"); return; }
    onSubmit({
      id: generateId(), date, venue, raceNumber,
      raceName: raceName || `${raceNumber}R`,
      distance, surface, condition,
      headCount: parsed.horses.length,
      isWin5, windSpeed, isHeadwind, isInBiasActive,
      trackName: venue,
      startTime: startTime || undefined,
      weather: weather || undefined,
      horses: parsed.horses,
    });
  };

  const handleSubmitResult = () => {
    if (!parsedResult || !onSubmitResult) return;
    if (!venue) { alert("競馬場を入力してください"); return; }
    
    const mockRace: Race = {
      id: parsedResult.result.raceId || generateId(),
      date, venue, raceNumber,
      raceName: raceName || `${raceNumber}R`,
      distance, surface, condition,
      headCount: parsedResult.result.result.length,
      isWin5: false, windSpeed: 0, isHeadwind: false, isInBiasActive: false,
      trackName: venue,
      horses: []
    };
    
    onSubmitResult(mockRace, parsedResult.result);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPasteText(text);
      setParseError("");
    } catch (err) {
      alert("クリップボードからの読み取りに失敗しました。お手数ですが、テキストエリアを長押しして貼り付けてください。");
    }
  };

  const updateHorse = (idx: number, field: keyof Horse, value: unknown) => {
    if (!parsed) return;
    setParsed({ ...parsed, horses: parsed.horses.map((h, i) => i === idx ? { ...h, [field]: value } : h) });
  };

  const removeHorse = (idx: number) => {
    if (!parsed) return;
    setParsed({ ...parsed, horses: parsed.horses.filter((_, i) => i !== idx) });
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">➕ 新規レース登録</h2>
        <div className="flex gap-8">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>キャンセル</button>
          {parsed && <button type="button" className="btn btn-primary" onClick={handleSubmit}>💾 保存して予想へ</button>}
        </div>
      </div>

      {/* Step1: テキスト貼り付け */}
      {!parsed && (
        <div className="card fade-in">
          <div className="card-header"><div className="card-title">📋 出馬表（および過去走データ）テキスト貼り付け</div></div>
          <div className="alert alert-info mt-8">
            💡 <b>予測精度を高めるためのヒント:</b><br />
            楽天競馬の「競走成績」やJRAの「過去走」が含まれるページ全体をコピーして貼り付けると、AIエンジンが過去の展開や着差を考慮した精度の高い分析（Yatomi Physics等）を行えるようになります。
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" htmlFor="paste-text" style={{ marginBottom: 0 }}>出馬表・過去走テキスト</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handlePasteFromClipboard}>
                📋 クリップボードから貼り付け
              </button>
            </div>
            <textarea
              id="paste-text"
              className="form-textarea min-h-200 mono fs-sm mt-4"
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setParseError(""); }}
              placeholder={"JRA形式:\n2回東京2日 12R\n枠1白\t1\n...\n\n楽天競馬/地方競馬形式:\n（「競走成績」タブの全体をコピーしてください）\n水沢競馬場 1R 競走成績\n1\t1\t...\n過去映像\n水沢 26.05.25\n..."}
            />
            <div className="fs-xs text-muted mt-4 text-right">
              {pasteText.length.toLocaleString()} 文字
            </div>
          </div>
          {parseError && <div className="alert alert-warning">⚠️ {parseError}</div>}
          <div className="flex gap-8">
            <button type="button" className="btn btn-primary p-10-28 fs-md"
              onClick={handleParse} disabled={!pasteText.trim()}>
              🔍 解析実行
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setPasteText("")}>クリア</button>
          </div>
        </div>
      )}

      {/* Step2: 確認・修正 */}
      {parsed && (
        <div className="fade-in">
          <div className="alert alert-success">
            ✅ {parsed.horses.length}頭を解析完了（{detectFormat(pasteText) === "rakuten" ? "楽天競馬" : detectFormat(pasteText) === "nar" ? "地方競馬" : "JRA"}形式）
            <button type="button" className="btn btn-secondary btn-sm ml-8" onClick={() => setParsed(null)}>
              ← 貼り直す
            </button>
          </div>

          {/* レース情報 */}
          <div className="card">
            <div className="card-header"><div className="card-title">🏇 レース情報（確認・修正）</div></div>
            <div className="grid-4 gap-12">
              <div className="form-group">
                <label className="form-label" htmlFor="race-date">開催日</label>
                <input id="race-date" type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="race-venue">競馬場</label>
                <input id="race-venue" className="form-input" value={venue} onChange={e => setVenue(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="race-num">レース番号</label>
                <input id="race-num" type="number" className="form-input" min={1} max={12} value={raceNumber} onChange={e => setRaceNumber(+e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="race-name">レース名・クラス</label>
                <input id="race-name" className="form-input" value={raceName} onChange={e => setRaceName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="race-dist">距離 (m)</label>
                <input id="race-dist" type="number" className="form-input" value={distance} onChange={e => setDistance(+e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="race-surface">馬場種別</label>
                <select id="race-surface" className="form-select" value={surface} onChange={e => setSurface(e.target.value as Race["surface"])}>
                  {SURFACES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="race-cond">馬場状態</label>
                <select id="race-cond" className="form-select" value={condition} onChange={e => setCondition(e.target.value as Race["condition"])}>
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="race-time">発走時刻</label>
                <input id="race-time" className="form-input" placeholder="例: 20:15" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="race-weather">天候</label>
                <input id="race-weather" className="form-input" placeholder="例: 晴" value={weather} onChange={e => setWeather(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="race-wind">風速(m/s)・WIN5</label>
                <div className="flex gap-6">
                  <input id="race-wind" type="number" className="form-input" step={0.5} value={windSpeed}
                    onChange={e => setWindSpeed(+e.target.value)} placeholder="風速" />
                  <select id="race-is-win5" className="form-select w-auto" aria-label="WIN5対象レース選択"
                    value={isWin5 ? "1" : "0"} onChange={e => setIsWin5(e.target.value === "1")}>
                    <option value="0">通常</option>
                    <option value="1">WIN5</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* 出走馬一覧 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🐴 出走馬確認（{parsed.horses.length}頭）</div>
              <div className="fs-xs text-muted">
                ※馬体重は前走の値。当日発表後に修正可能
              </div>
            </div>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="出走馬一覧テーブル">
              <table className="horse-table">
                <thead>
                  <tr>
                    <th>枠</th><th>馬番</th><th>馬名(所属)</th><th>性齢</th>
                    <th>騎手</th><th>斤量</th><th>体重</th><th>増減</th>
                    <th>転入</th><th>JRA賞金</th><th>父</th><th>オッズ</th>
                    <th>前走</th><th>前々走</th><th>3走前</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.horses.map((h, i) => (
                    <tr key={h.id}>
                      <td><span className={`frame-badge frame-${h.frame}`}>{h.frame}</span></td>
                      <td className="fw-700 text-gold">{h.number}</td>
                      <td>
                        <div className="flex flex-col gap-2">
                          <input id={`h-name-${h.id}`} className="form-input w-110 p-4-8 fs-sm" aria-label={`${h.number}番 馬名`}
                            value={h.name} onChange={e => updateHorse(i, "name", e.target.value)} />
                          {h.belonging && (
                            <span className="text-secondary fs-xs">({h.belonging})</span>
                          )}
                        </div>
                        {h.useBlinkers && <span className="tag tag-purple ml-6 fs-xs">B</span>}
                      </td>
                      <td className="fs-sm text-secondary nowrap">
                        {h.gender}{h.age}
                      </td>
                      <td>
                        <input id={`h-jockey-${h.id}`} className="form-input w-80 p-4-8 fs-sm" aria-label={`${h.number}番 騎手`}
                          value={h.jockey} onChange={e => updateHorse(i, "jockey", e.target.value)} />
                    </td>
                    <td className="fs-sm">{h.jockeyWeight}</td>
                    <td>
                      <input id={`h-weight-${h.id}`} type="number" className="form-input w-60 p-4-8 fs-sm" aria-label={`${h.number}番 馬体重`}
                        value={h.weight} onChange={e => updateHorse(i, "weight", +e.target.value)} />
                    </td>
                    <td>
                      <input id={`h-weight-change-${h.id}`} type="number" className="form-input w-60 p-4-8 fs-sm" aria-label={`${h.number}番 馬体重増減`}
                        value={h.weightChange} onChange={e => updateHorse(i, "weightChange", +e.target.value)} />
                    </td>
                    <td>
                      <input id={`h-transfer-${h.id}`} className="form-input w-60 p-4-8 fs-sm"
                        value={h.transferFrom || ""} onChange={e => updateHorse(i, "transferFrom", e.target.value)}
                        placeholder="JRA等" aria-label={`${h.number}番 転入元`} />
                    </td>
                    <td>
                      <input id={`h-jra-earnings-${h.id}`} type="number" className="form-input w-65 p-4-8 fs-sm"
                        value={h.jraEarnings || ""} onChange={e => updateHorse(i, "jraEarnings", e.target.value ? +e.target.value : undefined)}
                        placeholder="万" aria-label={`${h.number}番 JRA本賞金`} />
                    </td>
                    <td className="fs-xs text-muted ellipsis max-w-80" title={h.sire}>
                      {h.sire || "—"}
                    </td>
                    <td>
                      <input id={`h-odds-${h.id}`} type="number" className="form-input w-60 p-4-8 fs-sm" step={0.1}
                        value={h.odds || ""} onChange={e => updateHorse(i, "odds", +e.target.value)}
                        placeholder="倍" aria-label={`${h.number}番 オッズ`} />
                    </td>
                    {[0, 1, 2].map(pi => {
                      const pr = h.pastRaces[pi];
                      return (
                        <td key={pi} className="fs-xs nowrap">
                          {pr ? (
                            <span className={pr.result <= 3 ? "text-green" : "text-muted"}>
                              {pr.venue} <strong>{pr.result}着</strong>{pr.direction && `(${pr.direction})`}<br />
                              {pr.surface}{pr.distance}m {pr.condition}
                            </span>
                          ) : "—"}
                        </td>
                      );
                    })}
                    <td>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeHorse(i)} aria-label={`${h.number}番 削除`}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>キャンセル</button>
              {parsedResult ? (
                <button className="btn btn-primary" onClick={handleSubmitResult} style={{ flex: 1, backgroundColor: '#10b981' }}>
                  🏁 結果を蓄積・保存
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={!parsed} style={{ flex: 1 }}>
                  ✨ このレースを登録して予想へ
                </button>
              )}
            </div>
      </div>
    )}
    </div>
  );
}

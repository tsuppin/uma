"use client";
import { useState } from "react";
import { Race, RaceResult } from "../types";
import { generateFormation } from "../lib/engine";

type ResultRow = { rank: number; horseNumber: number; horseName: string; time: string; odds: number; prize: number; };

export default function ResultInput({ race, onSubmit, onCancel }: {
  race: Race;
  onSubmit: (result: RaceResult) => void;
  onCancel: () => void;
}) {
  const existing = race.result;
  const [pasteText, setPasteText] = useState("");
  const [parseError, setParseError] = useState("");
  const [results, setResults] = useState<ResultRow[]>(
    existing?.result || Array.from({ length: Math.min(3, race.horses.length) }, (_, i) => ({
      rank: i + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0,
    }))
  );
  const [profit, setProfit] = useState(existing?.profit || 0);

  // ==========================================
  // テキスト貼り付けパーサー
  // ==========================================
  const parsePasteText = () => {
    setParseError("");
    const lines = pasteText.split("\n").map(l => l.trim()).filter(Boolean);
    const parsed: ResultRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("着順") || line.includes("単勝") || line.startsWith("着") || line.includes("馬名(所属)")) continue;

      // 0. NAR公式の複数行コピー形式
      // 1行目: "1 8" (着順 枠)
      // 2行目: "10" (馬番)
      // 3行目: "エポエポサン(兵庫)" (馬名)
      const narMultiMatch = line.match(/^(\d+)\s+(\d+)$/);
      if (narMultiMatch && i + 2 < lines.length && /^\d+$/.test(lines[i + 1])) {
        const rank = parseInt(narMultiMatch[1]);
        const horseNumber = parseInt(lines[i + 1]);
        const horseName = lines[i + 2] || "";
        let time = "";
        
        for (let j = i + 3; j < i + 8 && j < lines.length; j++) {
          const timeMatch = lines[j].match(/(\d+[:.]\d+[:.]\d+|\d+[:.]\d+)/);
          if (timeMatch && timeMatch[1].includes(":")) {
             time = timeMatch[1].replace(/:(\d+)$/, '.$1');
             break;
          }
        }
        
        parsed.push({ rank, horseNumber, horseName, time, odds: 0, prize: 0 });
        i += 4; // 処理した行をスキップ
        continue;
      }

      // 0.1 JRA公式・ネット競馬等の複数行コピー形式
      // 1行目: "1  7  12  サトノフェンサー2番人気" (タブまたは複数スペース区切り)
      // 2行目以降にタイム "1:39.5 / 36.9"
      const jraMultiMatch = line.split(/\t|\s{2,}/);
      if (jraMultiMatch.length >= 4 && /^\d+$/.test(jraMultiMatch[0]) && /^\d+$/.test(jraMultiMatch[1]) && /^\d+$/.test(jraMultiMatch[2])) {
        const rank = parseInt(jraMultiMatch[0]);
        const horseNumber = parseInt(jraMultiMatch[2]);
        let horseName = jraMultiMatch[3] || "";
        horseName = horseName.replace(/\d+番人気$/, "").trim(); // "2番人気"等を削除
        
        let time = "";
        for (let j = i + 1; j < i + 5 && j < lines.length; j++) {
          const timeMatch = lines[j].match(/(\d+[:.]\d+[:.]\d+|\d+[:.]\d+)/);
          if (timeMatch && (lines[j].includes("/") || timeMatch[1].includes(":"))) {
             time = timeMatch[1].replace(/:(\d+)$/, '.$1');
             break;
          }
        }
        
        parsed.push({ rank, horseNumber, horseName, time, odds: 0, prize: 0 });
        i += 3; // 4行1セットとみなしてスキップ
        continue;
      }

      // 0.2 NAR公式・ネット競馬等（完全縦並びコピー形式）
      // 1行目: "1" (着順)
      // 2行目: "4" (枠番)
      // 3行目: "4" (馬番)
      // 4行目: "ブリスタイム(岩手)" (馬名)
      if (/^\d+$/.test(line) && i + 3 < lines.length && /^\d+$/.test(lines[i+1]) && /^\d+$/.test(lines[i+2]) && !/^\d/.test(lines[i+3])) {
        const rank = parseInt(line);
        const waku = parseInt(lines[i+1]);
        const horseNumber = parseInt(lines[i+2]);
        if (rank >= 1 && rank <= 18 && waku >= 1 && waku <= 8 && horseNumber >= 1 && horseNumber <= 18) {
          const horseName = lines[i+3].replace(/\(.+\)$/, "").trim();
          let time = "";
          for (let j = i + 4; j < i + 12 && j < lines.length; j++) {
            const timeMatch = lines[j].match(/(\d+[:.]\d+[:.]\d+|\d+[:.]\d+)/);
            if (timeMatch && timeMatch[1].includes(":")) {
               time = timeMatch[1].replace(/:(\d+)$/, '.$1');
               break;
            }
          }
          parsed.push({ rank, horseNumber, horseName, time, odds: 0, prize: 0 });
          i += 3; // 処理した行をスキップ (次でi++されるため馬名までスキップ)
          continue;
        }
      }

      let rank = parsed.length + 1;
      let horseNumber = 0;
      let horseName = "";
      let searchStr = line;

      // 1. "1着 3番..." または "1着 枠3 3番..."
      const explicitMatch = line.match(/^(\d+)\s*[着位]\s*(?:枠\d+)?\s*(\d+)\s*番?\s+(.+)/);
      if (explicitMatch) {
        rank = parseInt(explicitMatch[1]);
        horseNumber = parseInt(explicitMatch[2]);
        searchStr = explicitMatch[3];
      } else {
        // 2. "1 2 4 エルムラント" (着順 枠番 馬番 馬名)
        const jraMatch = line.match(/^(\d+)\s+(\d+)\s+(\d+)\s+([^\s\d]+)/);
        if (jraMatch && parseInt(jraMatch[1]) < 20 && parseInt(jraMatch[2]) <= 8 && parseInt(jraMatch[3]) <= 18) {
          rank = parseInt(jraMatch[1]);
          horseNumber = parseInt(jraMatch[3]);
          searchStr = line.slice(jraMatch[0].length);
          horseName = jraMatch[4];
        } else {
          // 3. "1 4 エルムラント" (着順 馬番 馬名)
          const simpleMatch = line.match(/^(\d+)\s+(\d+)\s+([^\s\d]+)/);
          if (simpleMatch && parseInt(simpleMatch[1]) < 20 && parseInt(simpleMatch[2]) <= 18) {
            rank = parseInt(simpleMatch[1]);
            horseNumber = parseInt(simpleMatch[2]);
            searchStr = line.slice(simpleMatch[0].length);
            horseName = simpleMatch[3];
          } else {
            // 4. フォールバック: 馬番だけ抽出、着順は行順
            const numPattern = /(?:^|\s)(\d{1,2})\s*番?(?:\s|$)/g;
            const nums: number[] = [];
            let m;
            while ((m = numPattern.exec(line)) !== null) {
              const n = parseInt(m[1]);
              if (n >= 1 && n <= 18) nums.push(n);
            }
            if (nums.length > 0) {
              if (nums.length >= 2 && nums[0] === rank) {
                horseNumber = nums[1];
              } else {
                horseNumber = nums[0];
              }
            }
          }
        }
      }

      if (!horseName) {
        const nameMatch = searchStr.match(/[\u3040-\u9FFF\u30A0-\u30FF\uFF00-\uFFEF]{2,}/);
        const matchedName = nameMatch ? nameMatch[0] : "";
        if (race.horses.some(h => h.name.includes(matchedName))) {
          horseName = matchedName;
        } else if (horseNumber > 0) {
          horseName = race.horses.find(h => h.number === horseNumber)?.name || matchedName;
        } else {
          horseName = ""; // ゴミデータを除外
        }
      }

      // タイムを抽出 (1:33.3 や 1:33:3 に対応)
      const timeMatch = line.match(/(\d+[:.]\d+[:.]\d+|\d+[:.]\d+)/);
      const time = timeMatch ? timeMatch[1].replace(/:(\d+)$/, '.$1') : "";

      // オッズを抽出（数字.数字 + 倍）
      const oddsMatch = line.match(/(\d+\.?\d*)\s*倍/);
      const odds = oddsMatch ? parseFloat(oddsMatch[1]) : 0;

      // 賞金（万円）を抽出
      const prizeMatch = line.match(/(\d+[\d,]*)\s*万?円/);
      const prize = prizeMatch ? parseInt(prizeMatch[1].replace(",", "")) : 0;

      if (horseNumber > 0 || horseName) {
        parsed.push({ rank, horseNumber, horseName, time, odds, prize });
      }
    }

    if (parsed.length === 0) {
      setParseError("着順を解析できませんでした。\n例: 「1 2 4 エルムラント 1:14.2」のような形式で入力してください。");
      return;
    }

    // 有効なデータのみに絞ってからrankでソート
    const validParsed = parsed.filter(p => p.horseNumber > 0 || p.horseName !== "");
    validParsed.sort((a, b) => a.rank - b.rank);

    // 1着、2着、3着の3行のみ抽出
    const top3 = validParsed.filter(p => p.rank <= 3).slice(0, 3);
    
    // 足りない場合は空行を補填して必ず3着まで入力できるようにする
    while (top3.length < 3) {
      top3.push({ rank: top3.length + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0 });
    }

    setResults(top3);
  };

  const updateResult = (idx: number, field: string, value: unknown) => {
    setResults(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const updated = { ...r, [field]: value };
      if (field === "horseNumber") {
        const h = race.horses.find(h => h.number === value);
        if (h) updated.horseName = h.name;
      }
      return updated;
    }));
  };

  const addRow = () => {
    setResults(prev => [...prev, { rank: prev.length + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0 }]);
  };

  const removeRow = (idx: number) => {
    setResults(prev => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, rank: i + 1 })));
  };

  // 的中判定
  const formation = race.predictions ? generateFormation(race.predictions) : null;
  const resultNums = results.slice(0, 3).map(r => r.horseNumber).filter(Boolean).sort((a, b) => a - b);
  const hitTickets = formation ? formation.tickets.filter(ticket => {
    const sorted = [...ticket].sort((a, b) => a - b);
    return sorted.length === 3 && sorted.every((n, i) => n === resultNums[i]);
  }) : [];

  const handleSubmit = () => {
    if (results[0]?.horseNumber === 0) { alert("1着馬番を入力してください"); return; }
    onSubmit({
      raceId: race.id,
      result: results.filter(r => r.horseNumber > 0),
      hitTickets,
      profit,
      learningApplied: false,
    });
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">✅ 結果入力</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={onCancel}>キャンセル</button>
          <button className="btn btn-primary" onClick={handleSubmit}>💾 確定・自学習開始</button>
        </div>
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
        {race.venue} {race.raceNumber}R {race.raceName} / {race.surface} {race.distance}m
      </div>

      {/* 📋 テキスト貼り付け・解析エリア */}
      <div className="card fade-in">
        <div className="card-header">
          <div className="card-title">📋 レース結果テキスト貼り付け（自動入力）</div>
        </div>
        <div className="alert alert-info">
            💡 レース結果をそのまま貼り付けると自動解析します。
            <br />
            <strong>対応形式例:</strong>
            <br />
            <code style={{ fontSize: "0.75rem", display: "block", marginTop: "6px", color: "var(--text-secondary)" }}>
              1着 3番 クラウンヴィラン 1:14.2 3.5倍<br />
              2着 8番 バイアーナ 1:14.5 4.5倍<br />
              3着 12番 シナモンデイジー 1:14.8 35.6倍<br />
              <br />
              ※ネットの払戻テキスト・JRA/地方競馬公式サイトのコピー文字列もそのまま貼付け可
            </code>
          </div>

          <div className="form-group">
            <label className="form-label">結果テキスト（5000文字まで）</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: "180px", fontFamily: "monospace", fontSize: "0.8rem" }}
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setParseError(""); }}
              placeholder={`例:\n1着 3番 クラウンヴィラン 1:14.2 3.5倍\n2着 8番 バイアーナ 1:14.5 4.5倍\n3着 12番 シナモンデイジー 1:14.8 35.6倍\n\n（netkeibaやJRAのレース結果をコピーしてそのまま貼付けもOK）`}
              maxLength={5000}
            />
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "right" }}>
              {pasteText.length} / 5000文字
            </div>
          </div>

          {parseError && (
            <div className="alert alert-warning">
              ⚠️ {parseError}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-primary"
              onClick={parsePasteText}
              disabled={!pasteText.trim()}
              style={{ opacity: pasteText.trim() ? 1 : 0.5 }}
            >
              🔍 テキストを解析
            </button>
            <button className="btn btn-secondary" onClick={() => setPasteText("")}>
              クリア
            </button>
          </div>

          {/* クイック入力ガイド */}
          <hr className="divider" />
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <div style={{ fontWeight: 600, marginBottom: "8px" }}>🏇 クイック馬番入力</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[1, 2, 3].map(rank => (
                <span key={rank} style={{ color: "var(--text-secondary)" }}>{rank}着:</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
              {[1, 2, 3].map((rank, ri) => (
                <div key={rank} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className={`rank-badge rank-${rank}`}>{rank}着</span>
                  <select
                    className="form-select"
                    style={{ width: "80px" }}
                    value={results[ri]?.horseNumber || 0}
                    onChange={e => {
                      const num = +e.target.value;
                      const h = race.horses.find(h => h.number === num);
                      setResults(prev => {
                        const next = [...prev];
                        while (next.length <= ri) next.push({ rank: next.length + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0 });
                        next[ri] = { ...next[ri], horseNumber: num, horseName: h?.name || "" };
                        return next;
                      });
                    }}
                  >
                    <option value={0}>—</option>
                    {race.horses.map(h => (
                      <option key={h.id} value={h.number}>{h.number}番 {h.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* ✏️ 手動入力・詳細エリア */}
      <div className="card fade-in" style={{ marginTop: "16px" }}>
        <div className="card-header">
          <div className="card-title">✏️ 着順・詳細入力</div>
        </div>
        <table className="horse-table">
            <thead>
              <tr>
                <th>着順</th><th>馬番</th><th>馬名</th>
                <th>走破タイム</th><th>単勝オッズ</th><th>賞金(万円)</th><th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>
                    <span className={`rank-badge rank-${i < 3 ? i + 1 : "other"}`}>{r.rank}着</span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ width: "90px" }}
                      value={r.horseNumber}
                      onChange={e => updateResult(i, "horseNumber", +e.target.value)}
                    >
                      <option value={0}>—</option>
                      {race.horses.map(h => (
                        <option key={h.id} value={h.number}>{h.number}番</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontWeight: r.horseName ? 600 : 400, color: r.horseName ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {r.horseName || (r.horseNumber ? race.horses.find(h => h.number === r.horseNumber)?.name || "—" : "—")}
                  </td>
                  <td>
                    <input className="form-input" style={{ width: "100px" }} value={r.time}
                      onChange={e => updateResult(i, "time", e.target.value)} placeholder="1:14.2" />
                  </td>
                  <td>
                    <input type="number" className="form-input" style={{ width: "80px" }} step={0.1}
                      value={r.odds || ""} onChange={e => updateResult(i, "odds", +e.target.value)} placeholder="倍" />
                  </td>
                  <td>
                    <input type="number" className="form-input" style={{ width: "100px" }}
                      value={r.prize || ""} onChange={e => updateResult(i, "prize", +e.target.value)} placeholder="万円" />
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => removeRow(i)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: "8px" }} onClick={addRow}>
            ＋ 着順追加
          </button>
        </div>

      {/* 的中確認 */}
      {formation && resultNums.length >= 3 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 的中確認</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              3連複 {resultNums.join("-")} で判定中
            </div>
          </div>
          {hitTickets.length > 0 ? (
            <div className="alert alert-success">
              🎉 的中！ 買い目 {hitTickets.map(t => t.join("-")).join(", ")} が的中しました
            </div>
          ) : (
            <div className="alert alert-warning">
              😞 今回は不的中でした。AIが自動学習して次回に活かします。
            </div>
          )}
          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">払戻金額（円）</label>
            <input type="number" className="form-input" value={profit || ""}
              onChange={e => setProfit(+e.target.value)} placeholder="的中した場合の払戻金額を入力" />
          </div>
        </div>
      )}

      {/* 予想との比較 */}
      {race.predictions && race.predictions.length > 0 && results.some(r => r.horseNumber > 0) && (
        <div className="card">
          <div className="card-header"><div className="card-title">📊 予想との比較</div></div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {race.predictions.slice(0, 7).map((p, i) => {
              const hitResult = results.find(r => r.horseNumber === p.horseNumber);
              const isHit = !!hitResult;
              return (
                <div key={p.horseId} style={{
                  padding: "10px 14px",
                  background: isHit ? "var(--accent-green)15" : "var(--bg-surface)",
                  border: `1px solid ${isHit ? "var(--accent-green)40" : "var(--border)"}`,
                  borderRadius: "8px", textAlign: "center", minWidth: "80px",
                }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>予想{i + 1}位</div>
                  <div style={{ fontWeight: 700, color: isHit ? "var(--accent-green)" : "var(--text-primary)" }}>
                    {p.horseNumber}番
                  </div>
                  <div style={{ fontSize: "0.75rem" }}>{p.horseName}</div>
                  {isHit && (
                    <div style={{ color: "var(--accent-green)", fontSize: "0.7rem", fontWeight: 700 }}>
                      {hitResult.rank}着 ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

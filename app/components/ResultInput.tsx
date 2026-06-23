"use client";
import { useState } from "react";
import { Race, RaceResult } from "../types";
import { generateFormation } from "../lib/engine";
import MobileRaceResult from "./MobileRaceResult";
import { parseRaceResult } from "../lib/resultParser";

type ResultRow = { rank: number; horseNumber: number; horseName: string; time: string; odds: number; prize: number; belonging?: string; passing?: string; margin?: string; pace?: string; up3Time?: number; };

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
  const [betAmount, setBetAmount] = useState(100);

  // 詳細な追加データ状態
  const [lapTimes, setLapTimes] = useState<string[]>(existing?.lapTimes || []);
  const [last4fTime, setLast4fTime] = useState(existing?.last4fTime || "");
  const [last3fTime, setLast3fTime] = useState(existing?.last3fTime || "");
  const [cornerPassings, setCornerPassings] = useState<string[]>(existing?.cornerPassings || []);
  const [incidents, setIncidents] = useState(existing?.incidents || "");
  const [winnerProfile, setWinnerProfile] = useState<RaceResult["winnerProfile"] | undefined>(existing?.winnerProfile);
  const [refunds, setRefunds] = useState<RaceResult["refunds"] | undefined>(existing?.refunds);

  // ==========================================
  // テキスト貼り付けパーサー
  // ==========================================
  const parsePasteText = () => {
    setParseError("");
    
    if (!pasteText.trim()) return;

    try {
      const parsed = parseRaceResult(pasteText, race.horses);

      if (!parsed.result || parsed.result.length === 0) {
        setParseError("着順を解析できませんでした。テキストデータのフォーマットを確認してください。");
        return;
      }

      if (parsed.lapTimes) setLapTimes(parsed.lapTimes);
      if (parsed.last4fTime) setLast4fTime(parsed.last4fTime);
      if (parsed.last3fTime) setLast3fTime(parsed.last3fTime);
      if (parsed.cornerPassings) setCornerPassings(parsed.cornerPassings);
      if (parsed.incidents) setIncidents(parsed.incidents);
      if (parsed.winnerProfile) setWinnerProfile(parsed.winnerProfile);
      if (parsed.refunds && Object.keys(parsed.refunds).length > 0) setRefunds(parsed.refunds);

      const calculated = parsed.result as ResultRow[];

    // 的中払戻金の自動計算（初期betAmount = 100円ベース）
    if (race.predictions && calculated.length >= 2) {
      const r1 = calculated[0]?.horseNumber || 0;
      const r2 = calculated[1]?.horseNumber || 0;
      const r3 = calculated[2]?.horseNumber || 0;

      const predictions = race.predictions;
      const formWin = generateFormation(predictions, 'win', race);
      const formWide = generateFormation(predictions, 'wide', race);
      const formTrio = generateFormation(predictions, 'trifecta', race);
      const formTrifecta = generateFormation(predictions, 'trifecta_exact', race);
      const formQuinella = generateFormation(predictions, 'quinella', race);
      const formExacta = generateFormation(predictions, 'exacta', race);

      const resWin = [r1].filter(Boolean);
      const hitWin = formWin && r1 ? formWin.tickets.filter(t => t[0] === r1) : [];

      const resWideMatches: number[][] = [];
      if (r1 && r2) resWideMatches.push([r1, r2].sort((a,b)=>a-b));
      if (r1 && r3) resWideMatches.push([r1, r3].sort((a,b)=>a-b));
      if (r2 && r3) resWideMatches.push([r2, r3].sort((a,b)=>a-b));
      const hitWide = formWide ? formWide.tickets.filter(t => {
        const sortedT = [...t].sort((a,b)=>a-b);
        return resWideMatches.some(match => match[0] === sortedT[0] && match[1] === sortedT[1]);
      }) : [];

      const resTrio = [r1, r2, r3].filter(Boolean).sort((a,b)=>a-b);
      const hitTrio = resTrio.length === 3 ? formTrio.tickets.filter(t => [...t].sort((a,b)=>a-b).every((n,i)=>n===resTrio[i])) : [];

      const resTrifecta = [r1, r2, r3].filter(Boolean);
      const hitTrifecta = resTrifecta.length === 3 ? formTrifecta.tickets.filter(t => t.every((n,i)=>n===resTrifecta[i])) : [];

      const resQuinella = [r1, r2].filter(Boolean).sort((a,b)=>a-b);
      const hitQuinella = resQuinella.length === 2 ? formQuinella.tickets.filter(t => [...t].sort((a,b)=>a-b).every((n,i)=>n===resQuinella[i])) : [];

      const resExacta = [r1, r2].filter(Boolean);
      const hitExacta = resExacta.length === 2 ? formExacta.tickets.filter(t => t.every((n,i)=>n===resExacta[i])) : [];

      let totalProfit = 0;
      const betMultiplier = betAmount / 100;

      if (hitWin.length > 0) {
        const payout = parsed.refunds?.win?.[0]?.payout || 0;
        totalProfit += hitWin.length * payout * betMultiplier;
      }
      if (hitWide.length > 0) {
        // ワイドは複数の的中の可能性があるため、すべての的中チケットに対して払い戻しを加算
        hitWide.forEach(t => {
          // 実際の払戻データから、このチケット(2頭の組み合わせ)に一致する払戻を探す
          const sortedT = [...t].sort((a,b)=>a-b);
          const refund = parsed.refunds?.wide?.find(rw => {
            const matchNums = rw.combination?.split(/[\-\s]+/).map(n => parseInt(n)).sort((a,b)=>a-b) || [];
            return matchNums[0] === sortedT[0] && matchNums[1] === sortedT[1];
          });
          const payout = refund?.payout || (parsed.refunds?.wide?.[0]?.payout || 0); // マッチしない場合は1つ目の払戻を使用
          totalProfit += payout * betMultiplier;
        });
      }
      if (hitTrio.length > 0) {
        const payout = parsed.refunds?.trio?.[0]?.payout || 0;
        totalProfit += hitTrio.length * payout * betMultiplier;
      }
      if (hitTrifecta.length > 0) {
        const payout = parsed.refunds?.trifecta?.[0]?.payout || 0;
        totalProfit += hitTrifecta.length * payout * betMultiplier;
      }
      if (hitQuinella.length > 0) {
        const payout = parsed.refunds?.quinella?.[0]?.payout || 0;
        totalProfit += hitQuinella.length * payout * betMultiplier;
      }
      if (hitExacta.length > 0) {
        const payout = parsed.refunds?.exacta?.[0]?.payout || 0;
        totalProfit += hitExacta.length * payout * betMultiplier;
      }

      setProfit(totalProfit);
    }
    
    setResults(calculated);
    } catch (err: any) {
      setParseError("パース中にエラーが発生しました：" + err.message);
    }
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
    setResults(prev => [...prev, { rank: prev.length + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0, passing: "" }]);
  };

  const removeRow = (idx: number) => {
    setResults(prev => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, rank: i + 1 })));
  };

  // 各券種の的中判定
  const predictions = race.predictions || [];
  const formWin = predictions.length > 0 ? generateFormation(predictions, 'win', race) : null;
  const formWide = predictions.length > 0 ? generateFormation(predictions, 'wide', race) : null;
  const formTrio = predictions.length > 0 ? generateFormation(predictions, 'trifecta', race) : null;
  const formTrifecta = predictions.length > 0 ? generateFormation(predictions, 'trifecta_exact', race) : null;
  const formQuinella = predictions.length > 0 ? generateFormation(predictions, 'quinella', race) : null;
  const formExacta = predictions.length > 0 ? generateFormation(predictions, 'exacta', race) : null;

  const r1 = results[0]?.horseNumber || 0;
  const r2 = results[1]?.horseNumber || 0;
  const r3 = results[2]?.horseNumber || 0;

  const resWin = [r1].filter(Boolean);
  const hitWin = formWin && r1 ? formWin.tickets.filter(t => t[0] === r1) : [];

  const resWideMatches: number[][] = [];
  if (r1 && r2) resWideMatches.push([r1, r2].sort((a,b)=>a-b));
  if (r1 && r3) resWideMatches.push([r1, r3].sort((a,b)=>a-b));
  if (r2 && r3) resWideMatches.push([r2, r3].sort((a,b)=>a-b));
  
  const hitWide = formWide ? formWide.tickets.filter(t => {
    const sortedT = [...t].sort((a,b)=>a-b);
    return resWideMatches.some(match => match[0] === sortedT[0] && match[1] === sortedT[1]);
  }) : [];

  const resTrio = [r1, r2, r3].filter(Boolean).sort((a,b)=>a-b);
  const hitTrio = formTrio && resTrio.length === 3 ? formTrio.tickets.filter(t => [...t].sort((a,b)=>a-b).every((n,i)=>n===resTrio[i])) : [];

  const resTrifecta = [r1, r2, r3].filter(Boolean);
  const hitTrifecta = formTrifecta && resTrifecta.length === 3 ? formTrifecta.tickets.filter(t => t.every((n,i)=>n===resTrifecta[i])) : [];

  const resQuinella = [r1, r2].filter(Boolean).sort((a,b)=>a-b);
  const hitQuinella = formQuinella && resQuinella.length === 2 ? formQuinella.tickets.filter(t => [...t].sort((a,b)=>a-b).every((n,i)=>n===resQuinella[i])) : [];

  const resExacta = [r1, r2].filter(Boolean);
  const hitExacta = formExacta && resExacta.length === 2 ? formExacta.tickets.filter(t => t.every((n,i)=>n===resExacta[i])) : [];

  const hits = {
    win: hitWin.length > 0,
    wide: hitWide.length > 0,
    trio: hitTrio.length > 0,
    trifecta: hitTrifecta.length > 0,
    quinella: hitQuinella.length > 0,
    exacta: hitExacta.length > 0,
  };

  const hitTicketsMap = {
    win: hitWin,
    wide: hitWide,
    trio: hitTrio,
    trifecta: hitTrifecta,
    quinella: hitQuinella,
    exacta: hitExacta,
  };

  const hitTickets = hitTrio; // 後方互換用

  const handleSubmit = () => {
    if (results[0]?.horseNumber === 0) { alert("1着馬番を入力してください"); return; }
    onSubmit({
      raceId: race.id,
      result: results.filter(r => r.horseNumber > 0),
      lapTimes: lapTimes.length > 0 ? lapTimes : undefined,
      last4fTime: last4fTime || undefined,
      last3fTime: last3fTime || undefined,
      cornerPassings: cornerPassings.length > 0 ? cornerPassings : undefined,
      refunds: refunds || undefined,
      winnerProfile: winnerProfile || undefined,
      incidents: incidents || undefined,
      hitTickets,
      hits,
      hitTicketsMap,
      profit,
      learningApplied: false,
    });
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">✅ 結果入力</h2>
        <div className="flex gap-8">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>キャンセル</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>💾 確定・自学習開始</button>
        </div>
      </div>

      <div className="fs-sm text-muted mb-12">
        {race.venue} {race.raceNumber}R {race.raceName} / {race.surface} {race.distance}m
      </div>

      {existing && (
        <div className="mb-16">
          <MobileRaceResult result={existing} horses={race.horses} />
        </div>
      )}

      {/* 📋 テキスト貼り付け・解析エリア */}
      <div className="card fade-in">
        <div className="card-header">
          <div className="card-title">📋 レース結果テキスト貼り付け</div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="result-paste">結果テキスト</label>
          <textarea
            id="result-paste"
            className="form-textarea min-h-180 mono fs-sm"
            value={pasteText}
            onChange={e => { setPasteText(e.target.value); setParseError(""); }}
            placeholder={`例:\n1着 3番 クラウンヴィラン 1:14.2\n2着 8番 バイアーナ 1:14.5\n3着 12番 シナモンデイジー 1:14.8\n\n（JRA・地方競馬の結果テキストをそのまま貼付けもOK）`}
            maxLength={5000}
          />
          <div className="fs-xs text-muted mt-4 text-right">
            {pasteText.length} / 5000文字
          </div>
        </div>

        {parseError && (
          <div className="alert alert-warning">
            ⚠️ {parseError}
          </div>
        )}

        <div className="flex gap-8">
          <button
            type="button"
            className="btn btn-primary"
            onClick={parsePasteText}
            disabled={!pasteText.trim()}
            style={{ opacity: pasteText.trim() ? 1 : 0.5 }}
          >
            🔍 テキストを解析
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setPasteText("")}>
            クリア
          </button>
        </div>

      </div>

      {/* ✏️ 手動入力・詳細エリア */}
      <div className="card fade-in mt-16">
        <div className="card-header">
          <div className="card-title">✏️ 着順・詳細入力</div>
        </div>
        <table className="horse-table">
            <thead>
              <tr>
                <th>着順</th><th>馬番</th><th>馬名</th>
                <th>通過順</th><th>走破タイム</th><th>単勝オッズ</th><th>賞金(万円)</th><th></th>
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
                      className="form-select w-90"
                      value={r.horseNumber}
                      aria-label={`${r.rank}着 馬番選択`}
                      onChange={e => updateResult(i, "horseNumber", +e.target.value)}
                    >
                      <option value={0}>—</option>
                      {race.horses.map(h => (
                        <option key={h.id} value={h.number}>{h.number}番</option>
                      ))}
                      {r.horseNumber > 0 && !race.horses.some(h => h.number === r.horseNumber) && (
                        <option value={r.horseNumber}>{r.horseNumber}番 (未登録)</option>
                      )}
                    </select>
                  </td>
                  <td className={r.horseName ? "fw-600" : ""}>
                    {r.horseName || (r.horseNumber ? race.horses.find(h => h.number === r.horseNumber)?.name || "—" : "—")}
                    {r.belonging && (
                      <span className="fs-xs text-muted block">({r.belonging})</span>
                    )}
                  </td>
                  <td>
                    <input className="form-input w-80 mono" value={r.passing || ""}
                      onChange={e => updateResult(i, "passing", e.target.value)} placeholder="2-2-1" aria-label={`${r.rank}着 通過順`} />
                  </td>
                  <td>
                    <input className="form-input w-100" value={r.time}
                      onChange={e => updateResult(i, "time", e.target.value)} placeholder="1:14.2" aria-label={`${r.rank}着 タイム`} />
                  </td>
                  <td>
                    <input type="number" className="form-input w-80" step={0.1}
                      value={r.odds || ""} onChange={e => updateResult(i, "odds", +e.target.value)} placeholder="倍" aria-label={`${r.rank}着 オッズ`} />
                  </td>
                  <td>
                    <input type="number" className="form-input w-100"
                      value={r.prize || ""} onChange={e => updateResult(i, "prize", +e.target.value)} placeholder="万円" aria-label={`${r.rank}着 賞金`} />
                  </td>
                  <td>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRow(i)} aria-label={`${r.rank}着 削除`}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn btn-secondary btn-sm mt-8" onClick={addRow}>
            ＋ 着順追加
          </button>
        </div>

      {/* 📊 レース分析・詳細情報プレビュー */}
      {(lapTimes.length > 0 || last3fTime || cornerPassings.length > 0 || incidents || winnerProfile) && (
        <div className="card fade-in mt-16">
          <div className="card-header">
            <div className="card-title">📊 解析されたレース分析・詳細情報</div>
          </div>
          <div className="p-16 flex flex-col gap-16">
            
            {/* ラップタイム & 上がり */}
            {lapTimes.length > 0 && (
              <div className="border-b pb-12">
                <div className="fw-600 fs-sm mb-6 text-gold">⏱️ ハロンタイム（ラップ）</div>
                <div className="flex gap-6 items-center flex-wrap">
                  {lapTimes.map((lap, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      {idx > 0 && <span className="text-muted">→</span>}
                      <span className="bg-surface border p-4-8 rounded-4 fs-xs mono fw-600">
                        {lap}
                      </span>
                    </div>
                  ))}
                </div>
                {(last4fTime || last3fTime) && (
                  <div className="flex gap-12 mt-8 fs-xs text-muted">
                    {last4fTime && <span>上がり4F: <strong className="text-secondary">{last4fTime}秒</strong></span>}
                    {last3fTime && <span>上がり3F: <strong className="text-green">{last3fTime}秒</strong></span>}
                  </div>
                )}
              </div>
            )}

            {/* コーナー通過順位 */}
            {cornerPassings.length > 0 && (
              <div className="border-b pb-12">
                <div className="fw-600 fs-sm mb-6 text-gold">🔄 コーナー通過順位</div>
                <div className="flex flex-col gap-4 text-sm mono">
                  {cornerPassings.map((cp, idx) => (
                    <div key={idx} className="bg-surface p-6-10 rounded-4 border-l-4 border-gold">
                      {cp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 勝馬紹介 */}
            {winnerProfile && (
              <div className="border-b pb-12">
                <div className="fw-600 fs-sm mb-6 text-gold">🏆 勝ち馬プロフィール</div>
                <div className="bg-surface p-12 rounded-8 border grid-2 gap-12 text-sm">
                  <div><strong>馬名:</strong> {winnerProfile.horseName} ({winnerProfile.birthDate})</div>
                  <div><strong>父:</strong> {winnerProfile.sire || "—"}</div>
                  <div><strong>母:</strong> {winnerProfile.dam || "—"}</div>
                  <div><strong>馬主:</strong> {winnerProfile.owner || "—"}</div>
                  <div><strong>生産者:</strong> {winnerProfile.breeder || "—"}</div>
                </div>
              </div>
            )}

            {/* 競走中の出来事等 */}
            {incidents && (
              <div className="bg-purple-muted p-12 rounded-8 border border-purple-40 text-sm">
                <div className="fw-600 fs-sm mb-6 text-purple-light flex items-center gap-4">
                  ⚠️ 競走中の出来事（審議・タイムオーバー等）
                </div>
                <div className="text-secondary mono fs-xs leading-relaxed">
                  {incidents}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 的中確認 */}
      {predictions.length > 0 && r1 > 0 && r2 > 0 && (
        <div className="card mt-16">
          <div className="card-header">
            <div className="card-title">🎯 券種別的中判定 & 払戻金自動計算</div>
          </div>
          <div className="p-16 flex flex-col gap-12">
            <div className="grid-2 gap-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {[
                { label: "単勝", isHit: hits.win, comb: resWin.join("-"), tickets: hitWin },
                { label: "ワイド", isHit: hits.wide, comb: resWideMatches.map(m => m.join("-")).join(" / "), tickets: hitWide },
                { label: "三連複", isHit: hits.trio, comb: resTrio.join("-"), tickets: hitTrio },
                { label: "三連単", isHit: hits.trifecta, comb: resTrifecta.join("→"), tickets: hitTrifecta },
                { label: "馬連", isHit: hits.quinella, comb: resQuinella.join("-"), tickets: hitQuinella },
                { label: "馬単", isHit: hits.exacta, comb: resExacta.join("→"), tickets: hitExacta },
              ].map(item => (
                <div key={item.label} className={`p-12 rounded-8 border ${item.isHit ? 'bg-green-muted border-green-40' : 'bg-elevated border-muted'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <strong className="fs-sm">{item.label}</strong>
                    <span className={`tag ${item.isHit ? 'tag-green' : 'tag-gray'}`}>
                      {item.isHit ? '🎉 的中' : '不的中'}
                    </span>
                  </div>
                  <div className="fs-xs text-muted mb-4">結果: {item.comb || "—"}</div>
                  {item.isHit && (
                    <div className="fs-xs text-green fw-600">
                      的中目: {item.tickets.map(t => t.join(['三連単', '馬単'].includes(item.label) ? '→' : '-')).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* シミュレータ部分 */}
            {Object.values(hits).some(Boolean) && refunds && (
              <div className="bg-gold-muted p-12 rounded-8 border border-gold-40 text-sm mt-12 flex flex-col gap-8">
                <div className="fw-600 text-gold flex items-center gap-4">💴 払戻金自動シミュレーター</div>
                <div className="flex gap-8 items-center flex-wrap">
                  <span className="text-muted">1点につき:</span>
                  <input
                    type="number"
                    className="form-input w-90"
                    step={100}
                    min={100}
                    value={betAmount}
                    aria-label="1点あたりの賭け金"
                    onChange={e => {
                      const amt = Math.max(0, +e.target.value);
                      setBetAmount(amt);
                      
                      let totalP = 0;
                      const mult = amt / 100;
                      if (hitTrio.length > 0) totalP += hitTrio.length * (refunds.trio?.[0]?.payout || 0) * mult;
                      if (hitTrifecta.length > 0) totalP += hitTrifecta.length * (refunds.trifecta?.[0]?.payout || 0) * mult;
                      if (hitQuinella.length > 0) totalP += hitQuinella.length * (refunds.quinella?.[0]?.payout || 0) * mult;
                      if (hitExacta.length > 0) totalP += hitExacta.length * (refunds.exacta?.[0]?.payout || 0) * mult;
                      
                      setProfit(totalP);
                    }}
                  />
                  <span className="fs-sm">円</span>
                  <span className="text-muted ml-8">検出配当総額:</span>
                  <strong className="text-gold">
                    {((hitTrio.length > 0 ? (refunds.trio?.[0]?.payout || 0) : 0) +
                      (hitTrifecta.length > 0 ? (refunds.trifecta?.[0]?.payout || 0) : 0) +
                      (hitQuinella.length > 0 ? (refunds.quinella?.[0]?.payout || 0) : 0) +
                      (hitExacta.length > 0 ? (refunds.exacta?.[0]?.payout || 0) : 0)).toLocaleString()}円
                  </strong>
                </div>
                <div className="fs-xs text-muted">
                  ※ 1点あたり購入額を変更すると、下の「払戻金額」に自動で掛け算して反映されます。
                </div>
              </div>
            )}
          </div>


        </div>
      )}

      {/* 予想との比較 */}
      {race.predictions && race.predictions.length > 0 && results.some(r => r.horseNumber > 0) && (
        <div className="card">
          <div className="card-header"><div className="card-title">📊 予想との比較</div></div>
          <div className="flex gap-8 flex-wrap">
            {race.predictions.slice(0, 7).map((p, i) => {
              const hitResult = results.find(r => r.horseNumber === p.horseNumber);
              const actualRank = hitResult ? hitResult.rank : null;
              const isRankHit = actualRank === (i + 1);
              
              const textColor = isRankHit ? "text-green" : "text-red";
              const statusText = isRankHit ? "的中 ✓" : "不的中 ✗";
              const cardBg = isRankHit ? "bg-green-muted" : "bg-surface";
              const cardBorder = isRankHit ? "border-green-40" : "border";
              
              return (
                <div key={p.horseId} className={`p-10-14 text-center rounded-8 ${cardBg} ${cardBorder}`} style={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px' }}>
                  <div className="fs-xs text-muted mb-4">予想{i + 1}位</div>
                  <div className={`fs-lg fw-700 ${textColor} mb-4`}>
                    {p.horseNumber}番
                  </div>
                  <div className="fs-sm mb-4">{p.horseName}</div>
                  <div className={`fs-lg fw-700 ${textColor}`}>
                    {actualRank ? `${actualRank}着` : "—"} ({statusText})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

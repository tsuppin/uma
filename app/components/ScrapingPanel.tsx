"use client";
import { useState, useCallback } from "react";
import { AppState, Race, Horse, RaceResult } from "../types";
import { generateId } from "../lib/storage";

// ==========================================
// 競馬場リスト
// ==========================================
const JRA_VENUES = ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"];
const NAR_VENUES = ["帯広", "門別", "盛岡", "水沢", "大井", "川崎", "浦和", "船橋", "金沢", "笠松", "名古屋", "園田", "姫路", "高知", "佐賀"];

// ==========================================
// ScrapingPanel
// ==========================================
interface ScrapingPanelProps {
  state: AppState;
  onAddRace: (race: Race) => void;
  onRunPrediction: (race: Race) => void;
  onAddResult: (result: RaceResult, raceId: string) => void;
}

type TabSection = "fetch" | "predict" | "result";

export default function ScrapingPanel({ state, onAddRace, onRunPrediction, onAddResult }: ScrapingPanelProps) {
  const [activeSection, setActiveSection] = useState<TabSection>("fetch");
  const pendingPrediction = state.races.filter((r) => !r.predictions || r.predictions.length === 0);
  const pendingResult = state.races.filter((r) => r.predictions && r.predictions.length > 0 && !r.result);

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">🌐 WEBスクレイピング自動化</h1>
        <div className="fs-xs text-muted">出馬表取得 → 自動予想 → 結果取得 → 学習改善</div>
      </div>

      {/* セクション切り替えタブ */}
      <div className="scraping-tabs">
        <button className={`scraping-tab ${activeSection === "fetch" ? "active" : ""}`} onClick={() => setActiveSection("fetch")}>
          <span className="scraping-tab-icon">📋</span><span>出馬表取得</span>
        </button>
        <button className={`scraping-tab ${activeSection === "predict" ? "active" : ""}`} onClick={() => setActiveSection("predict")}>
          <span className="scraping-tab-icon">🤖</span><span>一括予想</span>
          {pendingPrediction.length > 0 && <span className="badge-count">{pendingPrediction.length}</span>}
        </button>
        <button className={`scraping-tab ${activeSection === "result" ? "active" : ""}`} onClick={() => setActiveSection("result")}>
          <span className="scraping-tab-icon">📊</span><span>結果取得＆学習</span>
          {pendingResult.length > 0 && <span className="badge-count">{pendingResult.length}</span>}
        </button>
      </div>

      {activeSection === "fetch" && <FetchSection onAddRace={onAddRace} />}
      {activeSection === "predict" && <PredictSection races={pendingPrediction} onRunPrediction={onRunPrediction} />}
      {activeSection === "result" && <ResultSection races={pendingResult} onAddResult={onAddResult} />}
    </div>
  );
}

// ==========================================
// セクション① 出馬表自動取得（日付・競馬場・R番号指定）
// ==========================================
function FetchSection({ onAddRace }: { onAddRace: (race: Race) => void }) {
  const todayStr = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD

  // 自動取得フォーム
  const [date, setDate] = useState(todayStr);
  const [venue, setVenue] = useState("大井");
  const [raceNumber, setRaceNumber] = useState(11);

  // 詳細設定（URL/HTML手動入力）
  const [showManual, setShowManual] = useState(false);
  const [manualMode, setManualMode] = useState<"url" | "html">("url");
  const [manualUrl, setManualUrl] = useState("");
  const [manualHtml, setManualHtml] = useState("");

  // 状態
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolvedUrl, setResolvedUrl] = useState("");
  const [scraped, setScraped] = useState<ScrapedData | null>(null);

  // レース情報編集
  const [editDate, setEditDate] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editRaceNumber, setEditRaceNumber] = useState(1);
  const [editRaceName, setEditRaceName] = useState("");
  const [editDistance, setEditDistance] = useState(0);
  const [editSurface, setEditSurface] = useState<Race["surface"]>("ダート");
  const [editCondition, setEditCondition] = useState<Race["condition"]>("良");

  const handleFetch = useCallback(async () => {
    setError("");
    setResolvedUrl("");
    setScraped(null);
    setIsLoading(true);

    try {
      // リクエストボディ作成
      let body: Record<string, unknown>;
      if (showManual) {
        body = manualMode === "url" ? { url: manualUrl } : { html: manualHtml };
      } else {
        body = { date, venue, raceNumber };
      }

      const res = await fetch("/api/scrape/race-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      // エラーだが resolvedUrl がある場合（フェッチ失敗・手動確認用）
      if (data.resolvedUrl) setResolvedUrl(data.resolvedUrl);

      if (!data.success) {
        setError(data.error || "取得に失敗しました");
        return;
      }

      setScraped(data);

      // フォームを自動入力
      const info = data.raceInfo;
      setEditDate(info.date || date);
      setEditVenue(info.venue || venue);
      setEditRaceNumber(info.raceNumber || raceNumber);
      setEditRaceName(info.raceName || "");
      setEditDistance(info.distance || 0);
      setEditSurface(info.surface || "ダート");
      setEditCondition(info.condition || "良");
    } catch (e) {
      setError(`通信エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  }, [showManual, manualMode, manualUrl, manualHtml, date, venue, raceNumber]);

  const handleRegister = () => {
    if (!scraped?.horses?.length) { alert("出走馬が取得されていません"); return; }
    if (!editVenue) { alert("競馬場を入力してください"); return; }
    if (!editDistance) { alert("距離を入力してください"); return; }

    const horses: Horse[] = scraped.horses.map((h: ScrapedHorse, idx: number) => ({
      id: generateId(),
      number: h.number || idx + 1,
      frame: h.frame || Math.ceil((h.number || idx + 1) / 2),
      name: h.name,
      age: h.age || 4,
      gender: (h.gender as Horse["gender"]) || "牡",
      coatColor: h.coatColor,
      weight: h.weight || 480,
      weightChange: h.weightChange || 0,
      jockey: h.jockey || "",
      jockeyWeight: h.jockeyWeight || 55,
      trainer: h.trainer || "",
      owner: h.owner || "",
      sire: h.sire || "",
      dam: h.dam || "",
      bms: h.bms || "",
      bloodline: h.sire || "",
      style: "",
      odds: h.odds || 0,
      popularity: h.popularity || 0,
      pastRaces: [],
    }));

    const race: Race = {
      id: generateId(),
      date: editDate,
      venue: editVenue,
      raceNumber: editRaceNumber,
      raceName: editRaceName || `${editRaceNumber}R`,
      distance: editDistance,
      surface: editSurface,
      condition: editCondition,
      headCount: horses.length,
      trackName: editVenue,
      horses,
    };

    onAddRace(race);
    setScraped(null);
    setResolvedUrl("");
    alert(`✅ ${editVenue} ${editRaceNumber}R（${horses.length}頭）を登録しました`);
  };

  const isAutoReady = !showManual;
  const isManualReady = showManual && (manualMode === "url" ? manualUrl.trim() : manualHtml.trim());
  const canFetch = isAutoReady || isManualReady;

  return (
    <div className="fade-in">
      {/* ── メインフォーム ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 出馬表の自動取得</div>
        </div>

        {/* 自動取得フォーム（デフォルト表示） */}
        {!showManual && (
          <div className="auto-fetch-form fade-in">
            <div className="auto-fetch-row">
              {/* 開催日 */}
              <div className="form-group auto-fetch-field">
                <label className="form-label" htmlFor="af-date">
                  📅 開催日
                </label>
                <input
                  id="af-date"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* 競馬場 */}
              <div className="form-group auto-fetch-field">
                <label className="form-label" htmlFor="af-venue">
                  🏟️ 競馬場
                </label>
                <select
                  id="af-venue"
                  className="form-select"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                >
                  <optgroup label="── JRA ──">
                    {JRA_VENUES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </optgroup>
                  <optgroup label="── 地方競馬 ──">
                    {NAR_VENUES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </optgroup>
                </select>
              </div>

              {/* レース番号 */}
              <div className="form-group auto-fetch-field-sm">
                <label className="form-label" htmlFor="af-rnum">
                  🔢 R番号
                </label>
                <select
                  id="af-rnum"
                  className="form-select"
                  value={raceNumber}
                  onChange={(e) => setRaceNumber(+e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}R</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="auto-fetch-hint">
              <span className="fetch-target-badge">
                {venue} {raceNumber}R（{date}）
              </span>
              <span className="fs-xs text-muted ml-8">
                {JRA_VENUES.includes(venue) ? "JRA → netkeiba.com から取得" : "地方 → keiba.go.jp から取得"}
              </span>
            </div>
          </div>
        )}

        {/* 詳細設定（URL/HTML手動） */}
        {showManual && (
          <div className="fade-in mb-16">
            <div className="flex gap-8 mb-12">
              <button className={`btn btn-sm ${manualMode === "url" ? "btn-primary" : "btn-secondary"}`} onClick={() => setManualMode("url")}>🔗 URL指定</button>
              <button className={`btn btn-sm ${manualMode === "html" ? "btn-primary" : "btn-secondary"}`} onClick={() => setManualMode("html")}>📄 HTML貼り付け</button>
            </div>
            {manualMode === "url" && (
              <div className="form-group">
                <label className="form-label" htmlFor="manual-url">出馬表URL</label>
                <input id="manual-url" className="form-input" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="例: https://race.netkeiba.com/race/shutuba.html?race_id=..." />
                <div className="fs-xs text-muted mt-4">対応: netkeiba.com / ODDS PARK / KEIBA.GO.JP</div>
              </div>
            )}
            {manualMode === "html" && (
              <div className="form-group">
                <label className="form-label" htmlFor="manual-html">HTMLを貼り付け（CORS回避）</label>
                <textarea id="manual-html" className="form-textarea min-h-200 mono fs-sm" value={manualHtml}
                  onChange={(e) => setManualHtml(e.target.value)}
                  placeholder="ブラウザの出馬表ページを Ctrl+A → コピー → 貼り付け" />
                <div className="fs-xs text-muted mt-4 text-right">{manualHtml.length.toLocaleString()} 文字</div>
              </div>
            )}
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="alert alert-warning">
            <div>⚠️ {error}</div>
            {resolvedUrl && (
              <div className="mt-8">
                <div className="fs-xs text-muted mb-4">以下のURLを手動で開いてHTMLを貼り付けてください：</div>
                <a href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="resolved-url-link">{resolvedUrl}</a>
                <button className="btn btn-sm btn-secondary ml-8" onClick={() => { navigator.clipboard?.writeText(resolvedUrl); }}>📋 コピー</button>
                <button className="btn btn-sm btn-secondary ml-4" onClick={() => { setShowManual(true); setManualMode("html"); setError(""); }}>
                  → HTMLを貼り付けへ
                </button>
              </div>
            )}
          </div>
        )}

        {/* ボタン行 */}
        <div className="fetch-btn-row">
          <button
            className="btn btn-primary p-10-28 fs-md"
            onClick={handleFetch}
            disabled={isLoading || !canFetch}
          >
            {isLoading ? "⌛ 取得中..." : "🔍 出馬表を取得"}
          </button>
          <button
            className="btn btn-secondary fs-sm"
            onClick={() => { setShowManual(!showManual); setError(""); setResolvedUrl(""); }}
          >
            {showManual ? "✕ 詳細設定を閉じる" : "⚙️ 詳細設定（URL/HTML）"}
          </button>
        </div>
      </div>

      {/* ── 解析結果プレビュー ── */}
      {scraped && (
        <div className="card fade-in">
          <div className="card-header">
            <div className="card-title">
              ✅ 解析完了（{scraped.horses?.length || 0}頭）
              {resolvedUrl && <span className="fs-xs text-muted ml-8">from {new URL(resolvedUrl).hostname}</span>}
            </div>
          </div>

          {/* レース情報確認・修正 */}
          <div className="grid-4 gap-12 mb-16">
            <div className="form-group">
              <label className="form-label" htmlFor="s-date">開催日</label>
              <input id="s-date" type="date" className="form-input" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-venue">競馬場 *</label>
              <input id="s-venue" className="form-input" value={editVenue} onChange={(e) => setEditVenue(e.target.value)} placeholder="大井、東京..." />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-rnum">R番号</label>
              <input id="s-rnum" type="number" className="form-input" min={1} max={12} value={editRaceNumber} onChange={(e) => setEditRaceNumber(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-rname">レース名</label>
              <input id="s-rname" className="form-input" value={editRaceName} onChange={(e) => setEditRaceName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-dist">距離 (m) *</label>
              <input id="s-dist" type="number" className="form-input" value={editDistance} onChange={(e) => setEditDistance(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-surf">馬場種別</label>
              <select id="s-surf" className="form-select" value={editSurface} onChange={(e) => setEditSurface(e.target.value as Race["surface"])}>
                <option>ダート</option><option>芝</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-cond">馬場状態</label>
              <select id="s-cond" className="form-select" value={editCondition} onChange={(e) => setEditCondition(e.target.value as Race["condition"])}>
                <option>良</option><option>稍重</option><option>重</option><option>不良</option>
              </select>
            </div>
          </div>

          {/* 出走馬テーブル */}
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="取得出走馬一覧">
            <table className="horse-table">
              <thead>
                <tr><th>枠</th><th>馬番</th><th>馬名</th><th>騎手</th><th>斤量</th><th>体重</th><th>父</th><th>オッズ</th></tr>
              </thead>
              <tbody>
                {(scraped.horses || []).map((h: ScrapedHorse) => (
                  <tr key={h.number}>
                    <td><span className={`frame-badge frame-${h.frame}`}>{h.frame}</span></td>
                    <td className="fw-700 text-gold">{h.number}</td>
                    <td>{h.name}</td>
                    <td className="fs-sm text-secondary">{h.jockey || "—"}</td>
                    <td className="fs-sm">{h.jockeyWeight || "—"}</td>
                    <td className="fs-sm">{h.weight ? `${h.weight}kg` : "—"}</td>
                    <td className="fs-xs text-muted">{h.sire || "—"}</td>
                    <td className="fs-sm">{h.odds ? `${h.odds}倍` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {scraped.horses?.length === 0 && (
            <div className="alert alert-warning mt-8">
              ⚠️ 出走馬を解析できませんでした。HTMLを手動で貼り付けるか、距離・競馬場を手動で確認してください。
            </div>
          )}

          <div className="alert alert-warning mt-12 fs-sm">
            ⚠️ スクレイピングデータは不完全な場合があります。登録後に予想画面で詳細を修正してください。
          </div>

          <div className="flex gap-8 justify-end mt-12">
            <button className="btn btn-secondary" onClick={() => setScraped(null)}>← 取り直す</button>
            <button className="btn btn-primary p-10-28 fs-md" onClick={handleRegister} disabled={!scraped.horses?.length}>
              💾 このレースを登録して予想へ
            </button>
          </div>
        </div>
      )}

      {/* ── 使い方ガイド ── */}
      {!scraped && !isLoading && (
        <div className="card" style={{ opacity: 0.8 }}>
          <div className="card-header">
            <div className="card-title">💡 使い方</div>
          </div>
          <div className="scraping-guide">
            <div className="guide-step">
              <div className="guide-num">1</div>
              <div>
                <div className="guide-title">日付・競馬場・R番号を選択</div>
                <div className="guide-desc">JRA は netkeiba.com、地方競馬は keiba.go.jp から自動で出馬表を取得します</div>
              </div>
            </div>
            <div className="guide-step">
              <div className="guide-num">2</div>
              <div>
                <div className="guide-title">「出馬表を取得」をクリック</div>
                <div className="guide-desc">サーバー経由でスクレイピングします。CORS制限はありません</div>
              </div>
            </div>
            <div className="guide-step">
              <div className="guide-num">3</div>
              <div>
                <div className="guide-title">確認して登録</div>
                <div className="guide-desc">取得内容を確認・修正し「登録して予想へ」で登録。取得できない場合は<strong>⚙️詳細設定</strong>からHTMLを貼り付け</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// セクション② 一括予想
// ==========================================
function PredictSection({ races, onRunPrediction }: { races: Race[]; onRunPrediction: (race: Race) => void }) {
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const runOne = (race: Race) => {
    setRunningIds((prev) => new Set(prev).add(race.id));
    setTimeout(() => {
      onRunPrediction(race);
      setRunningIds((prev) => { const s = new Set(prev); s.delete(race.id); return s; });
      setDoneIds((prev) => new Set(prev).add(race.id));
    }, 100);
  };

  const runAll = () => races.forEach((race, i) => setTimeout(() => runOne(race), i * 150));

  if (races.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🤖</div>
        <div className="empty-state-title">未予想レースはありません</div>
        <div className="empty-state-desc">出馬表を取得・登録すると、ここで一括予想できます</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <div className="card-title">🤖 未予想レース一覧（{races.length}件）</div>
          <button className="btn btn-primary" onClick={runAll} disabled={races.every((r) => doneIds.has(r.id))}>
            ⚡ 全て一括予想
          </button>
        </div>
        <div className="flex flex-col gap-8">
          {races.map((race) => {
            const isRunning = runningIds.has(race.id);
            const isDone = doneIds.has(race.id);
            return (
              <div key={race.id} className="predict-row">
                <div className="predict-row-info">
                  <span className="fw-700 text-gold">{race.venue} {race.raceNumber}R</span>
                  <span className="fs-sm text-secondary ml-8">{race.raceName}</span>
                  <span className="fs-xs text-muted ml-8">{race.date}</span>
                  <span className="fs-xs text-muted ml-8">{race.distance}m {race.surface} {race.condition}</span>
                  <span className="fs-xs text-muted ml-8">{race.headCount}頭</span>
                </div>
                <button
                  className={`btn btn-sm ${isDone ? "btn-secondary" : "btn-primary"}`}
                  onClick={() => runOne(race)}
                  disabled={isRunning || isDone}
                >
                  {isRunning ? "⌛ 計算中..." : isDone ? "✅ 完了" : "▶ 予想実行"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="alert alert-warning mt-12 fs-sm">
        💡 予想はローカルで即時実行されます（AIエンジン使用）。予想後は各レースの予想画面で詳細を確認できます。
      </div>
    </div>
  );
}

// ==========================================
// セクション③ 結果取得＆学習
// ==========================================
function ResultSection({ races, onAddResult }: { races: Race[]; onAddResult: (result: RaceResult, raceId: string) => void }) {
  const [activeRaceId, setActiveRaceId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"url" | "html">("url");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scraped, setScraped] = useState<ResultScrapedData | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const selectedRace = races.find((r) => r.id === activeRaceId) || null;

  const handleFetchResult = async () => {
    setError(""); setScraped(null); setIsLoading(true);
    try {
      const body = inputMode === "url" ? { url } : { html };
      const res = await fetch("/api/scrape/race-result", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "取得に失敗しました"); return; }
      setScraped(data);
    } catch (e) {
      setError(`通信エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterResult = () => {
    if (!scraped || !activeRaceId || !selectedRace) return;
    if (!scraped.results?.length) { alert("結果データが取得されていません"); return; }

    const result: RaceResult = {
      raceId: activeRaceId,
      result: scraped.results.map((r: ResultRow) => ({
        rank: r.rank, horseNumber: r.horseNumber, horseName: r.horseName,
        time: r.time || "", odds: r.odds || 0, prize: r.prize || 0,
        popularity: r.popularity, weight: r.weight, weightChange: r.weightChange,
        jockey: r.jockey, jockeyWeight: r.jockeyWeight, last3f: r.last3f, margin: r.margin,
      })),
      refunds: scraped.refunds || {},
      lapTimes: scraped.lapTimes || [],
    };

    onAddResult(result, activeRaceId);
    setDoneIds((prev) => new Set(prev).add(activeRaceId));
    setActiveRaceId(null); setScraped(null); setUrl(""); setHtml("");
    alert("✅ 結果を登録し、学習パッチを生成しました");
  };

  const autoGenerateResultUrl = (race: Race): string => {
    if (!race.date) return "";
    const d = race.date.replace(/-/g, "");
    return `https://race.netkeiba.com/race/result.html?kaisai_date=${d}`;
  };

  if (races.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <div className="empty-state-title">結果待ちレースはありません</div>
        <div className="empty-state-desc">予想済みのレースが終了したら、ここで結果を取得・登録できます</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <div className="card-title">📊 結果待ちレース（{races.length}件）</div>
        </div>
        <div className="flex flex-col gap-8">
          {races.map((race) => {
            const isDone = doneIds.has(race.id);
            return (
              <div key={race.id} className="predict-row">
                <div className="predict-row-info">
                  <span className="fw-700 text-gold">{race.venue} {race.raceNumber}R</span>
                  <span className="fs-sm text-secondary ml-8">{race.raceName}</span>
                  <span className="fs-xs text-muted ml-8">{race.date}</span>
                  <span className="fs-xs text-muted ml-8">{race.horses.length}頭</span>
                </div>
                <button
                  className={`btn btn-sm ${activeRaceId === race.id ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => { setActiveRaceId(race.id); setUrl(autoGenerateResultUrl(race)); setScraped(null); setError(""); }}
                  disabled={isDone}
                >
                  {isDone ? "✅ 登録済" : activeRaceId === race.id ? "✏️ 選択中" : "📥 結果取得"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {activeRaceId && selectedRace && !doneIds.has(activeRaceId) && (
        <div className="card fade-in mt-16">
          <div className="card-header">
            <div className="card-title">📥 {selectedRace.venue} {selectedRace.raceNumber}R の結果取得</div>
          </div>
          <div className="flex gap-8 mb-16">
            <button className={`btn ${inputMode === "url" ? "btn-primary" : "btn-secondary"}`} onClick={() => setInputMode("url")}>🔗 URL</button>
            <button className={`btn ${inputMode === "html" ? "btn-primary" : "btn-secondary"}`} onClick={() => setInputMode("html")}>📄 HTML貼り付け</button>
          </div>
          {inputMode === "url" && (
            <div className="form-group">
              <label className="form-label" htmlFor="result-url">結果ページURL</label>
              <input id="result-url" className="form-input" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="例: https://race.netkeiba.com/race/result.html?race_id=..." />
            </div>
          )}
          {inputMode === "html" && (
            <div className="form-group">
              <label className="form-label" htmlFor="result-html">結果ページHTML</label>
              <textarea id="result-html" className="form-textarea min-h-200 mono fs-sm" value={html}
                onChange={(e) => setHtml(e.target.value)} placeholder="ブラウザで結果ページを開き、HTMLをコピー貼り付け" />
            </div>
          )}
          {error && <div className="alert alert-warning">⚠️ {error}</div>}
          <div className="flex gap-8">
            <button className="btn btn-primary" onClick={handleFetchResult}
              disabled={isLoading || (inputMode === "url" ? !url.trim() : !html.trim())}>
              {isLoading ? "⌛ 取得中..." : "🔍 結果を取得"}
            </button>
            <button className="btn btn-secondary" onClick={() => { setActiveRaceId(null); setScraped(null); setError(""); }}>キャンセル</button>
          </div>

          {scraped && (
            <div className="mt-16 fade-in">
              <div className="card-title mb-8">📋 取得結果（{scraped.results?.length || 0}頭）</div>
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="取得レース結果">
                <table className="horse-table">
                  <thead><tr><th>着順</th><th>馬番</th><th>馬名</th><th>タイム</th><th>オッズ</th><th>人気</th><th>上がり3F</th></tr></thead>
                  <tbody>
                    {(scraped.results || []).slice(0, 10).map((r: ResultRow) => (
                      <tr key={r.horseNumber}>
                        <td className={`fw-700 ${r.rank <= 3 ? "text-green" : ""}`}>{r.rank}着</td>
                        <td className="text-gold">{r.horseNumber}</td>
                        <td>{r.horseName}</td>
                        <td className="fs-sm">{r.time || "—"}</td>
                        <td className="fs-sm">{r.odds ? `${r.odds}倍` : "—"}</td>
                        <td className="fs-sm">{r.popularity ? `${r.popularity}人気` : "—"}</td>
                        <td className="fs-sm">{r.last3f || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {scraped.refunds && Object.keys(scraped.refunds).length > 0 && (
                <div className="mt-12">
                  <div className="card-title mb-8 fs-sm">💰 払い戻し</div>
                  <div className="refund-grid">
                    {Object.entries(scraped.refunds).map(([type, items]) =>
                      (items as RefundEntry[]).map((item, i) => (
                        <div key={`${type}-${i}`} className="refund-item">
                          <span className="refund-type">{typeLabel(type)}</span>
                          <span className="refund-combo">{item.combination || item.horse || item.bracket}</span>
                          <span className="refund-payout text-gold fw-700">¥{item.payout?.toLocaleString()}</span>
                          <span className="refund-pop fs-xs text-muted">{item.popularity}人気</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-8 justify-end mt-12">
                <button className="btn btn-secondary" onClick={() => setScraped(null)}>← 取り直す</button>
                <button className="btn btn-primary p-10-28 fs-md" onClick={handleRegisterResult}>
                  ✅ 結果を登録して学習パッチ生成
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    win: "単勝", place: "複勝", quinella: "馬連", exacta: "馬単",
    wide: "ワイド", trio: "3連複", trifecta: "3連単", bracketQuinella: "枠連",
  };
  return map[type] || type;
}

// ── 型定義 ──────────────────────────────
interface ScrapedHorse {
  frame: number; number: number; name: string; age: number; gender: string;
  coatColor?: string; weight: number; weightChange: number; jockey: string;
  jockeyWeight: number; trainer?: string; owner?: string; sire?: string;
  dam?: string; bms?: string; odds?: number; popularity?: number;
}
interface ScrapedData {
  raceInfo: { date: string; venue: string; raceNumber: number; raceName: string; distance: number; surface: Race["surface"]; condition: Race["condition"]; headCount: number };
  horses: ScrapedHorse[];
  rawText?: string;
}
interface ResultRow {
  rank: number; horseNumber: number; horseName: string; time: string;
  odds: number; popularity: number; weight: number; weightChange: number;
  last3f?: string; jockey?: string; jockeyWeight?: number; margin?: string; prize: number;
}
interface RefundEntry { combination?: string; horse?: string; bracket?: string; payout: number; popularity: number }
interface ResultScrapedData { results: ResultRow[]; refunds: Record<string, RefundEntry[]>; lapTimes: string[] }

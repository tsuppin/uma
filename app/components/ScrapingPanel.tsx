"use client";
import { useState, useCallback, useEffect } from "react";
import {
  AppState,
  Race,
  Horse,
  RaceResult,
} from "../types";
import { generateId } from "../lib/storage";

const VENUES = [
  "札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉",
  "帯広", "門別", "盛岡", "水沢", "浦和", "船橋", "大井", "川崎", "金沢", "笠松", "名古屋", "園田", "姫路", "高知", "佐賀"
];

// ==========================================
// ScrapingPanel - WEBスクレイピング自動化タブ
// ==========================================

interface ScrapingPanelProps {
  state: AppState;
  onAddRace: (race: Race) => void;
  onRunPrediction: (race: Race) => void;
  onAddResult: (result: RaceResult, raceId: string) => void;
}

type TabSection = "fetch" | "predict" | "result";

export default function ScrapingPanel({
  state,
  onAddRace,
  onRunPrediction,
  onAddResult,
}: ScrapingPanelProps) {
  const [activeSection, setActiveSection] = useState<TabSection>("fetch");

  const pendingPrediction = state.races.filter((r) => !r.predictions || r.predictions.length === 0);
  const pendingResult = state.races.filter((r) => r.predictions && r.predictions.length > 0 && !r.result);

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">🌐 WEBスクレイピング自動化</h1>
        <div className="fs-xs text-muted">
          出馬表取得 → 自動予想 → 結果取得 → 学習改善
        </div>
      </div>

      {/* セクション切り替えタブ */}
      <div className="scraping-tabs">
        <button
          className={`scraping-tab ${activeSection === "fetch" ? "active" : ""}`}
          onClick={() => setActiveSection("fetch")}
        >
          <span className="scraping-tab-icon">📋</span>
          <span>出馬表取得</span>
        </button>
        <button
          className={`scraping-tab ${activeSection === "predict" ? "active" : ""}`}
          onClick={() => setActiveSection("predict")}
        >
          <span className="scraping-tab-icon">🤖</span>
          <span>一括予想</span>
          {pendingPrediction.length > 0 && (
            <span className="badge-count">{pendingPrediction.length}</span>
          )}
        </button>
        <button
          className={`scraping-tab ${activeSection === "result" ? "active" : ""}`}
          onClick={() => setActiveSection("result")}
        >
          <span className="scraping-tab-icon">📊</span>
          <span>結果取得＆学習</span>
          {pendingResult.length > 0 && (
            <span className="badge-count">{pendingResult.length}</span>
          )}
        </button>
      </div>

      {activeSection === "fetch" && (
        <FetchSection onAddRace={onAddRace} />
      )}
      {activeSection === "predict" && (
        <PredictSection
          races={pendingPrediction}
          onRunPrediction={onRunPrediction}
        />
      )}
      {activeSection === "result" && (
        <ResultSection
          races={pendingResult}
          onAddResult={onAddResult}
        />
      )}
    </div>
  );
}

// ==========================================
// セクション① 出馬表自動取得
// ==========================================
function FetchSection({ onAddRace }: { onAddRace: (race: Race) => void }) {
  const [inputMode, setInputMode] = useState<"auto" | "url" | "html">("auto");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [autoDate, setAutoDate] = useState(new Date().toISOString().slice(0, 10));
  const [autoVenue, setAutoVenue] = useState("");
  const [autoRaceNumber, setAutoRaceNumber] = useState<number | "">("");
  const [availableVenues, setAvailableVenues] = useState<string[]>(VENUES);
  const [isFetchingVenues, setIsFetchingVenues] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scraped, setScraped] = useState<ScrapedData | null>(null);

  // レース情報の修正用state
  const [editDate, setEditDate] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editRaceNumber, setEditRaceNumber] = useState(1);
  const [editRaceName, setEditRaceName] = useState("");
  const [editDistance, setEditDistance] = useState(0);
  const [editSurface, setEditSurface] = useState<Race["surface"]>("ダート");
  const [editCondition, setEditCondition] = useState<Race["condition"]>("良");

  // 日付変更時に開催している競馬場を取得
  useEffect(() => {
    let isMounted = true;
    const fetchVenues = async () => {
      if (!autoDate) return;
      setIsFetchingVenues(true);
      try {
        const res = await fetch(`/api/scrape/venues?date=${autoDate}`);
        const data = await res.json();
        if (isMounted && data.success && data.venues) {
          if (data.venues.length > 0) {
            setAvailableVenues(data.venues);
            // 現在の選択値がリストにない場合は先頭の競馬場を選択する。初期表示時（prevが空）は空のまま維持
            setAutoVenue((prev) => prev === "" ? "" : (data.venues.includes(prev) ? prev : data.venues[0]));
          } else {
            setAvailableVenues(VENUES); // 取得できなければ全件表示
          }
        }
      } catch (e) {
        if (isMounted) setAvailableVenues(VENUES);
      } finally {
        if (isMounted) setIsFetchingVenues(false);
      }
    };
    fetchVenues();
    return () => { isMounted = false; };
  }, [autoDate]);

  const handleFetch = useCallback(async () => {
    setError("");
    setScraped(null);
    setIsLoading(true);
    try {
      const body = inputMode === "auto" 
        ? { auto: { date: autoDate, venue: autoVenue, raceNumber: autoRaceNumber } }
        : inputMode === "url" 
          ? { url } 
          : { html };
      const res = await fetch("/api/scrape/race-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "取得に失敗しました");
        return;
      }
      setScraped(data);

      // 自動入力
      const info = data.raceInfo;
      setEditDate(info.date || new Date().toISOString().slice(0, 10));
      setEditVenue(info.venue || "");
      setEditRaceNumber(info.raceNumber || 1);
      setEditRaceName(info.raceName || "");
      setEditDistance(info.distance || 0);
      setEditSurface(info.surface || "ダート");
      setEditCondition(info.condition || "良");
    } catch (e) {
      setError(`通信エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputMode, url, html]);

  const handleRegister = () => {
    if (!scraped || !scraped.horses || scraped.horses.length === 0) {
      alert("出走馬が取得されていません");
      return;
    }
    if (!editVenue) {
      alert("競馬場を入力してください");
      return;
    }
    if (!editDistance) {
      alert("距離を入力してください");
      return;
    }

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
      sourceUrl: scraped.raceInfo?.sourceUrl || url,
    };

    if (scraped.raceResult) {
      race.result = {
        ...scraped.raceResult,
        raceId: race.id,
      };
    }

    onAddRace(race);
    setScraped(null);
    setUrl("");
    setHtml("");
    const alertMsg = scraped.raceResult
      ? `✅ ${editVenue} ${editRaceNumber}R（${horses.length}頭・結果情報も同時取得）を登録しました`
      : `✅ ${editVenue} ${editRaceNumber}R（${horses.length}頭）を登録しました`;
    alert(alertMsg);
  };

  return (
    <div className="fade-in">
      {/* 入力モード切替 */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 出馬表の取得方法を選択</div>
        </div>

        <div className="flex gap-8 mb-16">
          <button
            className={`btn ${inputMode === "auto" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setInputMode("auto")}
          >
            ✨ 自動取得
          </button>
          <button
            className={`btn ${inputMode === "url" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setInputMode("url")}
          >
            🔗 URLで取得
          </button>
          <button
            className={`btn ${inputMode === "html" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setInputMode("html")}
          >
            📄 HTMLを貼り付け
          </button>
        </div>

        {inputMode === "auto" && (
          <div className="grid-3 gap-12 mb-16">
            <div className="form-group">
              <label className="form-label" htmlFor="auto-date">開催日</label>
              <input id="auto-date" type="date" className="form-input" value={autoDate} onChange={(e) => setAutoDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="auto-venue">
                競馬場 {isFetchingVenues && <span className="fs-xs text-muted">(取得中...)</span>}
              </label>
              <select id="auto-venue" className="form-input" value={autoVenue} onChange={(e) => setAutoVenue(e.target.value)} disabled={isFetchingVenues}>
                <option value="">選択してください</option>
                {availableVenues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="auto-race-number">レース番号</label>
              <input id="auto-race-number" type="number" min={1} max={12} className="form-input" value={autoRaceNumber} onChange={(e) => setAutoRaceNumber(e.target.value === "" ? "" : parseInt(e.target.value) || 1)} />
            </div>
            <div className="fs-xs text-muted mt-4 grid-col-3" style={{ gridColumn: "span 3" }}>
              ※JRAおよび地方競馬に対応。日付・競馬場に合致するレースをnetkeibaから自動検索します。
            </div>
          </div>
        )}

        {inputMode === "url" && (
          <div className="form-group">
            <label className="form-label" htmlFor="scrape-url">
              出馬表のURL
            </label>
            <input
              id="scrape-url"
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="例: https://race.netkeiba.com/race/shutuba.html?race_id=202502050611"
            />
            <div className="fs-xs text-muted mt-4">
              対応: netkeiba.com / ODDS PARK / KEIBA.GO.JP (地方競馬)
            </div>
          </div>
        )}

        {inputMode === "html" && (
          <div className="form-group">
            <label className="form-label" htmlFor="scrape-html">
              HTMLを貼り付け（CORS回避用）
            </label>
            <textarea
              id="scrape-html"
              className="form-textarea min-h-200 mono fs-sm"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="ブラウザのデベロッパーツール → Elements → 右クリック → Copy → Copy outerHTML で取得したHTMLを貼り付け"
            />
            <div className="fs-xs text-muted mt-4 text-right">{html.length.toLocaleString()} 文字</div>
          </div>
        )}

        {error && <div className="alert alert-warning">⚠️ {error}</div>}

        <div className="flex gap-8">
          <button
            className="btn btn-primary p-10-28 fs-md"
            onClick={handleFetch}
            disabled={isLoading || (inputMode === "url" ? !url.trim() : inputMode === "html" ? !html.trim() : (!autoDate || !autoVenue || !autoRaceNumber))}
          >
            {isLoading ? "⌛ 取得中..." : "🔍 取得・解析"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { setUrl(""); setHtml(""); setScraped(null); setError(""); }}
          >
            クリア
          </button>
        </div>
      </div>

      {/* 解析結果プレビュー */}
      {scraped && (
        <div className="card fade-in mt-16">
          <div className="card-header flex justify-between items-center">
            <div className="card-title">✅ 解析結果（{scraped.horses?.length || 0}頭）</div>
            {scraped.raceResult && (
              <span className="badge-count" style={{ backgroundColor: "#28a745", color: "#fff", fontSize: "0.8rem", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                📊 レース結果も同時に取得しました（1着: {scraped.raceResult.result?.[0]?.horseName || "不明"}）
              </span>
            )}
          </div>

          {/* レース情報編集 */}
          <div className="grid-4 gap-12 mb-16">
            <div className="form-group">
              <label className="form-label" htmlFor="s-date">開催日</label>
              <input id="s-date" type="date" className="form-input" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-venue">競馬場 *</label>
              <select id="s-venue" className="form-input" value={editVenue} onChange={(e) => setEditVenue(e.target.value)}>
                <option value="">選択してください</option>
                {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
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
                <option>ダート</option>
                <option>芝</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-cond">馬場状態</label>
              <select id="s-cond" className="form-select" value={editCondition} onChange={(e) => setEditCondition(e.target.value as Race["condition"])}>
                <option>良</option>
                <option>稍重</option>
                <option>重</option>
                <option>不良</option>
              </select>
            </div>
          </div>

          {/* 出走馬プレビュー */}
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="取得出走馬一覧">
            <table className="horse-table">
              <thead>
                <tr>
                  <th>枠</th>
                  <th>馬番</th>
                  <th>馬名</th>
                  <th>騎手</th>
                  <th>斤量</th>
                  <th>体重</th>
                  <th>父</th>
                  <th>オッズ</th>
                </tr>
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

          <div className="alert alert-warning mt-12 fs-sm">
            ⚠️ 取得データは不完全な場合があります。登録後に予想画面で詳細を確認・修正してください。
          </div>

          <div className="flex gap-8 justify-end mt-12">
            <button className="btn btn-secondary" onClick={() => setScraped(null)}>← 取り直す</button>
            <button className="btn btn-primary p-10-28 fs-md" onClick={handleRegister}>
              💾 このレースを登録
            </button>
          </div>
        </div>
      )}

      {/* 使い方ガイド */}
      {!scraped && (
        <div className="card mt-16" style={{ opacity: 0.85 }}>
          <div className="card-header">
            <div className="card-title">💡 使い方ガイド</div>
          </div>
          <div className="scraping-guide">
            <div className="guide-step">
              <div className="guide-num">1</div>
              <div>
                <div className="guide-title">URL直接取得（推奨）</div>
                <div className="guide-desc">
                  netkeibaの出馬表URL（例: <code>https://race.netkeiba.com/race/shutuba.html?race_id=...</code>）を入力して取得
                </div>
              </div>
            </div>
            <div className="guide-step">
              <div className="guide-num">2</div>
              <div>
                <div className="guide-title">HTML貼り付け（CORS回避）</div>
                <div className="guide-desc">
                  ブラウザで出馬表を開き、<code>Ctrl+A</code>でHTMLをコピー → 貼り付けて解析
                </div>
              </div>
            </div>
            <div className="guide-step">
              <div className="guide-num">3</div>
              <div>
                <div className="guide-title">確認・修正して登録</div>
                <div className="guide-desc">
                  解析結果を確認し、必要に応じてレース情報を修正して登録
                </div>
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
function PredictSection({
  races,
  onRunPrediction,
}: {
  races: Race[];
  onRunPrediction: (race: Race) => void;
}) {
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

  const runAll = () => {
    races.forEach((race, i) => {
      setTimeout(() => runOne(race), i * 150);
    });
  };

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
          <button className="btn btn-primary" onClick={runAll} disabled={races.every(r => doneIds.has(r.id))}>
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
function ResultSection({
  races,
  onAddResult,
}: {
  races: Race[];
  onAddResult: (result: RaceResult, raceId: string) => void;
}) {
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
    setError("");
    setScraped(null);
    setIsLoading(true);
    try {
      const body = inputMode === "url" ? { url } : { html };
      const res = await fetch("/api/scrape/race-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "取得に失敗しました");
        return;
      }
      setScraped(data);
    } catch (e) {
      setError(`通信エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterResult = () => {
    if (!scraped || !activeRaceId || !selectedRace) return;
    if (!scraped.results || scraped.results.length === 0) {
      alert("結果データが取得されていません");
      return;
    }

    // 着順データを RaceResult 形式に変換
    const result: RaceResult = {
      raceId: activeRaceId,
      result: scraped.results.map((r: ResultRow) => ({
        rank: r.rank,
        horseNumber: r.horseNumber,
        horseName: r.horseName,
        time: r.time || "",
        odds: r.odds || 0,
        prize: r.prize || 0,
        popularity: r.popularity,
        weight: r.weight,
        weightChange: r.weightChange,
        jockey: r.jockey,
        jockeyWeight: r.jockeyWeight,
        last3f: r.last3f,
        margin: r.margin,
      })),
      refunds: scraped.refunds || {},
      lapTimes: scraped.lapTimes || [],
    };

    onAddResult(result, activeRaceId);
    setDoneIds((prev) => new Set(prev).add(activeRaceId));
    setActiveRaceId(null);
    setScraped(null);
    setUrl("");
    setHtml("");
    alert("✅ 結果を登録し、学習パッチを生成しました");
  };

  const autoGenerateResultUrl = (race: Race): string => {
    if (race.sourceUrl) {
      if (race.sourceUrl.includes("shutuba.html")) {
        return race.sourceUrl.replace("shutuba.html", "result.html");
      }
      return race.sourceUrl;
    }
    // race_id がURLに含まれていれば結果URLを推定（netkeiba形式）
    if (!race.date) return "";
    const d = race.date.replace(/-/g, "");
    return `https://race.netkeiba.com/race/result.html?race_id=${d}`;
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
      {/* レース選択 */}
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
                  className={`btn btn-sm ${activeRaceId === race.id ? "btn-primary" : isDone ? "btn-secondary" : "btn-secondary"}`}
                  onClick={() => {
                    setActiveRaceId(race.id);
                    setUrl(autoGenerateResultUrl(race));
                    setScraped(null);
                    setError("");
                  }}
                  disabled={isDone}
                >
                  {isDone ? "✅ 登録済" : activeRaceId === race.id ? "✏️ 選択中" : "📥 結果取得"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 結果取得フォーム */}
      {activeRaceId && selectedRace && !doneIds.has(activeRaceId) && (
        <div className="card fade-in mt-16">
          <div className="card-header">
            <div className="card-title">
              📥 {selectedRace.venue} {selectedRace.raceNumber}R の結果取得
            </div>
          </div>

          <div className="flex gap-8 mb-16">
            <button className={`btn ${inputMode === "url" ? "btn-primary" : "btn-secondary"}`} onClick={() => setInputMode("url")}>🔗 URL</button>
            <button className={`btn ${inputMode === "html" ? "btn-primary" : "btn-secondary"}`} onClick={() => setInputMode("html")}>📄 HTML貼り付け</button>
          </div>

          {inputMode === "url" && (
            <div className="form-group">
              <label className="form-label" htmlFor="result-url">結果ページのURL</label>
              <input
                id="result-url"
                className="form-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="例: https://race.netkeiba.com/race/result.html?race_id=..."
              />
              <div className="fs-xs text-muted mt-4">
                対応: netkeiba.com / ODDS PARK / KEIBA.GO.JP
              </div>
            </div>
          )}

          {inputMode === "html" && (
            <div className="form-group">
              <label className="form-label" htmlFor="result-html">結果ページのHTML</label>
              <textarea
                id="result-html"
                className="form-textarea min-h-200 mono fs-sm"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="ブラウザで結果ページを開き、HTMLをコピー貼り付け"
              />
            </div>
          )}

          {error && <div className="alert alert-warning">⚠️ {error}</div>}

          <div className="flex gap-8">
            <button
              className="btn btn-primary"
              onClick={handleFetchResult}
              disabled={isLoading || (inputMode === "url" ? !url.trim() : !html.trim())}
            >
              {isLoading ? "⌛ 取得中..." : "🔍 結果を取得"}
            </button>
            <button className="btn btn-secondary" onClick={() => { setActiveRaceId(null); setScraped(null); setError(""); }}>
              キャンセル
            </button>
          </div>

          {/* 結果プレビュー */}
          {scraped && (
            <div className="mt-16 fade-in">
              <div className="card-title mb-8">📋 取得結果プレビュー（{scraped.results?.length || 0}頭）</div>
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="取得レース結果一覧">
                <table className="horse-table">
                  <thead>
                    <tr>
                      <th>着順</th><th>馬番</th><th>馬名</th><th>タイム</th>
                      <th>オッズ</th><th>人気</th><th>上がり3F</th>
                    </tr>
                  </thead>
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

              {/* 払い戻し */}
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

// 型定義
interface ScrapedHorse {
  frame: number;
  number: number;
  name: string;
  age: number;
  gender: string;
  coatColor?: string;
  weight: number;
  weightChange: number;
  jockey: string;
  jockeyWeight: number;
  trainer?: string;
  owner?: string;
  sire?: string;
  dam?: string;
  bms?: string;
  odds?: number;
  popularity?: number;
}

interface ScrapedData {
  raceInfo: {
    date: string;
    venue: string;
    raceNumber: number;
    raceName: string;
    distance: number;
    surface: Race["surface"];
    condition: Race["condition"];
    headCount: number;
    sourceUrl?: string;
  };
  horses: ScrapedHorse[];
  rawText?: string;
  raceResult?: any;
}

interface ResultRow {
  rank: number;
  horseNumber: number;
  horseName: string;
  time: string;
  odds: number;
  popularity: number;
  weight: number;
  weightChange: number;
  last3f?: string;
  jockey?: string;
  jockeyWeight?: number;
  margin?: string;
  prize: number;
}

interface RefundEntry {
  combination?: string;
  horse?: string;
  bracket?: string;
  payout: number;
  popularity: number;
}

interface ResultScrapedData {
  results: ResultRow[];
  refunds: Record<string, RefundEntry[]>;
  lapTimes: string[];
}

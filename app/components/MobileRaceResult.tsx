import React from 'react';
import { RaceResult, Horse } from '../types';

interface MobileRaceResultProps {
  result: RaceResult;
  horses?: Horse[];
}

export default function MobileRaceResult({ result, horses }: MobileRaceResultProps) {
  if (!result || !result.result || result.result.length === 0) {
    return <div className="text-muted p-12-16">結果データがありません。</div>;
  }

  // Get frame number from the horses array if available
  const getFrame = (horseNumber: number) => {
    if (horses) {
      const h = horses.find(h => h.number === horseNumber);
      if (h) return h.frame;
    }
    // Fallback: estimate from horse number (very rough, mainly for demo without horses array)
    return Math.ceil(horseNumber / 2);
  };

  const getPayouts = (type: string, data: any[] | undefined) => {
    if (!data || data.length === 0) return null;
    return data.map((d, i) => (
      <div className="payout-row" key={`${type}-${i}`}>
        <div className="payout-type">{type}</div>
        <div className="payout-combo">
          <span className="payout-number">{d.horse || d.bracket || d.combination}</span>
        </div>
        <div className={`payout-amount ${d.payout >= 10000 ? 'high-payout' : ''}`}>
          {d.payout.toLocaleString()}円
        </div>
        <div className="payout-pop">{d.popularity}番人気</div>
      </div>
    ));
  };

  return (
    <div className="mobile-race-result">
      <div className="section-title">🏆 レース結果</div>
      
      <div className="result-list">
        {result.result.slice(0, 5).map((r, index) => {
          const rankClass = r.rank <= 3 ? `rank-${r.rank}` : '';
          const frame = getFrame(r.horseNumber);
          const frameClass = frame >= 1 && frame <= 8 ? `frame-${frame}` : 'frame-other';
          
          return (
            <div key={r.horseNumber} className={`result-card ${rankClass}`}>
              <div className="rank-badge">{r.rank}</div>
              <div className={`frame-number ${frameClass}`}>{r.horseNumber}</div>
              <div className="horse-info">
                <div className="horse-name">{r.horseName}</div>
                <div className="horse-meta">
                  <span>{r.jockey}</span>
                  <span>{r.popularity}人気</span>
                </div>
              </div>
              <div className="performance-data">
                <div className="time">{r.time}</div>
                {r.margin && <div className="margin">{r.margin}</div>}
                {r.last3f && <div className="agari">上 <span>{r.last3f}</span></div>}
              </div>
            </div>
          );
        })}
      </div>

      {result.refunds && Object.keys(result.refunds).length > 0 && (
        <>
          <div className="section-title mt-16">💴 払戻金</div>
          <div className="payout-card">
            {getPayouts("単勝", result.refunds.win)}
            {getPayouts("複勝", result.refunds.place)}
            {getPayouts("枠連", result.refunds.bracketQuinella)}
            {getPayouts("馬連", result.refunds.quinella)}
            {getPayouts("ワイド", result.refunds.wide)}
            {getPayouts("馬単", result.refunds.exacta)}
            {getPayouts("3連複", result.refunds.trio)}
            {getPayouts("3連単", result.refunds.trifecta)}
          </div>
        </>
      )}
    </div>
  );
}

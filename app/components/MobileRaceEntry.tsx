import React from 'react';
import { Horse } from '../types';

interface MobileRaceEntryProps {
  horses: Horse[];
}

export default function MobileRaceEntry({ horses }: MobileRaceEntryProps) {
  if (!horses || horses.length === 0) {
    return <div className="text-muted p-12-16">出馬表データがありません。</div>;
  }

  return (
    <div className="mobile-race-entry">
      <div className="result-list">
        {horses.map((horse) => {
          const frameClass = horse.frame >= 1 && horse.frame <= 8 ? `frame-${horse.frame}` : 'frame-other';
          
          return (
            <div key={horse.id} className="horse-card">
              <div className={`frame-number ${frameClass}`}>{horse.frame}</div>
              <div className="w-60 flex-shrink-0" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>馬番</div>
                <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'Inter, sans-serif' }}>{horse.number}</div>
              </div>
              <div className="horse-info">
                <div className="horse-name">
                  {horse.name}
                  {horse.useBlinkers && <span className="blinkers">B</span>}
                </div>
                <div className="horse-meta">
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{horse.jockey}</span>
                  <span>{horse.jockeyWeight}kg</span>
                </div>
                <div className="horse-meta mt-4" style={{ fontSize: '10px' }}>
                  <span>{horse.gender}{horse.age}</span>
                  <span>{horse.weight}kg {horse.weightChange ? `(${horse.weightChange > 0 ? '+' : ''}${horse.weightChange})` : ''}</span>
                  <span>{horse.trainer}</span>
                </div>
                <div className="horse-meta mt-4" style={{ fontSize: '10px' }}>
                  <span>父: {horse.sire}</span>
                  <span>母父: {horse.bms}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

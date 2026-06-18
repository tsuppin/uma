const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ルール9：集中力アップで激走を呼ぶ「ブリンカー着用馬」
    if (horse.useBlinkers) {
      potential += 20; // 勝ち切るケースや大穴を開けるケースが多発しているため高評価
      tags.push("💥 東京特注: 集中力MAX！大穴激走も狙えるブリンカー着用馬");
    }`;

const replaceStr = `    // ルール9：集中力アップで激走を呼ぶ「ブリンカー着用馬」
    if (horse.useBlinkers) {
      potential += 20; // 勝ち切るケースや大穴を開けるケースが多発しているため高評価
      tags.push("💥 東京特注: 集中力MAX！大穴激走も狙えるブリンカー着用馬");
    }

    // ==========================================
    // 【特化ロジック】東京競馬場・近走実績4パターン（2026/06分析）
    // ==========================================

    const recentRacesTokyo = horse.pastRaces ? horse.pastRaces.slice(0, 3) : [];
    
    // ルール10：【最も堅実な軸候補】「近走（3〜5着）連続惜敗馬」の勝ち切り
    if (recentRacesTokyo.length >= 2) {
      const isConsecutiveCloseMiss = recentRacesTokyo.every((pr, i) => i > 1 || (pr.result >= 3 && pr.result <= 5));
      if (isConsecutiveCloseMiss && recentRacesTokyo[0].result >= 3 && recentRacesTokyo[0].result <= 5 && recentRacesTokyo[1].result >= 3 && recentRacesTokyo[1].result <= 5) {
        potential += 20;
        tags.push("👑 東京特注: 近走惜敗続き(3〜5着)からの勝ち上がり濃厚(堅実な軸)");
      }
    }

    // ルール11：【連勝の勢い】「昇級戦（前走1着）」の壁を突破する馬
    if (prevRaceData && prevRaceData.result === 1) {
      potential += 15;
      tags.push("🔥 東京特注: 昇級戦の壁なし！前走1着の勢いそのまま連勝へ");
    }

    // ルール12：【格上での経験値】「重賞・オープン敗退」からの自己条件巻き返し
    const hasHigherClassDefeat = recentRacesTokyo.some(pr => 
      pr.raceName && (pr.raceName.match(/G[1-3I-III]/i) || pr.raceName.includes('OP') || pr.raceName.includes('オープン')) && pr.result >= 6
    );
    const isCurrentRaceLowerClass = !(race.raceName && (race.raceName.match(/G[1-3I-III]/i) || race.raceName.includes('OP') || race.raceName.includes('オープン')));
    if (hasHigherClassDefeat && isCurrentRaceLowerClass && popularity >= 1 && popularity <= 5) {
      potential += 20;
      tags.push("👑 東京特注: 重賞・OP揉まれ経験馬の格下がり(自己条件で地力発揮)");
    }

    // ルール13：【波乱の使者】「前走大敗（二桁着順）」からの豹変
    if (prevRaceData && prevRaceData.result >= 10) {
      // ヒモとして残すために加点
      potential += 15;
      tags.push("💥 東京特注: 前走大敗(二桁着順)からの豹変警戒(高配当の使者)");
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Tokyo past races rules.");
} else {
  console.log("Error: Target string not found.");
}

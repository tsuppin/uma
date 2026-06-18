const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf("else if (trackName.includes('川崎')) {");
const endIndex = content.indexOf("else if (trackName.includes('船橋')) {");

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.slice(0, startIndex);
  const after = content.slice(endIndex);
  
  const replacement = `else if (trackName.includes('川崎')) {
    // ==========================================
    // 【特化ロジック】川崎競馬場・6つの必勝ルール ＋ 4つの馬ルール（2026/06分析）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;

    // --- [基本ルール] -------------------------------------
    // ルール1: 軸馬は「1〜3番人気」から選ぶ（勝率75%）
    if (popularity >= 1 && popularity <= 3) {
      potential += 15;
      tags.push("👑 川崎特注: 信頼の軸候補(1〜3番人気)");
    } else {
      potential -= 10;
      tags.push("⚠️ 川崎減点: 1着候補としては勝率低下(4番人気以下)");
    }

    // ルール2: 「内枠(1〜3枠) × 外枠(7〜8枠)」の組み合わせを狙う
    if (frame <= 3) {
      if (popularity <= 3) {
        potential += 15;
        tags.push("👑 川崎特注: アタマ有力！勝率の高い内枠(1〜3枠)の好走馬");
      } else {
        potential += 5;
        tags.push("📈 川崎特注: アタマに突き抜ける可能性を秘める内枠");
      }
    } else if (frame >= 7) {
      if (popularity >= 4) {
        potential += 20;
        tags.push("💥 川崎特注: ヒモ穴必須！高配当を演出する外枠(7〜8枠)の使者");
      }
    }

    // ルール3: 重馬場特有の「上がり最速馬」を重視する
    const isHeavyTrack = race.condition === '重' || race.condition === '不良' || race.condition === '稍重';
    if (isHeavyTrack) {
      if (horse.style === '追込' || horse.style === '差し') {
        potential += 15;
        tags.push("💥 川崎特注: 渋った馬場で浮上する末脚自慢");
      }
      if (prevRaceData && prevRaceData.last3fTime) {
        const last3f = parseFloat(prevRaceData.last3fTime);
        if (!isNaN(last3f) && last3f < 39.0) {
          potential += 20;
          tags.push("💥 川崎特注: 渋った馬場に直結する前走の鋭い上がりタイム");
        }
      }
    }

    // ルール4: 「3歳の下級条件」は穴狙いで手広く買う
    const is3yo = race.raceName && race.raceName.includes('3歳');
    if (is3yo && popularity >= 5) {
      potential += 15;
      tags.push("💥 川崎特注: 波乱続出の3歳戦！能力比較が難しいため穴馬の一変に警戒");
    }

    // ルール5: 前走が「他場」や「JRA」の馬を安易に切らない
    if (prevRaceData && prevRaceData.result >= 6) {
      const isOtherTrack = prevRaceData.venue && !prevRaceData.venue.includes('川崎');
      const isFromJRA = horse.transferFrom === 'JRA' || horse.belonging === 'JRA';
      if (isOtherTrack || isFromJRA) {
        potential += 30; // ペナルティ相殺
        tags.push("💥 川崎特注: 前走大敗は罠！コース替わり(他場/JRAからの転戦)で巻き返し濃厚");
      }
    }

    // ルール6: 当日乗れている「好調騎手」を味方につける
    const jName = horse.jockey || '';
    if (['町田', '山林'].some(j => jName.includes(j))) {
      if (popularity >= 4) {
        potential += 20;
        tags.push("👑 川崎特注: 穴をあける好調ジョッキー(町田/山林信)の一発");
      } else {
        potential += 10;
        tags.push("👑 川崎特注: 信頼の好調ジョッキー(町田/山林信)");
      }
    }

    // --- [馬のルール (追加4箇条)] --------------------------
    
    // 馬ルール1: 馬体重は絞れた「マイナス体重」か、成長の「大幅プラス(+15kg以上)」
    if (typeof horse.weightChange === 'number') {
      if (horse.weightChange < 0) {
        potential += 15;
        tags.push("👑 川崎特注: 確実に仕上がっているマイナス馬体重");
      } else if (horse.weightChange >= 15) {
        potential += 15;
        tags.push("💥 川崎特注: 成長・馬体回復を示す二桁の大幅プラス体重");
      }
    }

    // 馬ルール2: 血統は「ダート定番」に加え、スピードの活きる「芝血統」を重視
    const sire = horse.sire || '';
    if (/(パイロ|モーニン|クリソベリル|ゴールドドリーム)/.test(sire)) {
      potential += 10;
      tags.push("👑 川崎特注: 川崎で勝ち切るダート定番血統");
    }
    if (isHeavyTrack && /(ワールドエース|ヘンリーバローズ|スクリーンヒーロー|カレンブラックヒル)/.test(sire)) {
      potential += 20;
      tags.push("💥 川崎特注: 重馬場でスピードが活きる芝血統の台頭");
    }

    // 馬ルール3: 前走成績は「前走1着」か「前走大敗」の両極端を狙う
    if (prevRaceData) {
      if (prevRaceData.result === 1) {
        potential += 15;
        tags.push("👑 川崎特注: 前走1着の好調維持・連勝狙い");
      } else if (prevRaceData.result >= 9) {
        potential += 15;
        tags.push("💥 川崎特注: 着順だけで人気を落とす前走大敗からの鮮やかな巻き返し");
      }
    }

    // 馬ルール4: ダート戦でも「牝馬」を軽視しない（特に重馬場）
    if (horse.gender === '牝' && isHeavyTrack) {
      potential += 15;
      tags.push("💥 川崎特注: 牝馬特有のスピードや切れ味が活きる重馬場");
    }

    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }
  }
  `;
  
  fs.writeFileSync(filePath, before + replacement + after, 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Error: could not find indices");
}

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
    // 【特化ロジック】川崎競馬場・6つの必勝ルール（2026/06分析）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;

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
        potential += 20; // 2着・3着に頻繁に突っ込んでくる外枠の穴馬
        tags.push("💥 川崎特注: ヒモ穴必須！高配当を演出する外枠(7〜8枠)の使者");
      }
    }

    // ルール3: 重馬場特有の「上がり最速馬」を重視する
    // 重馬場・不良馬場（砂が締まって時計が速い）
    if (race.condition === '重' || race.condition === '不良' || race.condition === '稍重') {
      if (horse.style === '追込' || horse.style === '差し') {
        potential += 15;
        tags.push("💥 川崎特注: 渋った馬場(重・不良)で浮上する末脚自慢");
      }
      if (prevRaceData && prevRaceData.last3fTime) {
        // 前走上がりタイムが速い場合
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
      potential += 15; // 3歳戦は波乱含みのため穴馬のスコアを底上げ
      tags.push("💥 川崎特注: 波乱続出の3歳戦！能力比較が難しいため穴馬の一変に警戒");
    }

    // ルール5: 前走が「大敗」や「他場」の馬を安易に切らない
    if (prevRaceData && prevRaceData.result >= 6) {
      const isOtherTrack = prevRaceData.venue && !prevRaceData.venue.includes('川崎');
      const isFromJRA = horse.transferFrom === 'JRA' || horse.belonging === 'JRA';
      if (isOtherTrack || isFromJRA) {
        potential += 30; // 汎用エンジンの大敗ペナルティを相殺して余りある加点
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

    // 既存のマニアック1: 超絶タイトコーナーの内枠逃げ（川崎1500特注）
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

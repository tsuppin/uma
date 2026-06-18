const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStart = `      // ==========================================
      // 【特化ロジック】阪神特化トレンド（2026/06抽出）`;
const targetEnd = `      // マニアック1: 阪神ダート1400m専用「芝スタート×外枠×芝用スピード血統」`;

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const replaceStr = `      // ==========================================
      // 【完全減点方式】阪神特化ペナルティロジック（2026/06抽出）
      // ==========================================
      // 1. 人気・オッズファクター（減点最大：-20点）
      if (popularity >= 10) {
        potential -= 20;
        tags.push("⚠️ 阪神減点: 10番人気以下の大穴(1着絶望的)");
      } else if (popularity >= 6 && popularity <= 9) {
        potential -= 10;
        tags.push("⚠️ 阪神減点: 中穴(6〜9番人気)は1着候補として割引");
      }

      // 2. 枠順ファクター（減点最大：-20点）
      if (frame === 8) {
        potential -= 20;
        tags.push("⚠️ 阪神減点: 勝利実績ゼロの大外8枠(致命的ロス)");
      } else if (frame === 6 || frame === 7) {
        potential -= 5;
        tags.push("⚠️ 阪神減点: 外枠(6・7枠)の距離ロス");
      }

      // 3. 馬体重変動ファクター（減点最大：-15点）
      if (prevRaceData && typeof horse.weightChange === 'number') {
        const absChange = Math.abs(horse.weightChange);
        if (absChange >= 10) {
          potential -= 15;
          tags.push("⚠️ 阪神減点: ±10kg以上の大幅な馬体重変動(状態不安)");
        }
      }

      // 4. 近走成績ファクター（減点最大：-15点）
      let hasTop3InPast3 = false;
      const recentRaces = horse.pastRaces ? horse.pastRaces.slice(0, 3) : [];
      for (const pr of recentRaces) {
        if (pr.result <= 3) {
          hasTop3InPast3 = true;
          break;
        }
      }
      if (!hasTop3InPast3 && recentRaces.length > 0) {
        potential -= 15;
        tags.push("⚠️ 阪神減点: 近3走で3着以内の実績なし(巻き返し困難)");
      } else if (prevRaceData && prevRaceData.result >= 10) {
        potential -= 10;
        tags.push("⚠️ 阪神減点: 前走2桁着順の大敗(一変は少ない)");
      }

      // 5. 脚質・位置取りファクター（減点最大：-20点）
      if (horse.style === '追込' || horse.style === '後方') {
        potential -= 20;
        tags.push("⚠️ 阪神減点: 届かない極端な後方待機(追込不利)");
      } else if (horse.style === '差し' || horse.style === '中団') {
        potential -= 10;
        tags.push("⚠️ 阪神減点: 展開待ちの中団・差し(先行有利馬場)");
      }

      // 6. 上がり3ハロン（末脚）ファクター（減点最大：-10点）
      // ※ここでは簡易的に前走上がり34.5秒以下を速い上がりと定義し、それがない場合に減点
      let hasFastLast3f = false;
      for (const pr of recentRaces) {
        if (pr.last3fTime) {
          const last3f = parseFloat(pr.last3fTime);
          if (!isNaN(last3f) && last3f <= 34.5) {
            hasFastLast3f = true;
            break;
          }
        }
      }
      if (!hasFastLast3f && recentRaces.length > 0) {
        potential -= 10;
        tags.push("⚠️ 阪神減点: 近走で鋭い末脚(上がり速いタイム)の実績なし");
      }

      // 7. 騎手ファクター（減点最大：-10点）
      const hotJockeysHanshin = ['坂井瑠星', '川田将雅', '岩田望来', '幸英明', '西塚洸二', '田口貫太', '北村友一'];
      const isHotJockey = horse.jockey && hotJockeysHanshin.some(j => horse.jockey.includes(j));
      const isApprenticeHanshin = horse.jockey && horse.jockey.match(/[☆▲△◇★]/);
      
      if (isApprenticeHanshin && !isHotJockey) {
        potential -= 10;
        tags.push("⚠️ 阪神減点: 減量特典のみの若手騎手(トップジョッキー優勢)");
      }

      // 【特例救済ロジック】ヒモ荒れ狙い（2・3着候補）
      // トータルスコアが低くても、「上がり最速クラス」または「絶好調トップジョッキー」ならヒモとして残す
      if (hasFastLast3f || isHotJockey) {
        if (popularity >= 6) {
          // 減点されすぎないようにスコアを底上げし、フォーメーションのヒモ（2,3列目）に引っかかるようにする
          potential += 20; 
          tags.push("💥 阪神特注: 減点対象でも一発があるヒモ荒れ大穴候補");
        }
      }

      // マニアック1: 阪神ダート1400m専用「芝スタート×外枠×芝用スピード血統」`;

  const newContent = content.substring(0, startIndex) + replaceStr + content.substring(endIndex + targetEnd.length);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("Successfully replaced Hanshin logic with penalty system.");
} else {
  console.log("Error: Target strings not found.");
}

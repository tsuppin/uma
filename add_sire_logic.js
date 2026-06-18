const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 1. Tokyo Dirt 2100m Hokko Tarumae
const tokyoHokkoLogic = `    // 東京ダート2100m × ホッコータルマエ産駒
    if (race.surface === "ダート" && parseInt(dist || race.distance || "0", 10) === 2100) {
      if (horse.sire && horse.sire.includes("ホッコータルマエ")) {
        potential += 20;
        tags.push("🌟 東京ダート2100m特注: キンカメ系スタミナの血統！勝率12%・単回値103%を誇るホッコータルマエ産駒");
        if (horse.style === "逃げ" || horse.style === "先行") {
          potential += 15; // 追加ボーナス
          tags.push("🎯 東京ダート2100m鉄板: 前で競馬ができるホッコータルマエ産駒は絶好の狙い目！");
        }
      }
    }`;
let tokyoIndex = lines.findIndex(l => l.includes('【中京競馬場 超特化型オメガ・プロトコル推論エンジン】'));
if (tokyoIndex !== -1) {
  // Just before the closing brace of Tokyo Special
  lines.splice(tokyoIndex - 2, 0, tokyoHokkoLogic);
}

// 2. Fukushima
const fukushimaLogic = `  // ==========================================
  // 【福島競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isFukushimaSpecial = race.venue?.includes("福島") || race.trackName?.includes("福島") || race.raceName?.includes("福島");

  if (isFukushimaSpecial) {
    tags.push("🐎 福島特化OMEGAエンジン適用中");
    
    // 福島芝2600m × ゴールドシップ産駒
    if (race.surface === "芝" && parseInt(dist || race.distance || "0", 10) === 2600) {
      if (horse.sire && horse.sire.includes("ゴールドシップ")) {
        potential += 30;
        tags.push("👑 福島芝2600m超鉄板: 3回走れば1回は馬券に絡む！タフな長丁場で無類のスタミナを誇るゴールドシップ産駒は無条件で買い");
      }
    }
  }
`;
let fukuIndex = lines.findIndex(l => l.includes('【東京競馬場 超特化型オメガ・プロトコル推論エンジン】'));
if (fukuIndex !== -1) {
  lines.splice(fukuIndex - 1, 0, fukushimaLogic);
}

// 3. American Pharoah Global Dirt
const americanLogic = `  // ==========================================
  // 【ダート戦全般 血統特化ロジック (砂被り嫌悪)】
  // ==========================================
  if (race.surface === "ダート") {
    if (horse.sire && horse.sire.includes("アメリカンファラオ")) {
      // 砂被りを極端に嫌うため「逃げ」または「外枠(7〜8枠)」で大激走
      if (horse.style === "逃げ" || frame >= 7) {
        potential += 25;
        tags.push("👑 ダート特注(アメリカンファラオ): 砂を被らない条件(逃げ or 外枠)が揃った時、極端にパフォーマンスを上げるピンパーの単勝狙い目！");
      } else {
        potential -= 10;
        tags.push("🔻 ダート減点(アメリカンファラオ): 砂を被る内枠・中団からの競馬では脆い");
      }
    }
  }
`;
let americanIndex = lines.findIndex(l => l.includes('【中山競馬場 超特化型オメガ・プロトコル推論エンジン】'));
if (americanIndex !== -1) {
  lines.splice(americanIndex - 1, 0, americanLogic);
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log("All sire rules successfully written.");

import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Race, Prediction, LearningPatch } from "../../types";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const { race, predictions, actualResult } = await req.json() as {
      race: Race;
      predictions: Prediction[];
      actualResult: { rank: number; horseNumber: number }[];
    };

    if (!race || !predictions || !actualResult) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // AIに送るためのデータを整形
    const top3 = actualResult.filter(r => r.rank <= 3);
    const top3Horses = top3.map(r => {
      const h = race.horses.find(horse => horse.number === r.horseNumber);
      return { rank: r.rank, ...h };
    });

    const top3Predictions = predictions.slice(0, 3).map((p, idx) => ({
      aiRank: idx + 1,
      horseNumber: p.horseNumber,
      horseName: p.horseName,
      potential: p.potential
    }));

    const promptText = `
あなたは競馬予想AI「土屋プロトコル」の自己学習エンジンです。
以下のレース情報、あなたの事前の予測、および実際の結果を比較分析し、
予測が外れた原因（あなたが軽視していた好走馬の特徴）を抽出し、今後の予測システムに適用する「ラーニングパッチ（LearningPatch）」を生成してください。

【レース情報】
競馬場: ${race.trackName} (${race.venue})
距離: ${race.distance}m
馬場: ${race.surface} / ${race.condition}
クラス/条件: ${race.raceName}

【AIの事前の予測（上位3頭）】
${JSON.stringify(top3Predictions, null, 2)}

【実際のレース結果（上位3頭）】
${JSON.stringify(top3Horses, null, 2)}

【分析の指示】
1. AIが低く評価していた（AIの順位が低い）にも関わらず、実際には3着以内に入った馬を特定してください。
2. その馬が持つ特徴（例：馬体重が重い/軽い、枠順が内/外、年齢、脚質、上がりタイム等）を見つけ出してください。
3. その特徴に対するスコア加点・減点をJSON形式のLearningPatchとして出力してください。

【出力フォーマット】
以下のJSONスキーマに従うオブジェクトを出力してください。
`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: "分析内容の要約（例：大井ダート1200mでは内枠逃げ馬が有利など）" },
        adjustments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              field: { type: Type.STRING, description: "対象フィールド（例: frame, weight, style, age 等）" },
              operator: { type: Type.STRING, description: "演算子（<=, >=, ==, includes 等）" },
              value: { type: Type.STRING, description: "比較する値（文字列として出力し、数値の場合はパース可能にすること）" },
              scoreAdjust: { type: Type.NUMBER, description: "加点・減点するスコア（例: 15, -10）" }
            },
            required: ["field", "operator", "value", "scoreAdjust"]
          }
        }
      },
      required: ["description", "adjustments"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from Gemini");
    }

    const aiAnalysis = JSON.parse(jsonText);

    const patch: LearningPatch = {
      id: `patch_ai_${Date.now()}`,
      version: `v_AI_${Date.now()}`,
      date: new Date().toISOString(),
      description: `${race.venue} - ${aiAnalysis.description}`,
      track: race.trackName,
      condition: race.condition,
      adjustments: aiAnalysis.adjustments,
      active: true
    };

    return NextResponse.json(patch);

  } catch (error: any) {
    console.error("AI Learning Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

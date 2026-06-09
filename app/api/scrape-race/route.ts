import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Race, RaceResult } from "../../types";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const { date, track, raceNumber } = await req.json();

    if (!date || !track || !raceNumber) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const promptText = `
      ${date}の${track}競馬場 第${raceNumber}レースの出馬表（出走表）およびレース結果を、Google検索を使用して取得してください。
      主なソース：JRA公式サイト、netkeiba、競馬ラボ、地方競馬全国協会(NAR)など。

      以下の情報をJSON形式で抽出してください：
      - レース名 (raceName)
      - 距離 (distance) : 数値のみ
      - 馬場 (surface): "芝" または "ダート"
      - 馬場状態 (condition): "良", "稍重", "重", "不良" のいずれか
      - 出走馬リスト (horses): 馬番, 馬名, 騎手, オッズ, 馬体重, 斤量
      - 1着の馬番 (winnerNumber)
      - 1着の馬名 (winnerName)
      - 上位3頭の着順リスト (topThree): 順位(rank), 馬番(horseNumber)

      回答は必ずJSON形式で行ってください。
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        raceName: { type: Type.STRING },
        distance: { type: Type.NUMBER },
        surface: { type: Type.STRING },
        condition: { type: Type.STRING },
        horses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              number: { type: Type.NUMBER },
              name: { type: Type.STRING },
              jockey: { type: Type.STRING },
              odds: { type: Type.NUMBER },
              weight: { type: Type.NUMBER },
              load: { type: Type.NUMBER },
            },
            required: ["number", "name", "jockey", "odds", "weight", "load"]
          }
        },
        winnerNumber: { type: Type.NUMBER },
        winnerName: { type: Type.STRING },
        topThree: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rank: { type: Type.NUMBER },
              horseNumber: { type: Type.NUMBER }
            },
            required: ["rank", "horseNumber"]
          }
        }
      },
      required: ["raceName", "distance", "surface", "condition", "horses", "winnerNumber", "winnerName", "topThree"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: promptText,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(jsonText);

    // Map properties to match KeibaApp's Race & RaceResult
    const raceData: Partial<Race> = {
      venue: track,
      trackName: track,
      raceNumber: Number(raceNumber),
      raceName: data.raceName,
      distance: data.distance,
      surface: data.surface === "芝" ? "芝" : "ダート",
      condition: ["良", "稍重", "重", "不良"].includes(data.condition) ? data.condition : "良",
      horses: data.horses.map((h: any) => ({
        id: `horse_${Date.now()}_${h.number}`,
        number: h.number,
        name: h.name,
        jockey: h.jockey,
        odds: h.odds,
        weight: h.weight,
        jockeyWeight: h.load,
        // Fill defaults for required fields
        frame: Math.ceil(h.number / 2),
        age: 4,
        gender: "牡",
        weightChange: 0,
        trainer: "",
        owner: "",
        breeder: "",
        sire: "",
        dam: "",
        bms: "",
        bloodline: "",
        style: "中団",
        popularity: 1,
        pastRaces: [],
        coatColor: "",
      }))
    };

    const resultData: Partial<RaceResult> = {
      result: data.topThree,
    };

    return NextResponse.json({ raceData, resultData });

  } catch (error: any) {
    console.error("Scraping Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

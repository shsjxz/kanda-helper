import { NextRequest, NextResponse } from "next/server";
import { officialSource } from "@/lib/admission-data";
import { getAdmissionRecords } from "@/lib/database";
import { buildPredictions, type PredictionInput } from "@/lib/predictor";

export const runtime = "nodejs";

type PredictRequestBody = {
  province?: string;
  score?: string | number;
  rank?: string | number;
  subjects?: string;
};

function toPositiveNumber(value: string | number | undefined) {
  if (value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return number;
}

export async function POST(request: NextRequest) {
  let body: PredictRequestBody;

  try {
    body = (await request.json()) as PredictRequestBody;
  } catch {
    return NextResponse.json({ error: "请求格式不正确，请重新填写后查询。" }, { status: 400 });
  }

  const province = body.province || "江苏";
  const subjects = body.subjects || "物理+化学";
  const score = toPositiveNumber(body.score);
  const rank = toPositiveNumber(body.rank);

  if (score === null || rank === null) {
    return NextResponse.json({ error: "请填写有效的高考分数和高考位次。" }, { status: 400 });
  }

  const input: PredictionInput = { province, subjects, score, rank };
  const database = await getAdmissionRecords(province);
  const predictions = buildPredictions(database.records, input);

  return NextResponse.json({
    input,
    databaseMode: database.mode,
    warning: database.warning,
    source: officialSource,
    total: predictions.length,
    predictions,
    message:
      predictions.length > 0
        ? "已根据2025、2024、2023最低分位次和招生计划变化生成预测结果。"
        : "当前省份或选科暂无已核验的专业数据，请先录入数据库后再查询。",
  });
}

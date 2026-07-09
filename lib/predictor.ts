import type { AdmissionRecord, CurrentScoreSnapshot, ScoreSnapshot } from "./admission-data";

export type PredictionInput = {
  province: string;
  score: number;
  rank: number;
  subjects: string;
};

export type PredictionLevel = "冲刺" | "稳妥" | "保底";

export type PredictionResult = {
  id: string;
  major: string;
  programGroup: string;
  track: string;
  duration: string;
  subjectRequirement: string;
  plan2025: number;
  plan2026: number;
  planDelta: number;
  score2022: ScoreSnapshot | null;
  score2023: ScoreSnapshot | null;
  score2024: ScoreSnapshot | null;
  score2025: CurrentScoreSnapshot;
  scoreGap: number;
  rankGap2024: number | null;
  probability: number;
  level: PredictionLevel;
  reason: string;
  sourceTitle: string;
  sourceUrl: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function parseSubjects(subjects: string) {
  const normalized = normalize(subjects);
  const firstSubject = normalized.includes("历史") ? "历史" : normalized.includes("物理") ? "物理" : null;
  const selected = new Set<string>();

  if (normalized.includes("化学")) selected.add("化学");
  if (normalized.includes("生物")) selected.add("生物");

  return { firstSubject, selected };
}

function subjectText(record: AdmissionRecord) {
  if (record.requiredSubjects.length === 0) return `${record.firstSubject}+不限`;
  return `${record.firstSubject}+${record.requiredSubjects.join("+")}`;
}

export function recordMatchesInput(record: AdmissionRecord, input: PredictionInput) {
  if (record.province !== input.province) return false;

  const parsed = parseSubjects(input.subjects);
  if (!parsed.firstSubject) return false;
  if (record.firstSubject !== parsed.firstSubject) return false;

  return record.requiredSubjects.every((subject) => parsed.selected.has(subject));
}

function trendImpact(record: AdmissionRecord) {
  if (typeof record.score2024?.lowest !== "number") return 0;

  const trend = record.score2025.lowest - record.score2024.lowest;
  return clamp(-trend * 0.2, -6, 6);
}

function planImpact(record: AdmissionRecord) {
  return clamp((record.plan2026 - record.plan2025) * 0.1, -8, 12);
}

function rankImpact(record: AdmissionRecord, input: PredictionInput) {
  if (typeof record.score2024?.lowestRank !== "number") return 0;

  const rankGap = record.score2024.lowestRank - input.rank;
  return clamp(rankGap / 4500, -10, 10);
}

function rankGap2024(record: AdmissionRecord, input: PredictionInput) {
  if (typeof record.score2024?.lowestRank !== "number") return null;
  return record.score2024.lowestRank - input.rank;
}

function levelFromProbability(probability: number): PredictionLevel {
  if (probability >= 75) return "保底";
  if (probability >= 50) return "稳妥";
  return "冲刺";
}

function makeReason(record: AdmissionRecord, result: Omit<PredictionResult, "reason">) {
  const scoreText =
    result.scoreGap >= 0
      ? `高出2025普通批最低分 ${result.scoreGap} 分`
      : `低于2025普通批最低分 ${Math.abs(result.scoreGap)} 分`;
  const rankText =
    result.rankGap2024 === null
      ? "2024最低分位次暂缺"
      : result.rankGap2024 >= 0
        ? `位次比2024最低分位次靠前 ${result.rankGap2024.toLocaleString("zh-CN")} 名`
        : `位次比2024最低分位次靠后 ${Math.abs(result.rankGap2024).toLocaleString("zh-CN")} 名`;
  const planText =
    result.planDelta >= 0
      ? `2026计划较2025增加 ${result.planDelta} 人`
      : `2026计划较2025减少 ${Math.abs(result.planDelta)} 人`;
  const groupText = `${record.programGroup}，选科要求${subjectText(record)}`;

  if (result.level === "保底") return `${groupText}；${scoreText}，${rankText}，${planText}，可作为保底梯度。`;
  if (result.level === "稳妥") return `${groupText}；${scoreText}，${rankText}，${planText}，适合作为稳妥梯度。`;
  return `${groupText}；${scoreText}，${rankText}，${planText}，建议只作为冲刺，必须搭配稳妥和保底专业。`;
}

export function buildPredictions(records: AdmissionRecord[], input: PredictionInput) {
  return records
    .filter((record) => recordMatchesInput(record, input))
    .map((record) => {
      const scoreGap = input.score - record.score2025.lowest;
      const probability = Math.round(
        clamp(50 + scoreGap * 2.1 + rankImpact(record, input) + planImpact(record) + trendImpact(record), 5, 96),
      );
      const level = levelFromProbability(probability);
      const base = {
        id: record.id,
        major: record.major,
        programGroup: record.programGroup,
        track: record.track,
        duration: record.duration,
        subjectRequirement: subjectText(record),
        plan2025: record.plan2025,
        plan2026: record.plan2026,
        planDelta: record.plan2026 - record.plan2025,
        score2022: record.score2022,
        score2023: record.score2023,
        score2024: record.score2024,
        score2025: record.score2025,
        scoreGap,
        rankGap2024: rankGap2024(record, input),
        probability,
        level,
        sourceTitle: record.sourceTitle,
        sourceUrl: record.sourceUrl,
      } satisfies Omit<PredictionResult, "reason">;

      return {
        ...base,
        reason: makeReason(record, base),
      };
    })
    .sort((a, b) => b.probability - a.probability || b.score2025.lowest - a.score2025.lowest);
}

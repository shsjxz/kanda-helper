import type { AdmissionRecord, ScoreSnapshot } from "./admission-data";

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
  dataLevel: AdmissionRecord["dataLevel"];
  plan2025: number;
  plan2026: number;
  planDelta: number;
  score2022: ScoreSnapshot | null;
  score2023: ScoreSnapshot | null;
  score2024: ScoreSnapshot | null;
  score2025: ScoreSnapshot | null;
  referenceYear: 2023 | 2024 | 2025 | null;
  referenceScore: number | null;
  referenceRank: number | null;
  scoreGap: number | null;
  rankGap: number | null;
  probability: number;
  level: PredictionLevel;
  reason: string;
  dataNotice: string | null;
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
  const firstSubject = normalized.includes("历史")
    ? "历史"
    : normalized.includes("物理")
      ? "物理"
      : null;
  const selected = new Set<string>();

  if (normalized.includes("化学")) selected.add("化学");
  if (normalized.includes("生物")) selected.add("生物");
  if (normalized.includes("不限")) selected.add("不限");
  if (normalized.includes("理科")) selected.add("理科");
  if (normalized.includes("文科")) selected.add("文科");

  return { normalized, firstSubject, selected };
}

function subjectText(record: AdmissionRecord) {
  if (record.track === "综合改革") {
    if (record.requiredSubjects.length === 0) return "不限";
    return record.requiredSubjects.join("+");
  }

  if (record.track === "理科" || record.track === "文科") return record.track;
  if (!record.firstSubject) return record.track;
  if (record.requiredSubjects.length === 0) return `${record.firstSubject}+不限`;
  return `${record.firstSubject}+${record.requiredSubjects.join("+")}`;
}

export function recordMatchesInput(record: AdmissionRecord, input: PredictionInput) {
  if (record.province !== input.province) return false;

  const parsed = parseSubjects(input.subjects);

  if (record.track === "综合改革") {
    return record.requiredSubjects.every((subject) => parsed.selected.has(subject));
  }

  if (record.track === "理科") return parsed.selected.has("理科") || parsed.firstSubject === "物理";
  if (record.track === "文科") return parsed.selected.has("文科") || parsed.firstSubject === "历史";

  if (!parsed.firstSubject) return false;
  if (record.firstSubject !== parsed.firstSubject) return false;

  return record.requiredSubjects.every((subject) => parsed.selected.has(subject));
}

function latestReference(record: AdmissionRecord) {
  const snapshots = [
    { year: 2025 as const, score: record.score2025 },
    { year: 2024 as const, score: record.score2024 },
    { year: 2023 as const, score: record.score2023 },
  ];

  return snapshots.find((item) => typeof item.score?.lowest === "number" || typeof item.score?.lowestRank === "number") ?? null;
}

function availableRanks(record: AdmissionRecord) {
  return [
    { year: 2023, rank: record.score2023?.lowestRank },
    { year: 2024, rank: record.score2024?.lowestRank },
    { year: 2025, rank: record.score2025?.lowestRank },
  ].filter((item): item is { year: number; rank: number } => typeof item.rank === "number");
}

function rankTrendImpact(record: AdmissionRecord) {
  const ranks = availableRanks(record);
  if (ranks.length < 2) return 0;

  const first = ranks[0];
  const latest = ranks[ranks.length - 1];
  const trendRatio = (latest.rank - first.rank) / Math.max(latest.rank, 1);

  return clamp(trendRatio * 28, -8, 8);
}

function planImpact(record: AdmissionRecord) {
  if (record.plan2025 <= 0 || record.plan2026 <= 0) return 0;
  const changeRatio = (record.plan2026 - record.plan2025) / record.plan2025;
  return clamp(changeRatio * 18, -8, 10);
}

function hotnessImpact(record: AdmissionRecord) {
  const major = record.major;
  if (major.includes("临床医学")) return -8;
  if (major.includes("医学影像") || major.includes("医学检验")) return -5;
  if (major.includes("护理") || major.includes("药学") || major.includes("预防医学")) return -3;
  if (major.includes("最低参考")) return 0;
  if (major.includes("公共事业") || major.includes("健康服务") || major.includes("医疗保险")) return 3;
  return 0;
}

function rankProbability(inputRank: number, referenceRank: number) {
  const ratio = (referenceRank - inputRank) / Math.max(referenceRank, 1);
  return clamp(62 + ratio * 130, 30, 92);
}

function scoreProbability(inputScore: number, referenceScore: number) {
  return clamp(55 + (inputScore - referenceScore) * 2.2, 30, 90);
}

function probabilityFor(record: AdmissionRecord, input: PredictionInput, reference: NonNullable<ReturnType<typeof latestReference>>) {
  const referenceRank = reference.score?.lowestRank ?? null;
  const referenceScore = reference.score?.lowest ?? null;
  const rankPart = typeof referenceRank === "number" ? rankProbability(input.rank, referenceRank) : null;
  const scorePart = typeof referenceScore === "number" ? scoreProbability(input.score, referenceScore) : null;

  let base = 45;
  if (rankPart !== null && scorePart !== null) base = rankPart * 0.72 + scorePart * 0.28;
  else if (rankPart !== null) base = rankPart;
  else if (scorePart !== null) base = scorePart;

  return Math.round(clamp(base + rankTrendImpact(record) + planImpact(record) + hotnessImpact(record), 30, 96));
}

function levelFromProbability(probability: number): PredictionLevel {
  if (probability >= 80) return "保底";
  if (probability >= 50) return "稳妥";
  return "冲刺";
}

function makeReason(record: AdmissionRecord, result: Omit<PredictionResult, "reason">) {
  const groupText = `${record.programGroup}，选科要求${subjectText(record)}`;
  const referenceText = result.referenceYear
    ? `优先参考${result.referenceYear}最低${result.referenceRank ? `位次 ${result.referenceRank.toLocaleString("zh-CN")}` : `分 ${result.referenceScore}`}`
    : "暂无可参考的历年最低分位次";
  const rankText =
    result.rankGap === null
      ? "位次差暂缺"
      : result.rankGap >= 0
        ? `考生位次靠前 ${result.rankGap.toLocaleString("zh-CN")} 名`
        : `考生位次靠后 ${Math.abs(result.rankGap).toLocaleString("zh-CN")} 名`;
  const scoreText =
    result.scoreGap === null
      ? "分差暂缺"
      : result.scoreGap >= 0
        ? `分数高出 ${result.scoreGap} 分`
        : `分数低于 ${Math.abs(result.scoreGap)} 分`;
  const planText =
    result.planDelta === 0
      ? "招生计划暂按持平处理"
      : result.planDelta > 0
        ? `2026计划较2025增加 ${result.planDelta} 人`
        : `2026计划较2025减少 ${Math.abs(result.planDelta)} 人`;

  if (record.dataLevel === "province-track") {
    return `${groupText}；这是省份/科类最低线参考，不是专业明细；${referenceText}，${rankText}，${scoreText}。`;
  }

  if (result.level === "保底") return `${groupText}；${referenceText}，${rankText}，${scoreText}，${planText}，可作为保底梯度。`;
  if (result.level === "稳妥") return `${groupText}；${referenceText}，${rankText}，${scoreText}，${planText}，适合作为稳妥梯度。`;
  return `${groupText}；${referenceText}，${rankText}，${scoreText}，${planText}，建议只作为冲刺，必须搭配稳妥和保底专业。`;
}

export function buildPredictions(records: AdmissionRecord[], input: PredictionInput) {
  return records
    .filter((record) => recordMatchesInput(record, input))
    .map((record) => {
      const reference = latestReference(record);
      const referenceScore = reference?.score?.lowest ?? null;
      const referenceRank = reference?.score?.lowestRank ?? null;
      const probability = reference ? probabilityFor(record, input, reference) : 30;
      const level = levelFromProbability(probability);
      const base = {
        id: record.id,
        major: record.major,
        programGroup: record.programGroup,
        track: record.track,
        duration: record.duration,
        subjectRequirement: subjectText(record),
        dataLevel: record.dataLevel,
        plan2025: record.plan2025,
        plan2026: record.plan2026,
        planDelta: record.plan2026 - record.plan2025,
        score2022: record.score2022,
        score2023: record.score2023,
        score2024: record.score2024,
        score2025: record.score2025,
        referenceYear: reference?.year ?? null,
        referenceScore,
        referenceRank,
        scoreGap: typeof referenceScore === "number" ? input.score - referenceScore : null,
        rankGap: typeof referenceRank === "number" ? referenceRank - input.rank : null,
        probability,
        level,
        dataNotice:
          !record.score2025 || (typeof record.score2025.lowest !== "number" && typeof record.score2025.lowestRank !== "number")
            ? "暂无2025录取数据，当前根据2024、2023历史数据预测"
            : null,
        sourceTitle: record.sourceTitle,
        sourceUrl: record.sourceUrl,
      } satisfies Omit<PredictionResult, "reason">;

      return {
        ...base,
        reason: makeReason(record, base),
      };
    })
    .sort((a, b) => b.probability - a.probability || (b.referenceRank ?? 0) - (a.referenceRank ?? 0));
}

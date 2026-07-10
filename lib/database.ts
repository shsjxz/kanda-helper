import { Pool } from "pg";
import { admissionSeedRecords, type AdmissionRecord, type ScoreSnapshot } from "./admission-data";

type DatabaseResult = {
  records: AdmissionRecord[];
  mode: "postgres" | "seed";
  warning: string | null;
};

type DbAdmissionRow = {
  id: string;
  collegeName: string;
  year: number | string;
  province: string;
  programGroup: string;
  track: AdmissionRecord["track"];
  firstSubject: AdmissionRecord["firstSubject"] | null;
  requiredSubjects: string[] | string | null;
  major: string;
  duration: string;
  plan2025: number | string;
  plan2026: number | string;
  score2022LowestRank: number | string | null;
  score2023Highest: number | string | null;
  score2023Lowest: number | string | null;
  score2023LowestRank: number | string | null;
  score2024Highest: number | string | null;
  score2024Lowest: number | string | null;
  score2024LowestRank: number | string | null;
  score2025Highest: number | string | null;
  score2025Lowest: number | string | null;
  score2025LowestRank: number | string | null;
  sourceTitle: string;
  sourceUrl: string;
};

type DbYearlyAdmissionRow = {
  id: string;
  admissionRecordId: string;
  collegeName: string | null;
  province: string;
  programGroup: string | null;
  track: AdmissionRecord["track"];
  firstSubject: AdmissionRecord["firstSubject"] | null;
  requiredSubjects: string[] | string | null;
  major: string;
  dataLevel: AdmissionRecord["dataLevel"] | null;
  batch: string | null;
  year: number | string;
  highestScore: number | string | null;
  lowestScore: number | string | null;
  lowestRank: number | string | null;
  enrollmentPlan: number | string | null;
  sourceTitle: string | null;
  sourceUrl: string | null;
};

const globalForPg = globalThis as unknown as { kandaPool?: Pool };

function connectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

function getPool() {
  const url = connectionString();
  if (!url) return null;

  if (!globalForPg.kandaPool) {
    const localDatabase = /localhost|127\.0\.0\.1/i.test(url);
    globalForPg.kandaPool = new Pool({
      connectionString: url,
      ssl: localDatabase ? undefined : { rejectUnauthorized: false },
    });
  }

  return globalForPg.kandaPool;
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function makeScore(
  highest: number | string | null | undefined,
  lowest: number | string | null | undefined,
  lowestRank: number | string | null | undefined,
): ScoreSnapshot | null {
  const high = toNumber(highest);
  const low = toNumber(lowest);
  const rank = toNumber(lowestRank);
  if (high === null && low === null && rank === null) return null;

  return {
    ...(high !== null ? { highest: high } : {}),
    ...(low !== null ? { lowest: low } : {}),
    ...(rank !== null ? { lowestRank: rank } : {}),
  };
}

function parseRequiredSubjects(value: string[] | string | null): AdmissionRecord["requiredSubjects"] {
  if (Array.isArray(value)) {
    return value.filter((item) => item === "化学" || item === "生物") as AdmissionRecord["requiredSubjects"];
  }
  if (!value) return [];
  return value
    .split(/[,+，、]/)
    .map((item) => item.trim())
    .filter((item) => item === "化学" || item === "生物") as AdmissionRecord["requiredSubjects"];
}

function mapRow(row: DbAdmissionRow): AdmissionRecord {
  const score2025 = makeScore(row.score2025Highest, row.score2025Lowest, row.score2025LowestRank);

  return {
    id: row.id,
    collegeName: row.collegeName,
    year: Number(row.year),
    province: row.province,
    programGroup: row.programGroup,
    track: row.track,
    firstSubject: row.firstSubject,
    requiredSubjects: parseRequiredSubjects(row.requiredSubjects),
    major: row.major,
    duration: row.duration,
    plan2025: Number(toNumber(row.plan2025) ?? 0),
    plan2026: Number(toNumber(row.plan2026) ?? 0),
    score2022: makeScore(null, null, row.score2022LowestRank),
    score2023: makeScore(row.score2023Highest, row.score2023Lowest, row.score2023LowestRank),
    score2024: makeScore(row.score2024Highest, row.score2024Lowest, row.score2024LowestRank),
    score2025:
      typeof score2025?.highest === "number" && typeof score2025.lowest === "number"
        ? { highest: score2025.highest, lowest: score2025.lowest, ...(score2025.lowestRank ? { lowestRank: score2025.lowestRank } : {}) }
        : null,
    sourceTitle: row.sourceTitle,
    sourceUrl: row.sourceUrl,
  };
}

function mapYearlyRows(rows: DbYearlyAdmissionRow[]): AdmissionRecord[] {
  const grouped = new Map<string, DbYearlyAdmissionRow[]>();

  for (const row of rows) {
    const key = row.admissionRecordId || row.id;
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }

  return Array.from(grouped.entries()).map(([id, group]) => {
    const latest = [...group].sort((a, b) => Number(b.year) - Number(a.year))[0];
    const scoreByYear = new Map<number, ScoreSnapshot>();

    for (const row of group) {
      const score = makeScore(row.highestScore, row.lowestScore, row.lowestRank);
      if (score) scoreByYear.set(Number(row.year), score);
    }

    const plan2025 = group.find((row) => Number(row.year) === 2025)?.enrollmentPlan;

    return {
      id,
      collegeName: latest.collegeName || "南京医科大学康达学院",
      year: 2026,
      province: latest.province,
      programGroup: latest.programGroup || latest.batch || "普通批",
      track: latest.track,
      firstSubject: latest.firstSubject,
      requiredSubjects: parseRequiredSubjects(latest.requiredSubjects),
      major: latest.major,
      duration: "",
      plan2025: Number(toNumber(plan2025) ?? 0),
      plan2026: 0,
      score2022: null,
      score2023: scoreByYear.get(2023) ?? null,
      score2024: scoreByYear.get(2024) ?? null,
      score2025: scoreByYear.get(2025) ?? null,
      batch: latest.batch ?? undefined,
      dataLevel: latest.dataLevel ?? "province-track",
      sourceTitle: latest.sourceTitle || "年度录取数据表",
      sourceUrl: latest.sourceUrl || "",
    };
  });
}

function seedRecords(province: string) {
  return admissionSeedRecords.filter((record) => record.province === province);
}

function hasCalibratedRankData(records: AdmissionRecord[]) {
  return records.some((record) => typeof record.score2025?.lowestRank === "number");
}

async function getYearlyRecords(pool: Pool, province: string) {
  const { rows } = await pool.query<DbYearlyAdmissionRow>(
    `select
      id::text as "id",
      admission_record_id as "admissionRecordId",
      college_name as "collegeName",
      province,
      program_group as "programGroup",
      track,
      first_subject as "firstSubject",
      required_subjects as "requiredSubjects",
      major,
      data_level as "dataLevel",
      batch,
      year,
      highest_score as "highestScore",
      lowest_score as "lowestScore",
      lowest_rank as "lowestRank",
      enrollment_plan as "enrollmentPlan",
      source_title as "sourceTitle",
      source_url as "sourceUrl"
    from kanda_admission_yearly_records
    where province = $1 and year in (2023, 2024, 2025)
    order by admission_record_id, year`,
    [province],
  );

  return mapYearlyRows(rows);
}

export async function getAdmissionRecords(province: string): Promise<DatabaseResult> {
  const pool = getPool();

  if (!pool) {
    return {
      records: seedRecords(province),
      mode: "seed",
      warning: "当前未配置 DATABASE_URL，系统使用按图片校正的普通非定向数据种子。",
    };
  }

  try {
    const { rows } = await pool.query<DbAdmissionRow>(
      `select
        r.id::text as "id",
        r.college_name as "collegeName",
        r.year,
        r.province,
        r.program_group as "programGroup",
        r.track,
        r.first_subject as "firstSubject",
        r.required_subjects as "requiredSubjects",
        r.major,
        r.duration,
        r.plan_2025 as "plan2025",
        r.plan_2026 as "plan2026",
        to_jsonb(r)->>'score_2022_lowest_rank' as "score2022LowestRank",
        r.score_2023_highest as "score2023Highest",
        r.score_2023_lowest as "score2023Lowest",
        to_jsonb(r)->>'score_2023_lowest_rank' as "score2023LowestRank",
        r.score_2024_highest as "score2024Highest",
        r.score_2024_lowest as "score2024Lowest",
        to_jsonb(r)->>'score_2024_lowest_rank' as "score2024LowestRank",
        r.score_2025_highest as "score2025Highest",
        r.score_2025_lowest as "score2025Lowest",
        to_jsonb(r)->>'score_2025_lowest_rank' as "score2025LowestRank",
        r.source_title as "sourceTitle",
        r.source_url as "sourceUrl"
      from kanda_admission_records r
      where r.province = $1 and r.year = 2026
      order by r.program_group, r.score_2025_lowest desc`,
      [province],
    );

    if (rows.length === 0) {
      const yearlyRecords = await getYearlyRecords(pool, province);
      if (yearlyRecords.length > 0) {
        return {
          records: yearlyRecords,
          mode: "postgres",
          warning: "当前省份来自年度录取数据表；如只有省份/科类最低线，则结果为省份层级参考，不是专业明细。",
        };
      }

      return {
        records: seedRecords(province),
        mode: "seed",
        warning: "数据库暂未查询到该省份数据，已回退到按图片校正的数据种子。",
      };
    }

    const records = rows.map(mapRow);
    if (!hasCalibratedRankData(records)) {
      const yearlyRecords = await getYearlyRecords(pool, province);
      if (yearlyRecords.length > 0 && hasCalibratedRankData(yearlyRecords)) {
        return {
          records: yearlyRecords,
          mode: "postgres",
          warning: "旧专业表缺少2025最低位次，已使用年度录取数据表。",
        };
      }

      return {
        records: seedRecords(province),
        mode: "seed",
        warning: "数据库尚未写入图片中的最低分位次，已临时使用本地校正数据；请执行最新 schema 和 seed 后再启用数据库数据。",
      };
    }

    return {
      records,
      mode: "postgres",
      warning: null,
    };
  } catch (error) {
    console.error("Failed to query kanda admission database", error);
    return {
      records: seedRecords(province),
      mode: "seed",
      warning: "数据库连接失败，已自动回退到按图片校正的数据种子。请检查 DATABASE_URL 和表结构。",
    };
  }
}

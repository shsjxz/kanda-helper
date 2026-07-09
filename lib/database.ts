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
  firstSubject: AdmissionRecord["firstSubject"];
  requiredSubjects: string[] | string | null;
  major: string;
  duration: string;
  plan2025: number | string;
  plan2026: number | string;
  score2023Highest: number | string | null;
  score2023Lowest: number | string | null;
  score2024Highest: number | string | null;
  score2024Lowest: number | string | null;
  score2025Highest: number | string;
  score2025Lowest: number | string;
  sourceTitle: string;
  sourceUrl: string;
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

function toNumber(value: number | string | null) {
  if (value === null) return null;
  return typeof value === "number" ? value : Number(value);
}

function makeScore(highest: number | string | null, lowest: number | string | null): ScoreSnapshot | null {
  const high = toNumber(highest);
  const low = toNumber(lowest);
  if (high === null || low === null) return null;
  return { highest: high, lowest: low };
}

function parseRequiredSubjects(value: string[] | string | null): AdmissionRecord["requiredSubjects"] {
  if (Array.isArray(value)) return value.filter((item) => item === "化学" || item === "生物") as AdmissionRecord["requiredSubjects"];
  if (!value) return [];
  return value
    .split(/[,+，、]/)
    .map((item) => item.trim())
    .filter((item) => item === "化学" || item === "生物") as AdmissionRecord["requiredSubjects"];
}

function mapRow(row: DbAdmissionRow): AdmissionRecord {
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
    score2023: makeScore(row.score2023Highest, row.score2023Lowest),
    score2024: makeScore(row.score2024Highest, row.score2024Lowest),
    score2025: {
      highest: Number(toNumber(row.score2025Highest) ?? 0),
      lowest: Number(toNumber(row.score2025Lowest) ?? 0),
    },
    sourceTitle: row.sourceTitle,
    sourceUrl: row.sourceUrl,
  };
}

function seedRecords(province: string) {
  return admissionSeedRecords.filter((record) => record.province === province);
}

export async function getAdmissionRecords(province: string): Promise<DatabaseResult> {
  const pool = getPool();

  if (!pool) {
    return {
      records: seedRecords(province),
      mode: "seed",
      warning: "当前未配置 DATABASE_URL，系统使用已校正的普通非定向数据种子。部署后配置 Postgres 即可改为数据库读取。",
    };
  }

  try {
    const { rows } = await pool.query<DbAdmissionRow>(
      `select
        id::text as "id",
        college_name as "collegeName",
        year,
        province,
        program_group as "programGroup",
        track,
        first_subject as "firstSubject",
        required_subjects as "requiredSubjects",
        major,
        duration,
        plan_2025 as "plan2025",
        plan_2026 as "plan2026",
        score_2023_highest as "score2023Highest",
        score_2023_lowest as "score2023Lowest",
        score_2024_highest as "score2024Highest",
        score_2024_lowest as "score2024Lowest",
        score_2025_highest as "score2025Highest",
        score_2025_lowest as "score2025Lowest",
        source_title as "sourceTitle",
        source_url as "sourceUrl"
      from kanda_admission_records
      where province = $1 and year = 2026
      order by program_group, score_2025_lowest desc`,
      [province],
    );

    if (rows.length === 0) {
      return {
        records: seedRecords(province),
        mode: "seed",
        warning: "数据库暂未查询到该省份数据，已回退到已校正的数据种子。",
      };
    }

    return {
      records: rows.map(mapRow),
      mode: "postgres",
      warning: null,
    };
  } catch (error) {
    console.error("Failed to query kanda admission database", error);
    return {
      records: seedRecords(province),
      mode: "seed",
      warning: "数据库连接失败，已自动回退到已校正的数据种子。请检查 DATABASE_URL 和表结构。",
    };
  }
}

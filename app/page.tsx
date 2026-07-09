"use client";

import { FormEvent, useMemo, useState } from "react";

type FormState = {
  province: string;
  score: string;
  rank: string;
  subjects: string;
};

type PredictionLevel = "冲刺" | "稳妥" | "保底";

type ScoreSnapshot = {
  highest: number;
  lowest: number;
};

type PredictionResult = {
  id: string;
  major: string;
  programGroup: string;
  track: string;
  duration: string;
  subjectRequirement: string;
  plan2025: number;
  plan2026: number;
  planDelta: number;
  score2023: ScoreSnapshot | null;
  score2024: ScoreSnapshot | null;
  score2025: ScoreSnapshot;
  scoreGap: number;
  probability: number;
  level: PredictionLevel;
  reason: string;
  sourceTitle: string;
  sourceUrl: string;
};

type PredictResponse = {
  databaseMode: "postgres" | "seed";
  warning: string | null;
  source: {
    title: string;
    url: string;
    note: string;
  };
  total: number;
  predictions: PredictionResult[];
  message: string;
  error?: string;
};

const provinceOptions = ["江苏", "浙江", "安徽", "山东", "河南", "四川"];
const subjectOptions = ["物理+化学", "物理+生物", "物理+化学+生物", "物理+不限", "历史+生物", "历史+不限"];

function levelStyles(level: PredictionLevel) {
  if (level === "冲刺") return "border-amber-200 bg-amber-50 text-amber-700";
  if (level === "稳妥") return "border-sky-200 bg-sky-50 text-sky-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function levelBar(level: PredictionLevel) {
  if (level === "冲刺") return "bg-amber-500";
  if (level === "稳妥") return "bg-sky-600";
  return "bg-emerald-600";
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function planText(item: PredictionResult) {
  if (item.planDelta > 0) return `2026 ${item.plan2026}人（+${item.planDelta}）`;
  if (item.planDelta < 0) return `2026 ${item.plan2026}人（${item.planDelta}）`;
  return `2026 ${item.plan2026}人（持平）`;
}

function scoreText(score: ScoreSnapshot | null) {
  if (!score) return "--";
  return `${score.lowest}/${score.highest}`;
}

export default function Home() {
  const [form, setForm] = useState<FormState>({
    province: "江苏",
    score: "",
    rank: "",
    subjects: "物理+化学",
  });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PredictResponse | null>(null);

  const completion = useMemo(() => {
    const filled = Object.values(form).filter(Boolean).length;
    return Math.round((filled / 4) * 100);
  }, [form]);

  const averageProbability = useMemo(() => {
    if (!result || result.predictions.length === 0) return null;
    const total = result.predictions.reduce((sum, item) => sum + item.probability, 0);
    return Math.round(total / result.predictions.length);
  }, [result]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as PredictResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error || "查询失败，请稍后再试。");
      }

      setResult(data);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "查询失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8fb] text-[#172033]">
      <section className="bg-[#123d5c] text-white">
        <div className="mx-auto flex min-h-[330px] w-full max-w-5xl flex-col px-5 pb-12 pt-5">
          <header className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/10 text-sm font-bold">
                康
              </div>
              <div>
                <p className="text-xs text-white/70">南京医科大学康达学院</p>
                <p className="text-sm font-semibold">普通专业组冲稳保查询</p>
              </div>
            </div>
            <span className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/80">
              非定向普通批
            </span>
          </header>

          <div className="mt-auto pt-12">
            <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/82">
              按专业组、选科、2023-2025分数和2026计划变化测算
            </div>
            <h1 className="max-w-2xl text-[2rem] font-semibold leading-tight tracking-normal">
              南京医科大学康达学院志愿智能助手
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
              当前版本已排除定向培养，按普通专业组计算。护理学必须匹配生物选科；物理+化学查询不会再显示护理学。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 w-full max-w-5xl px-5 pb-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#d8e3ea] bg-white p-4 shadow-[0_18px_45px_rgba(23,32,51,0.10)]"
        >
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium text-[#176b9f]">智能测算入口</p>
              <h2 className="mt-1 text-lg font-semibold">输入考生信息</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">资料完整度</p>
              <p className="mt-1 text-lg font-semibold text-[#1f8a70]">{completion}%</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">省份</span>
              <span className="relative block">
                <select
                  value={form.province}
                  onChange={(event) => updateField("province", event.target.value)}
                  className="h-12 w-full appearance-none rounded-md border border-[#d8e3ea] bg-white px-4 pr-11 text-base text-[#172033]"
                  aria-label="选择省份"
                >
                  {provinceOptions.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                <ChevronIcon />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">高考分数</span>
              <input
                value={form.score}
                onChange={(event) => updateField("score", event.target.value)}
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="例如：540"
                className="h-12 w-full rounded-md border border-[#d8e3ea] bg-white px-4 text-base text-[#172033] placeholder:text-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">高考位次</span>
              <input
                value={form.rank}
                onChange={(event) => updateField("rank", event.target.value)}
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="例如：98420"
                className="h-12 w-full rounded-md border border-[#d8e3ea] bg-white px-4 text-base text-[#172033] placeholder:text-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">选科</span>
              <span className="relative block">
                <select
                  value={form.subjects}
                  onChange={(event) => updateField("subjects", event.target.value)}
                  className="h-12 w-full appearance-none rounded-md border border-[#d8e3ea] bg-white px-4 pr-11 text-base text-[#172033]"
                  aria-label="选择选科"
                >
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <ChevronIcon />
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#123d5c] px-4 text-base font-semibold text-white transition hover:bg-[#176b9f] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <SearchIcon />
            {loading ? "正在查询..." : "查询专业录取概率"}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-slate-500">
            位次作为后续同分辅助项保留；当前公开普通专业组数据以分数、专业组、计划变化为主。
          </p>
        </form>

        <section className="mt-5 rounded-lg border border-[#d8e3ea] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#176b9f]">测算结果</p>
              <h2 className="mt-1 text-lg font-semibold">
                {searched ? "专业组推荐梯度" : "提交后生成冲稳保建议"}
              </h2>
            </div>
            <div className="rounded-md bg-[#eef7f4] px-3 py-2 text-right">
              <p className="text-[11px] text-slate-500">平均概率</p>
              <p className="text-base font-semibold text-[#1f8a70]">
                {averageProbability === null ? "--" : `${averageProbability}%`}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">
              <p>
                数据状态：
                <span className="font-semibold text-[#123d5c]">
                  {result.databaseMode === "postgres" ? "Postgres 数据库" : "已校正普通非定向数据种子"}
                </span>
              </p>
              {result.warning && <p className="mt-1">提示：{result.warning}</p>}
              <p className="mt-1">说明：{result.source.note}</p>
            </div>
          )}

          {!result && !error && (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              填写分数、位次和选科后，将按普通专业组生成录取概率。
            </div>
          )}

          {result && result.predictions.length === 0 && (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              {result.message}
            </div>
          )}

          {result && result.predictions.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {result.predictions.map((item) => (
                <article key={item.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">{item.major}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.programGroup} / {item.subjectRequirement} / {item.duration}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${levelStyles(item.level)}`}>
                      {item.level}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <div className="rounded bg-white px-2 py-2">
                      2023低/高
                      <strong className="mt-1 block text-[#172033]">{scoreText(item.score2023)}</strong>
                    </div>
                    <div className="rounded bg-white px-2 py-2">
                      2024低/高
                      <strong className="mt-1 block text-[#172033]">{scoreText(item.score2024)}</strong>
                    </div>
                    <div className="rounded bg-white px-2 py-2">
                      2025低/高
                      <strong className="mt-1 block text-[#172033]">{scoreText(item.score2025)}</strong>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="rounded bg-white px-2 py-2">
                      2025计划
                      <strong className="ml-1 text-[#172033]">{item.plan2025}人</strong>
                    </div>
                    <div className="rounded bg-white px-2 py-2">{planText(item)}</div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>录取概率</span>
                      <span>{item.probability}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full transition-all ${levelBar(item.level)}`}
                        style={{ width: `${item.probability}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-600">{item.reason}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

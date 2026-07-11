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
  highest?: number;
  lowest?: number;
  lowestRank?: number;
};

type PredictionResult = {
  id: string;
  major: string;
  programGroup: string;
  track: string;
  duration: string;
  subjectRequirement: string;
  dataLevel?: "major" | "province-track";
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

const provinceOptions = [
  "江苏",
  "山东",
  "浙江",
  "上海",
  "安徽",
  "福建",
  "甘肃",
  "广东",
  "贵州",
  "河南",
  "湖北",
  "江西",
  "辽宁",
  "山西",
  "四川",
  "西藏",
  "新疆",
  "云南",
];
const subjectOptions = [
  "物理+化学",
  "物理+生物",
  "物理+化学+生物",
  "物理+不限",
  "历史+生物",
  "历史+不限",
  "不限",
  "理科",
  "文科",
];

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

function scoreRangeText(score: ScoreSnapshot | null) {
  if (typeof score?.lowest !== "number" || typeof score.highest !== "number") return "--";
  return `${score.lowest}/${score.highest}`;
}

function rankText(score: ScoreSnapshot | null) {
  if (typeof score?.lowestRank !== "number") return "--";
  return score.lowestRank.toLocaleString("zh-CN");
}

function rankCompareText(item: PredictionResult) {
  if (item.rankGap === null) return "参考位次暂缺";
  if (item.rankGap >= 0) return `较${item.referenceYear ?? "历史"}靠前 ${item.rankGap.toLocaleString("zh-CN")} 名`;
  return `较${item.referenceYear ?? "历史"}靠后 ${Math.abs(item.rankGap).toLocaleString("zh-CN")} 名`;
}

function scoreGapText(item: PredictionResult) {
  if (item.scoreGap === null) return "--";
  return item.scoreGap >= 0 ? `+${item.scoreGap}` : String(item.scoreGap);
}

function referenceText(item: PredictionResult) {
  if (!item.referenceYear) return "暂无";
  if (typeof item.referenceRank === "number") return `${item.referenceYear}位次 ${item.referenceRank.toLocaleString("zh-CN")}`;
  if (typeof item.referenceScore === "number") return `${item.referenceYear}分数 ${item.referenceScore}`;
  return `${item.referenceYear}`;
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
                🦉
              </div>
              <div>
                <p className="text-xs text-white/70">🦉 康达猫头鹰学长</p>
                <p className="text-sm font-semibold">普通专业组冲稳保查询</p>
              </div>
            </div>
            <span className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/80">
              非定向普通批
            </span>
          </header>

          <div className="mt-auto pt-12">
            <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/82">
              按2025、2024、2023最低位次和2026计划变化测算
            </div>
            <h1 className="max-w-2xl text-[2rem] font-semibold leading-tight tracking-normal">
              康达猫头鹰学长 AI 招生预测
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
              基于历年录取数据、位次和招生计划，为康达学院考生提供AI录取概率预测、专业分析、新生攻略，预测结果仅供参考。
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
                  {provinceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
            预测优先参考2025最低位次；暂无2025数据的省份会自动回退到2024、2023历史数据。
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

          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-800">
            ⚠️ 温馨提示：本网站为个人经验分享与AI预测分析平台，所有预测结果和数据分析仅供参考，不构成任何录取承诺或报考建议。最终请以各省教育考试院及南京医科大学康达学院官方公布的信息为准。
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
                  {result.databaseMode === "postgres" ? "Postgres 数据库" : "图片校正数据种子"}
                </span>
              </p>
              {result.warning && <p className="mt-1">提示：{result.warning}</p>}
              <p className="mt-1">说明：{result.source.note}</p>
            </div>
          )}

          {!result && !error && (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              填写分数、位次和选科后，将按普通非定向专业组生成录取概率。
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

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="rounded bg-white px-3 py-3">
                      2025最低/最高
                      <strong className="mt-1 block text-base text-[#172033]">{scoreRangeText(item.score2025)}</strong>
                    </div>
                    <div className="rounded bg-white px-3 py-3">
                      参考年份
                      <strong className="mt-1 block text-base text-[#172033]">{referenceText(item)}</strong>
                    </div>
                  </div>

                  {item.dataNotice && (
                    <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-2 text-xs leading-5 text-amber-700">
                      {item.dataNotice}
                    </div>
                  )}

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="rounded bg-white px-2 py-2">
                      2024低/高
                      <strong className="mt-1 block text-[#172033]">{scoreRangeText(item.score2024)}</strong>
                    </div>
                    <div className="rounded bg-white px-2 py-2">
                      2024最低位次
                      <strong className="mt-1 block text-[#172033]">{rankText(item.score2024)}</strong>
                    </div>
                    <div className="rounded bg-white px-2 py-2">
                      2023最低位次
                      <strong className="mt-1 block text-[#172033]">{rankText(item.score2023)}</strong>
                    </div>
                    <div className="rounded bg-white px-2 py-2">
                      2022最低位次
                      <strong className="mt-1 block text-[#172033]">{rankText(item.score2022)}</strong>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="rounded bg-white px-2 py-2">
                      2025计划
                      <strong className="ml-1 text-[#172033]">{item.plan2025}人</strong>
                    </div>
                    <div className="rounded bg-white px-2 py-2">{planText(item)}</div>
                  </div>

                  <div className="mt-3 rounded bg-white px-2 py-2 text-xs text-slate-600">
                    位次对比
                    <strong className="ml-1 text-[#172033]">{rankCompareText(item)}</strong>
                  </div>

                  <div className="mt-2 rounded bg-white px-2 py-2 text-xs text-slate-600">
                    与参考最低分差
                    <strong className="ml-1 text-[#172033]">{scoreGapText(item)}</strong>
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

        <footer className="mt-6 border-t border-slate-200 pt-5 text-center text-xs leading-6 text-slate-500">
          <p>© 2026 康达猫头鹰学长</p>
          <p>本网站为个人经验分享与AI分析平台，不代表南京医科大学康达学院官方。</p>
        </footer>
      </section>
    </main>
  );
}

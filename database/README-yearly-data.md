# 年度录取数据维护说明

## 推荐数据表

新增省份、年份、专业录取数据时，优先写入：

`kanda_admission_yearly_records`

这一张表是一行一个年份记录，适合从 Excel 或图片整理后持续追加，不需要改前端页面。

## 必填字段

- `id`：唯一记录 ID，例如 `sd-2025-nursing`
- `admission_record_id`：同一个专业跨年份保持一致，例如 `sd-2026-nursing`
- `province`：省份，例如 `山东`
- `track`：科类，例如 `物理等科目类`、`历史等科目类`、`综合改革`、`理科`、`文科`
- `subject_label`：选科展示，例如 `物理+化学`、`历史+不限`、`不限`
- `major`：专业名称；如果只有省份最低线，可写 `普通类一段最低参考（不限）`
- `year`：录取年份，例如 `2025`
- `lowest_score`：最低分
- `lowest_rank`：最低位次

## 可选字段

- `highest_score`：最高分
- `enrollment_plan`：当年招生人数
- `program_group`：专业组，例如 `05专业组`
- `batch`：批次，例如 `本科批`
- `required_subjects`：再选科目数组，例如 `array['化学']::text[]`
- `data_level`：`major` 表示专业明细，`province-track` 表示省份/科类最低线参考

## 当前已录入

- 官网 2025 分省分专业数据：安徽、福建、甘肃、广东、贵州、河南、湖北、江苏、江西、辽宁、山东、山西、上海、四川、西藏、新疆、云南、浙江。
- 江苏数据已按普通本科批处理，排除“提前本科医学定向”。
- 西藏、新疆官网图片未提供最高/最低分位次，已录入分数，位次字段留空。
- Excel 预估表中的省份/科类最低线继续作为兜底数据；当同一省份已有专业级数据时，页面会优先展示专业明细，不再混入省份汇总线。

## 文件

- `schema.sql`：建表结构
- `seed-kanda-2025-yearly-records.sql`：当前年度录取数据种子
- `seed-kanda-2025-official-major-records.sql`：南京医科大学康达学院招生网官方 2025 分省分专业录取数据种子
- `yearly-record-template.csv`：后续整理 Excel/图片时可参考的列模板

## 后续继续添加专业数据

1. 先把新增省份或年份整理成 `yearly-record-template.csv` 的字段格式。
2. 每个专业、每个年份一行，至少填写 `province`、`track`、`subject_label`、`major`、`year`、`lowest_score`。
3. 如果图片或表格没有位次，`lowest_rank` 留空，不要估算。
4. 导入数据库时先执行 `schema.sql`，再执行对应 seed 文件。
5. 如果只更新本地静态种子，需要同步维护 `lib/official-2025-major-records.ts` 或新增同结构数据文件。

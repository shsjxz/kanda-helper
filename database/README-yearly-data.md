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

- 江苏 2025 专业级最低分、最高分、最低位次
- 山东 2025 普通类一段最低分、最低位次（来自各省预估表，属于省份/科类层级，不是专业明细）

## 文件

- `schema.sql`：建表结构
- `seed-kanda-2025-yearly-records.sql`：当前年度录取数据种子
- `yearly-record-template.csv`：后续整理 Excel/图片时可参考的列模板

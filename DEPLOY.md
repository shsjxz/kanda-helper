# 南京医科大学康达学院志愿智能助手部署说明

## 当前已完成

- 首页已改为后端接口预测版。
- `/api/predict` 会根据省份、分数、位次、选科返回专业概率。
- 支持 `DATABASE_URL` 连接 Postgres。
- 未配置数据库时，会使用内置的官方招生数据种子，避免页面不可用。
- 已整理 `database/schema.sql` 和 `database/seed-kanda-2026-jiangsu.sql`。

## 官方数据来源

当前种子数据来自南京医科大学康达学院招生官网发布的：

- `南京医科大学康达学院2026年江苏省普高招生计划（不含定向）`
- 表中包含 2026 年计划数、2025 年最高分、2025 年最低分、2025 年最低位次。

## 上线需要的东西

要生成所有人都可以打开的公网网址，需要以下任意一种部署授权：

1. Vercel 账号登录或 `VERCEL_TOKEN`
2. Netlify 账号授权
3. 阿里云、腾讯云、宝塔、服务器 SSH 权限
4. 已建好的 GitHub 仓库和 Vercel 项目授权

## Postgres 数据库

部署时添加环境变量：

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

然后在数据库里执行：

```sql
-- 先执行 database/schema.sql
-- 再执行 database/seed-kanda-2026-jiangsu.sql
```

如果以后拿到 2025 年招生计划人数，把 `plan_2025` 字段补上，系统会自动计算 `planDelta`，并把扩招或缩招影响纳入概率。

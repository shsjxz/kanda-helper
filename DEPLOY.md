# 南京医科大学康达学院志愿智能助手部署说明

## 当前已完成

- 首页已改为后端接口预测版。
- `/api/predict` 会根据省份、分数、位次、选科返回专业概率。
- 支持 `DATABASE_URL` 连接 Postgres。
- 未配置数据库时，会使用内置的官方招生数据种子，避免页面不可用。
- 已整理 `database/schema.sql` 和 `database/seed-kanda-2026-jiangsu.sql`。
- GitHub 仓库已准备为 `https://github.com/shsjxz/kanda-helper`。
- Vercel 配置文件 `vercel.json` 已加入项目。

## 官方数据来源

当前种子数据来自南京医科大学康达学院招生官网历年数据和用户提供的 2026 招生计划图：

- 2023、2024 普通非定向录取分数
- 2025 普通专业组最低分/最高分
- 2025、2026 招生计划数和扩招/缩招变化
- 定向培养数据已排除

## 上线需要的东西

要生成所有人都可以打开的公网网址，推荐使用 Vercel 导入 GitHub 仓库：

```text
https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshsjxz%2Fkanda-helper&project-name=kanda-helper
```

Vercel 项目设置：

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: 留空

如需我继续完成 Vercel 项目创建和部署，需要 Vercel 登录授权或 `VERCEL_TOKEN`。

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

当前 `plan_2025` 和 `plan_2026` 已按普通专业组数据录入，系统会自动计算扩招或缩招人数并纳入概率。

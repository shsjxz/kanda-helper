# 南京医科大学康达学院志愿智能助手

这是一个基于 Next.js 的康达学院普通非定向专业组录取概率预测网站。

## 已完成

- 手机端优先首页
- `/api/predict` 后端预测接口
- 按江苏新高考专业组和选科过滤
- 排除定向培养数据
- 使用 2023、2024、2025 普通非定向分数趋势
- 使用 2025/2026 招生计划变化计算冲稳保概率
- 支持 Postgres 数据库，未配置数据库时回退到内置校正数据
- 已准备 Vercel 部署配置

## GitHub 仓库

https://github.com/shsjxz/kanda-helper

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

## 生产构建

```bash
npm run build
npm run start
```

## Vercel 部署

推荐在 Vercel 后台导入 GitHub 仓库：

```text
https://github.com/shsjxz/kanda-helper
```

也可以打开这个导入链接：

```text
https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshsjxz%2Fkanda-helper&project-name=kanda-helper
```

Vercel 项目设置：

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: 留空

## 数据库

项目支持 Postgres。部署后在 Vercel 环境变量中添加：

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

然后执行：

```sql
-- database/schema.sql
-- database/seed-kanda-2026-jiangsu.sql
```

没有配置 `DATABASE_URL` 时，系统会使用 `lib/admission-data.ts` 中的普通非定向校正数据。

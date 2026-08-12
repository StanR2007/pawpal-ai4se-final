# PawPal

PawPal 是一个温暖的多人宠物共同照护工具。首个可演示版本提供多宠物家庭首页、今日照护任务、任务单次完成、成长瞬间记录和本地持久化。

## 快速开始

需要 Node.js 22+ 与 pnpm。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开 `http://localhost:3000`。首次访问自动创建“阳光小屋”、Momo 与豆豆的演示数据。

## 功能

- 查看家庭中的多只宠物与今日照护任务。
- 一键完成任务；同一个任务不会被重复完成。
- 添加宠物，记录新的成长瞬间。
- 使用 `data/pawpal.json` 持久化演示数据；写入采用临时文件后原子重命名。

## 数据与安全边界

当前为单进程本地演示版：JSON 存储适用于课程展示和个人本地试用，不适用于多服务实例或生产级并发。数据层集中在 `src/lib/store/`，未来可以替换为 PostgreSQL，而无需更改页面与路由。

演示版不保存真实密码、第三方 API Key 或邀请链接明文；请不要把真实隐私数据提交到仓库。

## 测试、CI 与分发

```bash
pnpm test
pnpm build
docker compose up --build
```

Docker 将 `data/` 作为持久化卷挂载。GitHub Actions 会在每次 push 和 pull request 自动执行单元测试与生产构建；`.gitlab-ci.yml` 保留 `unit-test` job 以满足课程提交要求。

公开演示地址：<https://pawpal-ai4se-final.vercel.app>。Vercel 环境是无状态的，线上站点仅作功能展示；需要验证 JSON 持久化时请使用本地 Docker。

## 目录结构

```text
src/app/              页面与 API 路由
src/lib/store/        JSON 存储与业务仓储层
tests/unit/           核心单元测试
data/                 本地演示数据（不提交）
docs/superpowers/     设计与详细任务计划
SPEC.md / PLAN.md     当前规格与完成记录
```

GitHub Actions 会在每次 push 和 pull request 自动执行单元测试与生产构建；`.gitlab-ci.yml` 保留 `unit-test` job 以满足课程提交要求。

公开演示地址：<https://pawpal-ai4se-final.vercel.app>。Vercel 环境是无状态的，线上站点仅作功能展示；需要验证 JSON 持久化时请使用本地 Docker。

## 目录结构

```text
src/app/              页面与 API 路由
src/lib/store/        JSON 存储与业务仓储层
tests/unit/           核心单元测试
data/                 本地演示数据（不提交）
docs/superpowers/     设计与详细任务计划
SPEC.md / PLAN.md     当前规格与完成记录
```

## 已知限制

- 尚未接入真实账号、邀请和多设备协作；这些需要数据库服务恢复后实现。
- 尚未实现图片上传、健康档案、PDF 就诊摘要和临时交接单。
- 站内提醒通过首页“今日照护”呈现，未接入短信、邮件或微信通知。

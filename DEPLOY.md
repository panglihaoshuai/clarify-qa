# Clarify Q&A — Railway 部署指南

## 前提

- 已有的东西：完整代码（已实现，所有文件就绪）
- 待完成：Railway 项目创建 + 环境变量配置 + 部署

---

## 第一步：创建 Railway 项目

1. 访问 https://railway.app 注册账号
2. Dashboard → "New Project" → "Deploy from GitHub repo"
3. 选择本仓库（或先上传到 GitHub）

---

## 第二步：添加 PostgreSQL 数据库

1. 在 Railway 项目中 → "Add a database" → "PostgreSQL"
2. Railway 会自动生成 `DATABASE_URL`
3. 复制这个值，下一步用

---

## 第三步：设置环境变量

在 Railway Dashboard → 项目 → "Variables" 中添加：

```
DATABASE_URL=postgresql://xxx  # 从第二步获取
JWT_SECRET=生成一个32位以上的随机字符串
MINIMAX_API_KEY=你的MiniMax API Key
MINIMAX_API_URL=https://api.minimax.chat
NEXT_PUBLIC_APP_URL=https://你的部署域名.railway.app
```

**生成 JWT_SECRET 的方法：**
```bash
openssl rand -base64 32
```

---

## 第四步：部署

在本地项目目录执行（安装 Railway CLI）：

```bash
npm install -g @railway/cli
railway login
railway init
railway link [项目ID]  # 从 Railway Dashboard 复制
railway up
```

或者在 Railway Dashboard 直接触发 Deploy。

---

## 第五步：验证

部署成功后访问：`https://xxx.railway.app`

应该能看到：
- `/login` — 登录页
- `/register` — 注册页

---

## 目录结构（参考）

```
clarify-qa/
├── app/
│   ├── (app)/              # 受保护的 App 路由
│   │   ├── layout.tsx      # Auth 保护布局
│   │   ├── workspace/      # 主工作台
│   │   └── session/[id]/   # 分析详情页
│   ├── (auth)/             # 公开 Auth 路由
│   │   ├── login/
│   │   └── register/
│   └── api/               # API 路由
├── components/            # UI 组件
├── lib/                   # 工具函数
│   ├── prisma.ts
│   ├── auth.ts
│   ├── minimax.ts
│   └── skills/           # 5 个 Skill 提示词
├── prisma/schema.prisma
└── package.json
```

---

## 常见问题

**Q: 部署后访问显示 500？**
A: 检查环境变量是否都配置正确，特别是 `DATABASE_URL` 和 `JWT_SECRET`

**Q: MiniMax API 调用失败？**
A: 确认 `MINIMAX_API_KEY` 正确，且账户有额度

**Q: 可以用其他数据库吗？**
A: 可以，Railway 支持 PostgreSQL、MySQL、MongoDB 等，只需改 `DATABASE_URL` 和 `prisma/schema.prisma` 的 provider

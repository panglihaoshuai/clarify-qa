"use strict";(()=>{var e={};e.id=254,e.ids=[254],e.modules={3524:e=>{e.exports=require("@prisma/client")},2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2254:e=>{e.exports=require("node:buffer")},6005:e=>{e.exports=require("node:crypto")},5673:e=>{e.exports=require("node:events")},8849:e=>{e.exports=require("node:http")},2286:e=>{e.exports=require("node:https")},7261:e=>{e.exports=require("node:util")},2955:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>f,patchFetch:()=>y,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>x});var r={};s.r(r),s.d(r,{GET:()=>c,POST:()=>l});var n=s(9303),a=s(8716),o=s(670),i=s(7070),u=s(2331),d=s(9178),p=s(3007);async function c(e,{params:t}){if(!await (0,d.Gg)())return i.NextResponse.json({error:"未登录"},{status:401});let s=await u._.message.findMany({where:{sessionId:t.id},orderBy:{createdAt:"asc"}});return i.NextResponse.json(s)}async function l(e,{params:t}){let r=await (0,d.Gg)();if(!r)return i.NextResponse.json({error:"未登录"},{status:401});let n=r.payload.userId,a=await u._.session.findFirst({where:{id:t.id,userId:n}});if(!a)return i.NextResponse.json({error:"未找到"},{status:404});let{content:o}=await e.json();await u._.message.create({data:{sessionId:t.id,role:"user",content:o}});let c=(await u._.message.findMany({where:{sessionId:t.id},orderBy:{createdAt:"desc"},take:10})).reverse().map(e=>({role:e.role,content:e.content})),l=(0,p.f)(a.methodology);try{let{minimaxChat:e}=await s.e(815).then(s.bind(s,815)),r=await e([...c,{role:"user",content:o}],l),n=await u._.message.create({data:{sessionId:t.id,role:"assistant",content:r}});return i.NextResponse.json(n)}catch(e){return console.error(e),i.NextResponse.json({error:"AI 响应失败"},{status:500})}}let m=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/sessions/[id]/messages/route",pathname:"/api/sessions/[id]/messages",filename:"route",bundlePath:"app/api/sessions/[id]/messages/route"},resolvedPagePath:"/Users/songshiyao/.edu_brainstorming/app/api/sessions/[id]/messages/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:g,staticGenerationAsyncStorage:x,serverHooks:h}=m,f="/api/sessions/[id]/messages/route";function y(){return(0,o.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:x})}},9178:(e,t,s)=>{s.d(t,{Gg:()=>u,fT:()=>o});var r=s(9535),n=s(1615);let a=new TextEncoder().encode(process.env.JWT_SECRET);async function o(e){return new r.N6(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(a)}async function i(e){try{let{payload:t}=await (0,r._f)(e,a);return t}catch{return null}}async function u(){let e=(0,n.cookies)(),t=e.get("auth_token")?.value;return t?i(t):null}},2331:(e,t,s)=>{s.d(t,{_:()=>n});var r=s(3524);let n=globalThis.prisma||new r.PrismaClient({log:["error"]})},3007:(e,t,s)=>{s.d(t,{f:()=>n});let r={brainstorming:`你是一个专业的思维整理助手。用户会提供文档或截图，内容可能是模糊的指令、想法或任务描述。

你的任务是：
1. 识别内容中的模糊点——哪里表述不清晰、哪里可能产生歧义
2. 将模糊的指令拆解成具体可执行的子任务

请用以下格式输出：

## 模糊点识别
• [具体模糊点1]
• [具体模糊点2]

## 可执行项建议
1. [可执行项1]
2. [可执行项2]

保持简洁，直接切入重点。`,musk:`你扮演埃隆\xb7马斯克，使用第一性原理（First Principles Thinking）来分析用户的内容。

马斯克的思维框架核心：
1. 质疑每一个假设——"这为什么是这样的？"
2. 从物理定律出发——找到最基本的不可分解的事实
3. 重新构建解决方案——基于第一原理推导新的可能性

你的任务是：
1. 识别内容中最核心的问题是什么（不是表象问题）
2. 追溯到物理/经济/逻辑层面的基本约束
3. 提出真正能落地的解决方案

请用以下格式输出：

## 核心问题（第一性）
[追溯到本质的核心问题]

## 基本约束
• [物理/经济/逻辑约束1]
• [物理/经济/逻辑约束2]

## 重新构建的方案
1. [基于第一原理的解决方案]
2. [可执行的具体步骤]

"这听起来很疯狂，但如果你回到物理第一性原理，你会发现它实际上是可行的。" — Elon Musk`,jobs:`你扮演史蒂夫\xb7乔布斯，用他的产品哲学和设计思维来分析用户的内容。

乔布斯的思维框架核心：
1. 简约即力量——把复杂的东西变简单
2. 关注用户体验——产品是为了让人的生活更美好
3. 追求卓越——做到极致，不妥协
4. 直觉思维——相信自己的审美和判断

你的任务是：
1. 识别内容中真正重要的事（忽略噪音）
2. 找出与"用户真实需求"的差距
3. 提出简洁有力的行动方案

请用以下格式输出：

## 真正重要的事
[透过表象看到的本质]

## 与卓越的差距
• [当前方案的不足]
• [乔布斯会如何改进]

## 简洁行动方案
1. [最核心的改动]
2. [具体可执行的步骤]

"设计不只是看起来怎么样、感觉怎么样。设计是它如何运作的。" — Steve Jobs`,"paul-graham":`你扮演保罗\xb7格雷厄姆（Paul Graham），用他的写作思维和创业智慧来分析用户的内容。

Paul Graham 的思维框架核心：
1. 写作是思考的方式——想不清楚就写不清楚
2. 关注最根本的东西——不要被表象迷惑
3. 诚实地问——什么是真正的问题？
4. 小步迭代——不要一开始就追求完美

你的任务是：
1. 识别内容中最核心的论点（可能用户自己都没表达清楚）
2. 用清晰的逻辑重新阐述
3. 给出可执行的建议

请用以下格式输出：

## 核心论点（重新阐述）
[用清晰的语言表述]

## 论证的漏洞或模糊点
• [逻辑或表述上的问题]

## 可执行建议
1. [如何把想法变得更清晰]
2. [下一步具体行动]

"Writing doesn't just communicate ideas; it generates them." — Paul Graham`,munger:`你扮演查理\xb7芒格，用他的多元心智模型来交叉分析用户的内容。

芒格的思维框架核心：
1. 多元心智模型——从不同学科看问题（心理学、经济学、物理学等）
2. 反过来想——总是反过来想
3. 概率思维——考虑可能性和赔率
4. 长期视角——不要被短期噪音干扰

你的任务是：
1. 从多个角度分析内容中的问题
2. 找出潜在的盲点和风险
3. 提出跨学科的综合建议

请用以下格式输出：

## 问题分析（多学科视角）
• [心理学角度]
• [经济学角度]
• [其他相关学科]

## 反过来想
[如果反过来做会怎样]

## 综合建议
1. [多元模型交叉得出的建议]
2. [概率最高的行动路径]

"如果你知道你会死在哪里，就永远不要去那个地方。" — Charlie Munger`};function n(e){return r[e]??r.brainstorming}}};var t=require("../../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[948,795,972],()=>s(2955));module.exports=r})();
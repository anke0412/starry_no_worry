# Phase 2 Subagent Orchestration Runbook

> 适用范围：Phase 2 持续开发期间，主 agent 使用子 agent 并行推进实现、审查、验证时，统一遵循本手册。

## 1. 目标

这份 runbook 不是功能设计文档，也不是新任务列表；它是 Phase 2 主 agent 的执行规范。后续每次推进时，主 agent 应直接按本文组织任务、派发子 agent、回收结果、维护计划状态，并给出可审计的完成结论。

## 2. 不可变规则

### 2.1 唯一任务文档

- Phase 2 的任务来源只能是当前正在执行的 plan markdown。
- 主 agent 不得额外创建平行任务 md、临时 todo md、或“子计划”文档来替代当前 plan。
- 允许子 agent 产出实现、review、verify 结果摘要，但这些结果只能回流到主 agent，由主 agent 统一写入最终汇报与计划状态。

### 2.2 主 agent 的上下文裁剪责任

- 主 agent 只能向子 agent 下发“当前 task 全文 + 完成该 task 必需的相关上下文”。
- 主 agent 不得要求子 agent 自己通读完整 plan，也不得把整份 plan 原样丢给子 agent 让其自行定位任务。
- 若 task 依赖前序任务结果，主 agent 负责先整理依赖结论，再一并下发给子 agent。
- 子 agent 拿到的上下文应足以执行，但不应包含与当前 task 无关的长篇背景。

### 2.3 固定三段式流程

每个 task 必须按固定顺序经过以下三个独立阶段：

1. `impl`
2. `review`
3. `verify`

执行要求：

- `impl` 只负责实现与必要测试变更，不代替审查结论。
- `review` 必须独立检查实现正确性、边界条件、回归风险与计划符合度，不复用 `impl` 结论充当审查。
- `verify` 必须独立运行验证，给出实际通过/失败/阻塞结论，不以“理论上应通过”替代验证结果。
- 任一阶段失败，主 agent 必须回到上一阶段或重新派发，不得跳过。

### 2.4 勾选与计划回写唯一责任

- plan 中 checkbox 的勾选、取消勾选、补充备注，唯一责任人是主 agent。
- 子 agent 不负责修改 plan 勾选状态，即使其完成了实现、review 或 verify。
- 主 agent 只有在收齐对应阶段结果并确认达到完成定义后，才能回写 plan 状态。

## 3. 子 agent 命名规范

所有子 agent 名称必须显式包含阶段与任务标识，便于主 agent 汇总。

命名格式：

`{stage}_{task_slug}`

约束如下：

- `{task_slug}` 使用当前 task 的短标识，语义清晰，避免过长。
- `{stage}` 只能是 `impl`、`review`、`verify` 三者之一。
- 同一 task 若需重跑，主 agent 可在内部区分轮次，但对外仍保持同一命名主格式。

示例：

- `impl_solar_return_backend`
- `review_solar_return_backend`
- `verify_solar_return_backend`

## 4. 主 agent 标准执行流程

### 4.1 选定当前 task

- 从当前 plan markdown 中选出唯一一个“正在推进”的 task。
- 主 agent 先提取该 task 全文，再补充必要上下文：
  - 涉及文件
  - 前置任务结论
  - 明确的完成条件
  - 本轮需要覆盖的测试或验证命令

### 4.2 派发 `impl`

- 给 `impl` 子 agent 的输入必须包含：
  - 当前 task 全文
  - 必需上下文
  - 修改范围约束
  - 需要同步维护的测试
- `impl` 输出至少应包含：
  - 实际改动摘要
  - 风险点
  - 需要 `review` 重点检查的内容
  - 已执行的局部测试或未执行原因

### 4.3 派发 `review`

- `review` 不能只复述 `impl` 结果，必须独立审查代码与行为。
- `review` 输出必须明确：
  - 是否发现问题
  - 问题严重级别
  - 若无问题，给出可落档的 review 结论
- 若发现阻断问题，主 agent 返回 `impl` 修复后再重新进入 `review`。

### 4.4 派发 `verify`

- `verify` 只接受已经过 `review` 的候选结果。
- `verify` 必须执行本 runbook 规定的最小验证矩阵，以及 task 所需的 targeted tests。
- `verify` 输出必须明确：
  - 实际运行了哪些命令
  - 每个命令结果
  - 是否存在阻塞、环境问题、或失败项
  - 最终 verify 结论

### 4.5 主 agent 收口

- 主 agent 汇总 `impl`、`review`、`verify` 三段结果。
- 只有三段都满足要求，主 agent 才能：
  - 勾选当前 task
  - 更新 plan 中相关步骤状态
  - 在对外汇报里声明完成

### 4.6 task 收口后的连续推进

- 当前 task 达到完成定义后，主 agent 不应默认停下等待用户再次说“开始”。
- 主 agent 必须立即做下一步判断：
  - 若当前 active plan 内还有直接后继 step / slide，则完成当前 step 的 git 生命周期后继续推进下一 step / slide。
  - 若当前主题还有直接后继 task，则创建或激活下一份 execution-ready plan 并继续推进。
  - 若当前主题已收口，则从 ready queue 中提升下一主题的首个 coherent task，写入新的 `work/plans/` 任务文档后继续推进。
  - 只有当出现升级条件或真实阻断时，才允许停止并等待用户。
- “当前 task 完成”只意味着要切换到下一 task，不意味着整个 session 自动结束。

### 4.7 step / slide 的 git 生命周期

- 在 `phase2-full-rollout.md` 这类多 step / slide 的执行计划中，主 agent 必须把每个 step / slide 视为一个 branch 管理单元。
- 当前 step / slide 完成并通过 verify 后，主 agent 必须：
  - 回写该 step / slide 状态
  - commit 当前 scoped 改动
  - push 当前 branch
  - merge into `main`
  - pull 最新 `main`
  - 再开启下一 step / slide 对应的新 branch
- 若 push / merge / pull 失败，主 agent 必须停止并汇报真实阻断，不得跳过 git 生命周期直接继续下一个 step。

## 5. 完成定义

一个 task 只有同时满足以下条件，才算完成：

- `impl` 已落地到代码与测试。
- `review` 有独立结论，且不存在未处理的阻断问题。
- `verify` 有独立结论，且验证结果真实通过，或明确记录阻塞原因并未宣布完成。
- 相关测试已按“测试维护规则”同步更新。
- plan 状态已由主 agent 回写。

禁止以下情况被视为完成：

- 只有实现，没有独立 review。
- 只有 review，没有独立 verify。
- 只跑了开发者手边最方便的命令，未达到最小验证矩阵。
- 子 agent 口头说“应该没问题”，主 agent 就直接勾选。

## 6. 测试维护规则

- 任何代码行为变更，都必须同时判断现有测试是否需要新增、修改或删除。
- 若实现改变了接口、契约、状态流转、错误处理或渲染行为，测试必须同步维护，不能把测试债留到后续 task。
- 若现有测试覆盖不足，`impl` 必须补上最小必要测试，`review` 必须检查测试是否真的覆盖新行为，`verify` 必须实际运行。
- 若某项测试暂时无法维护，必须在主 agent 汇报中明确记录原因、影响范围和后续补齐依赖；未记录不得视为完成。

## 7. 最小验证矩阵

除非当前 task 明确与某一侧完全无关，否则 `verify` 默认至少覆盖以下矩阵：

- backend 全量：`cd backend && ../.venv312/bin/python -m pytest tests`
- 前端单测：`npm test`
- 前端构建：`npm run build`
- 必要时 targeted tests：针对当前 task 新增或修改的模块、接口、页面、服务补充定向验证

执行规则：

- `targeted tests` 不是替代品，而是补充项。
- 若 backend 或 frontend 与当前 task 确认完全无关，主 agent 必须在 verify 结论中写明豁免依据。
- 因环境或依赖问题无法执行时，必须给出真实阻塞信息，不能把未运行写成已通过。

## 8. 主 agent 汇报格式

每次 task 收口时，主 agent 的对外汇报至少包含：

- 当前完成的 task
- `impl` 结果摘要
- `review` 独立结论
- `verify` 独立结论
- 是否已由主 agent 回写 plan 勾选
- 若有阻塞或残余风险，明确列出

如果 `review` 或 `verify` 未形成独立结论，主 agent 不得使用“已完成”措辞。

## 9. Ready Queue

Ready queue 只维护“下一批可推进主题及依赖顺序”，不在这里展开实现细节。

当前顺序如下：

1. 新盘型扩展
2. 分析交互
3. AI 解读增强

依赖关系：

- `分析交互` 依赖 `新盘型扩展` 的稳定输出与前端接线完成。
- `AI 解读增强` 依赖 `分析交互` 的输入结构、状态流和结果展示面稳定。

主 agent 只能在前序主题达到完成定义后，再把后续主题提升为当前 task。

当一个主题内的当前 task 完成后，主 agent 默认应继续从该主题的下一 coherent task 开始；若该主题已经稳定收口，再把下一主题提升为当前 task。

## 10. 长期执行原则

- 计划来源单一，避免多份任务文档漂移。
- 子 agent 上下文按 task 精准裁剪，避免低效通读。
- `impl -> review -> verify` 顺序固定，不做省略版。
- 勾选和状态回写集中在主 agent，保证计划账本唯一。
- step / slide 完成后先关闭 git 生命周期，再开始下一 step / slide。
- 完成声明以独立 review 与 verify 结论为准，不以主观判断替代。

本手册默认长期有效；后续若 Phase 2 运行经验证明需要调整，应直接更新本文件，而不是在别处追加平行规则。

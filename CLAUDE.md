# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供操作本代码仓库的指导。

## 项目概述

**全国退休计算器** - 一个支持中国2025年渐进式延迟退休政策的网页版退休年龄和养老金计算工具。

- **技术栈**: 原生 HTML5 + CSS3 + ES6（无构建步骤，无依赖）
- **架构**: 分离式架构（HTML/CSS/JS 独立文件）
- **设计风格**: 瑞士/国际主义风格（Swiss Style）- 网格系统、高对比度、无装饰
- **数据持久化**: LocalStorage 自动保存用户输入，键名 `retirementCalculatorData`
- **测试**: 自动化测试套件，47+ 个测试用例，支持浏览器和 Node.js 双模式运行

## 常用命令

本项目为纯客户端应用，无需构建系统：

```bash
# 运行应用（在浏览器中打开）
open src/index.html

# 或使用静态服务器
npx serve src

# 运行测试
open src/test.html           # 可视化测试报告
node src/test.js             # Node.js 测试运行器
```

## 架构说明

### 文件结构
```
retirement-calculator/
├── src/
│   ├── index.html    # 主应用界面（HTML结构）
│   ├── styles.css    # 瑞士风格设计系统
│   ├── app.js        # 核心业务逻辑
│   ├── test.html     # 可视化测试报告页面
│   └── test.js       # 测试套件（浏览器 + Node.js）
├── docs/
│   ├── CONTEXT.md    # 项目背景
│   ├── DECISIONS.md  # 架构决策
│   ├── LESSONS.md    # 踩坑记录
│   ├── TEST_CASES.md # 测试用例说明
│   └── CHANGELOG.md  # 更新日志
├── README.md
└── CLAUDE.md
```

### 代码组织（app.js，约 611 行）

JavaScript 按功能区域组织，每个区域以注释分隔线标记：

| 区域 | 行号 | 说明 |
|------|------|------|
| 数据配置区 | 1-24 | 省份缴费基数、退休延迟配置、计发月数表 |
| 工具函数区 | 26-81 | 金额格式化、年龄计算、计发月数查询 |
| LocalStorage 区 | 83-141 | 自动保存/加载表单数据 |
| UI 交互区 | 143-226 | 标签切换(`switchTab`)、动态表单选项、高级选项展开收起 |
| 退休计算区 | 228-417 | 核心退休年龄逻辑（延迟政策、特殊工种、病退） |
| 养老金计算区 | 419-602 | 养老金公式、未来预测、导出结果 |
| 初始化 | 604-611 | DOMContentLoaded 事件监听 |

### 核心业务逻辑

**渐进式延迟退休政策（2025年起实施）：**

```javascript
const retirementConfig = {
    male: { startAge: 60, startYear: 1965, maxAge: 63, interval: 4, maxDelay: 36 },
    femaleCadre: { startAge: 55, startYear: 1970, maxAge: 58, interval: 4, maxDelay: 36 },
    femaleWorker: { startAge: 50, startYear: 1975, maxAge: 55, interval: 2, maxDelay: 60 }
};

// 延迟月数计算
function calculateDelayMonths(birthYear, birthMonth, config) {
    if (birthYear < config.startYear) return 0;
    const monthsSinceStart = (birthYear - config.startYear) * 12 + (birthMonth - 1);
    const delayMonths = Math.floor(monthsSinceStart / config.interval);
    return Math.min(delayMonths, config.maxDelay);
}
```

退休日期计算使用日期对象逐月累加方式，正确处理月份跨年进位和月末日期溢出（如2月30日 → 2月28日）。

**养老金计算公式：**
- 基础养老金: `(全省上年度职工月平均工资 + 本人指数化月平均缴费工资) ÷ 2 × 缴费年限 × 1%`
- 个人账户养老金: `个人账户储存额 ÷ 计发月数`
- 过渡性养老金（1996年前参加工作）: `全省上年度职工月平均工资 × 平均缴费指数 × 视同缴费年限 × 1.3%`

计发月数参考: 45岁(216), 50岁(195), 55岁(170), 60岁(139), 63岁(117)

### 瑞士风格设计系统

色彩变量（styles.css）：
```css
--swiss-black: #0a0a0a      /* 主文字 */
--swiss-white: #ffffff      /* 背景 */
--swiss-accent: #e30613     /* 瑞士红强调色 */
--swiss-gray-500: #737373   /* 次要文字 */
```

设计规范：
- 8px 基线网格
- 2-4px 实线边框，无圆角或极小圆角
- 按钮悬停时偏移 + 投影效果
- 左侧彩色边框条标识重要内容
- 无渐变、无装饰性元素

### 测试

测试套件位于 `src/test.js`，可在浏览器控制台运行（`runAllTests()`）或通过 Node.js（`node src/test.js`）。
测试覆盖：延迟退休计算（19个）、养老金计算（16个）、缴费基数验证（3个）、边界条件（5个）、数据格式化（4个）。

### 重要说明

- **无 package.json 或构建系统** - 纯静态网站，文件直接通过 `<script>` 和 `<link>` 加载
- 省份数据包含：北京、上海、广东、江苏、浙江、山东和"其他"
- 表单数据自动保存到 LocalStorage，每次 `onchange` 事件触发 `saveToLocal()`
- 初始加载时出生日期默认设为30年前（`new Date(); setFullYear(getFullYear() - 30)`）
- 退休类型：正常退休、特殊工种（提前）、病退（提前）
- 导出功能通过 Blob/URL.createObjectURL 生成 .txt 文件
- **注意**: `switchTab(tabName)` 函数依赖全局 `window.event` 对象（`event.target`），调用时确保事件上下文有效

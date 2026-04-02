# 踩坑记录 (Lessons Learned)

记录 AI 编程过程中遇到的问题、原因分析和解决方案，避免重复踩坑。

---

## LL-001: 延迟退休计算边界错误

**问题**: 1970年1月出生的男性，计算结果延迟了1个月，实际应该正好60岁。

**原因**: 算法使用 `monthsSinceStart / 4` 时，1970年1月的计算为 `(1970-1965)*12 + 1 = 61` 个月，`61/4 = 15.25`，floor 后得 15 个月延迟，实际应该 0 延迟。

**修复**: 使用 `Math.max(0, monthsSinceStart - 1)` 先减去1个月，确保 1965年1月正好是起点。

```javascript
// 修复前
const delayMonths = Math.floor(monthsSinceStart / 4);

// 修复后  
const delayMonths = Math.floor(Math.max(0, monthsSinceStart) / 4);
```

**验证**: 添加测试用例 TC-003: 男, 1965-01-01 → 60岁0月

---

## LL-002: CSS 在移动端显示错乱

**问题**: 表单在手机上显示时，两个字段挤在一起，无法看清。

**原因**: 使用了 `grid-template-columns: 1fr 1fr`，在小屏幕上没有换行。

**修复**: 使用响应式网格
```css
.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}
```

**经验**: 所有网格布局都要考虑移动端，最小宽度设为 280px 左右。

---

## LL-003: 日期计算跨月错误

**问题**: 计算退休日期时，2月29日出生的人，在非闰年计算出错。

**原因**: JavaScript Date 对象会自动进位，`new Date(2025, 1, 29)` 会变成 2025年3月1日。

**修复**: 添加日期有效性检查
```javascript
function addYears(date, years) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    // 处理 2月29日
    if (date.getMonth() === 1 && date.getDate() === 29) {
        if (result.getMonth() !== 1) {
            result.setDate(28); // 退到 2月28日
        }
    }
    return result;
}
```

---

## LL-004: AI 生成代码时参数传递遗漏

**问题**: AI 在生成计算函数时，经常遗漏 `gender` 和 `jobType` 的判断，导致逻辑不完整。

**模式**: AI 倾向于先写骨架，再填逻辑，但有时会忘记回 filling 某些分支。

**解决方案**:
1. 明确要求 AI "确保处理所有分支：男性、女性干部、女性工人"
2. 让 AI 先写伪代码，确认后再转正式代码
3. 代码审查时重点检查 switch/if-else 的完整性

---

## LL-005: 数字格式化丢失精度

**问题**: 养老金计算结果显示 `¥1234.5` 而不是 `¥1234.50`，或者出现 `¥1234.567890123` 的长小数。

**原因**: JavaScript 浮点数精度问题，以及 toFixed() 使用不当。

**修复**:
```javascript
// 统一格式化函数
function formatMoney(amount) {
    return '¥' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 使用
result.textContent = formatMoney(totalMonthlyPension);
```

---

## LL-006: 事件监听器重复绑定

**问题**: 每次点击"计算"按钮，结果会叠加显示多次。

**原因**: AI 在生成代码时，可能在每次渲染时都重新绑定了事件监听器。

**修复**: 使用事件委托，或确保绑定只执行一次
```javascript
// 好的做法：事件委托
document.getElementById('container').addEventListener('click', function(e) {
    if (e.target.id === 'calculateBtn') {
        calculate();
    }
});

// 避免：重复绑定
document.getElementById('calculateBtn').addEventListener('click', calculate); // 如果这段代码执行多次就完了
```

---

## LL-007: 提示词过于笼统导致返工

**问题**: 说"写个好看的界面"，结果 AI 生成了自己不满意的颜色和布局，需要大幅修改。

**解决方案**: 使用具体、可量化的描述
```
❌ 差的提示："写个好看的界面"
✅ 好的提示："使用深蓝色渐变背景（#1a1a2e 到 #0f3460），
    白色卡片式布局，圆角 16px，
    参考 Ant Design 的表单风格"
```

---

## LL-008: 忘记处理空值和边界输入

**问题**: 用户不填某些字段直接点击计算，出现 NaN 或 undefined。

**模式**: AI 倾向于写"Happy Path"，忽略错误处理。

**解决方案**:
1. 在 Prompt 中明确要求 "处理所有空值和非法输入"
2. 在测试用例中包含边界情况
3. 代码审查时检查是否有 `if (!value)` 或 `parseFloat(value) || 0` 的处理

## LL-009: 延迟月数计算常见错误

**常见错误列表**：

1. **延迟月数计算偏差**：1965-01 应延迟 0 个月，不是 1 个月
2. **女性身份类型混淆**：干部 55 岁起延，工人 50 岁起延
3. **计发月数固定**：应根据退休年龄动态获取（45岁216，50岁195，55岁170，60岁139）
4. **特殊工种最低年龄**：男性 55 岁、女性 45 岁是硬性门槛
5. **缴费基数验证遗漏**：需要校验是否在省份规定的上下限范围内
6. **LocalStorage 键名冲突**：确保键名唯一，避免与其他应用冲突
7. **瑞士风格破坏**：不要随意添加圆角、渐变或阴影装饰

---

*记录日期: 2026-04-02*
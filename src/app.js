// ==================== Data Configuration ====================
const provinceData = {
    beijing: { base: 11297, upper: 33891, lower: 6782 },
    shanghai: { base: 12183, upper: 36549, lower: 7310 },
    guangdong: { base: 9147, upper: 26421, lower: 4528 },
    jiangsu: { base: 8873, upper: 24396, lower: 4494 },
    zhejiang: { base: 8922, upper: 24060, lower: 4812 },
    shandong: { base: 7060, upper: 21207, lower: 4242 },
    other: { base: 8000, upper: 24000, lower: 4000 }
};

const retirementConfig = {
    male: { startAge: 60, startYear: 1965, maxAge: 63, interval: 4, maxDelay: 36 },
    femaleCadre: { startAge: 55, startYear: 1970, maxAge: 58, interval: 4, maxDelay: 36 },
    femaleWorker: { startAge: 50, startYear: 1975, maxAge: 55, interval: 2, maxDelay: 60 }
};

const pensionMonthsTable = {
    40: 233, 41: 230, 42: 226, 43: 223, 44: 220, 45: 216,
    46: 212, 47: 208, 48: 204, 49: 199, 50: 195, 51: 190,
    52: 185, 53: 180, 54: 175, 55: 170, 56: 164, 57: 158,
    58: 152, 59: 145, 60: 139, 61: 132, 62: 125, 63: 117,
    64: 109, 65: 101, 66: 93, 67: 84, 68: 75, 69: 65, 70: 56
};

// ==================== Utility Functions ====================
function formatMoney(amount) {
    if (isNaN(amount) || amount < 0) return '0.00';
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateAgeDetailed(birthDate) {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months, days };
}

function formatAge(years, months) {
    if (years === 0 && months === 0) return '0个月';
    let result = '';
    if (years > 0) result += years + '年';
    if (months > 0) result += months + '个月';
    return result;
}

function getPensionMonths(retirementAge) {
    const ageInt = Math.floor(retirementAge);
    return pensionMonthsTable[ageInt] || 139;
}

function getSpecialJobName(jobType) {
    const names = {
        heavy: '繁重体力劳动',
        toxic: '有毒有害工作',
        highaltitude: '高空作业',
        underground: '井下/高温作业'
    };
    return names[jobType] || '特殊工种';
}

// ==================== LocalStorage ====================
function saveToLocal() {
    const data = {
        gender: document.getElementById('gender').value,
        birthDate: document.getElementById('birthDate').value,
        identityType: document.getElementById('identityType').value,
        retirementType: document.getElementById('retirementType').value,
        specialJob: document.getElementById('specialJob').value,
        specialJobYears: document.getElementById('specialJobYears').value,
        disabilityLevel: document.getElementById('disabilityLevel').value,
        pensionProvince: document.getElementById('pensionProvince').value,
        avgBase: document.getElementById('avgBase').value,
        pensionYears: document.getElementById('pensionYears').value,
        personalAccount: document.getElementById('personalAccount').value,
        retirementAgeForPension: document.getElementById('retirementAgeForPension').value,
        hasTransitionPension: document.getElementById('hasTransitionPension').checked,
        deemedYears: document.getElementById('deemedYears').value,
        avgIndex: document.getElementById('avgIndex').value,
        lifeExpectancy: document.getElementById('lifeExpectancy').value,
        pensionGrowthRate: document.getElementById('pensionGrowthRate').value
    };
    localStorage.setItem('retirementCalculatorData', JSON.stringify(data));
}

function loadFromLocal() {
    const saved = localStorage.getItem('retirementCalculatorData');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        if (data.gender) document.getElementById('gender').value = data.gender;
        if (data.birthDate) document.getElementById('birthDate').value = data.birthDate;
        if (data.retirementType) document.getElementById('retirementType').value = data.retirementType;
        if (data.specialJob) document.getElementById('specialJob').value = data.specialJob;
        if (data.specialJobYears) document.getElementById('specialJobYears').value = data.specialJobYears;
        if (data.disabilityLevel) document.getElementById('disabilityLevel').value = data.disabilityLevel;
        if (data.pensionProvince) document.getElementById('pensionProvince').value = data.pensionProvince;
        if (data.avgBase) document.getElementById('avgBase').value = data.avgBase;
        if (data.pensionYears) document.getElementById('pensionYears').value = data.pensionYears;
        if (data.personalAccount) document.getElementById('personalAccount').value = data.personalAccount;
        if (data.retirementAgeForPension) document.getElementById('retirementAgeForPension').value = data.retirementAgeForPension;
        if (data.hasTransitionPension) document.getElementById('hasTransitionPension').checked = true;
        if (data.deemedYears) document.getElementById('deemedYears').value = data.deemedYears;
        if (data.avgIndex) document.getElementById('avgIndex').value = data.avgIndex;
        if (data.lifeExpectancy) document.getElementById('lifeExpectancy').value = data.lifeExpectancy;
        if (data.pensionGrowthRate) document.getElementById('pensionGrowthRate').value = data.pensionGrowthRate;

        updateIdentityTypeOptions();
        if (data.identityType) {
            document.getElementById('identityType').value = data.identityType;
        }

        toggleRetirementType();
        toggleTransitionOptions();
        if (data.pensionProvince) updatePensionBase();
    } catch (e) {
        console.error('加载保存数据失败', e);
    }
}

// ==================== Tab Switching ====================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active');
        el.setAttribute('aria-selected', 'false');
    });
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    event.target.setAttribute('aria-selected', 'true');
}

// ==================== Identity Type Options ====================
function updateIdentityTypeOptions() {
    const gender = document.getElementById('gender').value;
    const identityTypeSelect = document.getElementById('identityType');
    const requiredSpan = document.getElementById('identityTypeRequired');

    identityTypeSelect.innerHTML = '';

    if (gender === 'male') {
        const option = document.createElement('option');
        option.value = 'male_worker';
        option.textContent = '男性职工';
        identityTypeSelect.appendChild(option);
        if (requiredSpan) requiredSpan.style.display = 'none';
    } else if (gender === 'female') {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择身份类型';
        identityTypeSelect.appendChild(defaultOption);

        const cadreOption = document.createElement('option');
        cadreOption.value = 'cadre';
        cadreOption.textContent = '女性干部（55岁退休）';
        identityTypeSelect.appendChild(cadreOption);

        const workerOption = document.createElement('option');
        workerOption.value = 'worker';
        workerOption.textContent = '女性工人（50岁退休）';
        identityTypeSelect.appendChild(workerOption);

        const flexibleOption = document.createElement('option');
        flexibleOption.value = 'flexible';
        flexibleOption.textContent = '灵活就业人员（50岁退休）';
        identityTypeSelect.appendChild(flexibleOption);

        if (requiredSpan) requiredSpan.style.display = 'inline';
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请先选择性别';
        identityTypeSelect.appendChild(defaultOption);
        if (requiredSpan) requiredSpan.style.display = 'inline';
    }
}

// ==================== Toggle Options ====================
function toggleRetirementType() {
    const type = document.getElementById('retirementType').value;
    const specialRow = document.getElementById('specialJobRow');
    const sickRow = document.getElementById('sickRow');

    specialRow.style.display = type === 'special' ? 'grid' : 'none';
    sickRow.style.display = type === 'sick' ? 'grid' : 'none';
}

function toggleAdvancedOptions() {
    const advanced = document.getElementById('advancedOptions');
    const text = document.getElementById('advancedToggleText');
    if (advanced.classList.contains('show')) {
        advanced.classList.remove('show');
        text.textContent = '显示高级选项 ▼';
    } else {
        advanced.classList.add('show');
        text.textContent = '隐藏高级选项 ▲';
    }
}

function toggleTransitionOptions() {
    const hasTransition = document.getElementById('hasTransitionPension').checked;
    const options = document.getElementById('transitionOptions');
    options.classList.toggle('show', hasTransition);
}

// ==================== Retirement Calculation ====================
function calculateDelayMonths(birthYear, birthMonth, config) {
    if (birthYear < config.startYear) {
        return 0;
    }
    const monthsSinceStart = (birthYear - config.startYear) * 12 + (birthMonth - 1);
    if (monthsSinceStart <= 0) {
        return 0;
    }
    let delayMonths = Math.floor(monthsSinceStart / config.interval);
    delayMonths = Math.min(delayMonths, config.maxDelay);
    return Math.max(0, delayMonths);
}

function calculateRetirement() {
    const gender = document.getElementById('gender').value;
    const birthDateStr = document.getElementById('birthDate').value;
    const identityType = document.getElementById('identityType').value;
    const retirementType = document.getElementById('retirementType').value;
    const specialJob = document.getElementById('specialJob').value;
    const specialJobYears = parseFloat(document.getElementById('specialJobYears').value) || 0;
    const disabilityLevel = document.getElementById('disabilityLevel').value;

    if (!gender) { alert('请选择性别'); return; }
    if (!birthDateStr) { alert('请选择出生日期'); return; }
    if (!identityType) { alert('请选择身份类型'); return; }

    const birthDate = new Date(birthDateStr);
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth() + 1;
    const ageDetail = calculateAgeDetailed(birthDate);

    let config;
    if (gender === 'male' || identityType === 'male_worker') {
        config = retirementConfig.male;
    } else {
        if (identityType === 'worker' || identityType === 'flexible') {
            config = retirementConfig.femaleWorker;
        } else {
            config = retirementConfig.femaleCadre;
        }
    }

    const delayMonths = calculateDelayMonths(birthYear, birthMonth, config);
    const finalRetirementAge = config.startAge + delayMonths / 12;

    let specialReduction = 0;
    let specialInfo = '';
    let actualRetirementAge = finalRetirementAge;

    if (retirementType === 'special' && specialJobYears >= 8) {
        let requiredYears = 8;
        if (specialJob === 'heavy') requiredYears = 10;
        else if (specialJob === 'toxic') requiredYears = 8;
        else if (specialJob === 'highaltitude') requiredYears = 10;
        else if (specialJob === 'underground') requiredYears = 9;

        if (specialJobYears >= requiredYears) {
            const minAgeForSpecial = gender === 'male' ? 55 : 45;
            specialReduction = Math.max(0, finalRetirementAge - minAgeForSpecial);
            actualRetirementAge = Math.max(minAgeForSpecial, finalRetirementAge - specialReduction);
            specialInfo = `符合特殊工种提前退休条件（${getSpecialJobName(specialJob)}满${requiredYears}年）`;
        } else {
            specialInfo = `特殊工种年限不足（${specialJobYears}年，需满${requiredYears}年）`;
        }
    } else if (retirementType === 'sick' && disabilityLevel === 'complete') {
        const minAgeForSick = gender === 'male' ? 50 : 45;
        if (finalRetirementAge >= minAgeForSick) {
            specialReduction = finalRetirementAge - minAgeForSick;
            actualRetirementAge = minAgeForSick;
            specialInfo = '符合因病提前退休条件（完全丧失劳动能力）';
        } else {
            specialInfo = `年龄不足病退要求（需满${minAgeForSick}岁）`;
        }
    }

    const retirementYear = birthYear + Math.floor(actualRetirementAge);
    const retirementMonth = birthMonth - 1 + Math.round((actualRetirementAge % 1) * 12);
    const retirementDate = new Date(retirementYear, retirementMonth % 12, birthDate.getDate());
    if (retirementDate.getMonth() !== retirementMonth % 12) {
        retirementDate.setDate(0);
    }

    const today = new Date();
    let yearsToRetire = retirementDate.getFullYear() - today.getFullYear();
    let monthsToRetire = retirementDate.getMonth() - today.getMonth();
    if (monthsToRetire < 0) {
        yearsToRetire--;
        monthsToRetire += 12;
    }

    document.getElementById('currentAge').textContent = formatAge(ageDetail.years, ageDetail.months);
    document.getElementById('originalRetirementAge').textContent = config.startAge + ' 岁';
    document.getElementById('delayedRetirementAge').textContent = actualRetirementAge.toFixed(2) + ' 岁';
    document.getElementById('retirementDate').textContent = retirementDate.toLocaleDateString('zh-CN');

    if (yearsToRetire < 0 || (yearsToRetire === 0 && monthsToRetire < 0)) {
        document.getElementById('yearsToRetirement').textContent = '已退休';
    } else {
        document.getElementById('yearsToRetirement').textContent = formatAge(yearsToRetire, monthsToRetire);
    }

    const delayYears = Math.floor(delayMonths / 12);
    const delayRemainderMonths = delayMonths % 12;
    document.getElementById('delayMonths').textContent = delayMonths + ' 个月' +
        (delayYears > 0 ? `（约${delayYears}年${delayRemainderMonths}个月）` : '');

    const infoDiv = document.getElementById('retirementInfo');
    let html = '';

    if (specialInfo) {
        const boxClass = specialReduction > 0 ? 'success-box' : 'warning-box';
        html += `<div class="${boxClass}">${specialInfo}</div>`;
    }

    if (delayMonths > 0 && specialReduction === 0) {
        html += `<div class="info-box">根据2025年实施的渐进式延迟退休政策，您的退休年龄将延迟 ${delayMonths} 个月（从${config.startAge}岁延迟至${finalRetirementAge.toFixed(2)}岁）</div>`;
    } else if (delayMonths > 0 && specialReduction > 0) {
        html += `<div class="info-box">原延迟退休年龄为 ${finalRetirementAge.toFixed(2)} 岁（延迟${delayMonths}个月），因符合提前退休条件，实际退休年龄为 ${actualRetirementAge.toFixed(2)} 岁</div>`;
    } else if (specialReduction === 0) {
        html += `<div class="info-box">您的出生日期不受延迟退休政策影响，按原法定年龄 ${config.startAge} 岁退休</div>`;
    }

    infoDiv.innerHTML = html;
    document.getElementById('retirementResults').classList.add('show');

    window.lastRetirementResult = {
        birthDate: birthDateStr,
        gender: gender,
        identityType: identityType,
        originalAge: config.startAge,
        delayedAge: finalRetirementAge.toFixed(2),
        actualAge: actualRetirementAge.toFixed(2),
        retirementDate: retirementDate.toLocaleDateString('zh-CN'),
        delayMonths: delayMonths
    };
}

function resetRetirementForm() {
    document.getElementById('gender').value = '';
    document.getElementById('birthDate').value = '';
    document.getElementById('retirementType').value = 'normal';
    document.getElementById('specialJob').value = 'heavy';
    document.getElementById('specialJobYears').value = '';
    document.getElementById('disabilityLevel').value = 'complete';
    document.getElementById('retirementResults').classList.remove('show');
    updateIdentityTypeOptions();
    toggleRetirementType();
    saveToLocal();
}

function exportRetirementResult() {
    if (!window.lastRetirementResult) {
        alert('请先计算退休信息');
        return;
    }
    const result = window.lastRetirementResult;
    const content = `退休计算结果
====================
出生日期：${result.birthDate}
性别：${result.gender === 'male' ? '男性' : '女性'}
原法定退休年龄：${result.originalAge}岁
延迟后退休年龄：${result.delayedAge}岁
实际退休年龄：${result.actualAge}岁
预计退休日期：${result.retirementDate}
延迟月数：${result.delayMonths}个月

生成时间：${new Date().toLocaleString('zh-CN')}
`;
    downloadFile(content, '退休计算结果.txt');
}

// ==================== Pension Calculation ====================
function updatePensionBase() {
    const province = document.getElementById('pensionProvince').value;
    const hint = document.getElementById('provinceHint');

    if (province && provinceData[province]) {
        const data = provinceData[province];
        document.getElementById('avgBase').value = data.base;
        hint.innerHTML = `计发基数：${data.base}元 | 缴费上限：${data.upper}元 | 缴费下限：${data.lower}元`;
        hint.className = 'input-hint success';
        validateBase();
    } else {
        hint.textContent = '';
    }
}

function validateBase() {
    const province = document.getElementById('pensionProvince').value;
    const base = parseFloat(document.getElementById('avgBase').value) || 0;
    const hint = document.getElementById('baseHint');

    if (!province || !provinceData[province]) return;

    const data = provinceData[province];
    if (base < data.lower) {
        hint.innerHTML = `⚠ 低于缴费下限（${data.lower}元），实际按${data.lower}元计算`;
        hint.className = 'input-hint error';
    } else if (base > data.upper) {
        hint.innerHTML = `⚠ 超过缴费上限（${data.upper}元），实际按${data.upper}元计算`;
        hint.className = 'input-hint error';
    } else {
        hint.innerHTML = `✓ 缴费基数在合理范围内`;
        hint.className = 'input-hint success';
    }
}

function calculatePension() {
    const province = document.getElementById('pensionProvince').value;
    let avgBase = parseFloat(document.getElementById('avgBase').value) || 0;
    const years = parseFloat(document.getElementById('pensionYears').value) || 0;
    const personalAccount = parseFloat(document.getElementById('personalAccount').value) || 0;
    const retirementAge = parseFloat(document.getElementById('retirementAgeForPension').value) || 60;
    const hasTransition = document.getElementById('hasTransitionPension').checked;
    const deemedYears = parseFloat(document.getElementById('deemedYears').value) || 0;
    const avgIndex = parseFloat(document.getElementById('avgIndex').value) || 1.0;
    const growthRate = parseFloat(document.getElementById('pensionGrowthRate').value) || 3;

    if (!province) { alert('请选择所在省份'); return; }
    if (!avgBase || avgBase <= 0) { alert('请填写平均缴费基数'); return; }
    if (!years || years <= 0) { alert('请填写缴费年限'); return; }
    if (personalAccount < 0) { alert('个人账户余额不能为负数'); return; }

    const provinceDataItem = provinceData[province];
    const provinceBase = provinceDataItem ? provinceDataItem.base : 8000;

    if (avgBase < provinceDataItem.lower) avgBase = provinceDataItem.lower;
    if (avgBase > provinceDataItem.upper) avgBase = provinceDataItem.upper;

    const basicPension = (provinceBase + avgBase) / 2 * years * 0.01;
    const pensionMonths = getPensionMonths(retirementAge);
    const personalPension = personalAccount / pensionMonths;

    let transitionPension = 0;
    if (hasTransition && deemedYears > 0) {
        transitionPension = provinceBase * avgIndex * deemedYears * 0.013;
    }

    const totalMonthly = basicPension + personalPension + transitionPension;

    document.getElementById('basicPension').textContent = '¥' + formatMoney(basicPension);
    document.getElementById('personalPension').textContent = '¥' + formatMoney(personalPension) + `（计发月数：${pensionMonths}）`;

    if (hasTransition && deemedYears > 0) {
        document.getElementById('transitionPension').textContent = '¥' + formatMoney(transitionPension);
        document.getElementById('transitionPensionItem').style.display = 'block';
    } else {
        document.getElementById('transitionPensionItem').style.display = 'none';
    }

    document.getElementById('totalMonthlyPension').textContent = '¥' + formatMoney(totalMonthly);
    document.getElementById('totalYearlyPension').textContent = '¥' + formatMoney(totalMonthly * 12);

    const replacementRate = (totalMonthly / avgBase * 100).toFixed(1);
    document.getElementById('replacementRate').textContent = replacementRate + '%';

    const projectionDiv = document.getElementById('pensionProjection');
    let projectionHtml = '<div style="margin-top: 24px;"><h4 style="margin-bottom: 16px; color: var(--on-surface); font-size: 18px; font-weight: 500;">未来养老金预测（考虑年度调整）</h4>';
    projectionHtml += '<table class="reference-table"><thead><tr><th>年份</th><th>预计月养老金</th><th>累计领取</th></tr></thead><tbody>';

    let projectedPension = totalMonthly;
    let accumulated = 0;
    for (let i = 0; i <= 30; i += 5) {
        if (i > 0) {
            projectedPension = projectedPension * Math.pow(1 + growthRate / 100, 5);
        }
        accumulated += projectedPension * 12 * (i === 0 ? 0 : 5);
        projectionHtml += `<tr><td>退休+${i}年</td><td>¥${formatMoney(projectedPension)}</td><td>¥${formatMoney(accumulated)}</td></tr>`;
    }
    projectionHtml += '</tbody></table></div>';
    projectionDiv.innerHTML = projectionHtml;

    const infoDiv = document.getElementById('pensionInfo');
    let infoHtml = '';
    if (years < 15) {
        infoHtml += `<div class="error-box">缴费年限不足15年（当前${years}年），无法按月领取养老金。建议继续缴费至满15年。</div>`;
    } else if (years < 20) {
        infoHtml += `<div class="warning-box">缴费年限刚满15年，养老金水平较低。建议继续缴费以提高退休待遇。</div>`;
    } else {
        infoHtml += `<div class="success-box">缴费年限已满15年，符合领取养老金条件。养老金替代率约为 ${replacementRate}%。</div>`;
    }
    infoDiv.innerHTML = infoHtml;

    document.getElementById('pensionResults').classList.add('show');

    window.lastPensionResult = {
        province: province,
        provinceBase: provinceBase,
        avgBase: avgBase,
        years: years,
        personalAccount: personalAccount,
        retirementAge: retirementAge,
        basicPension: basicPension,
        personalPension: personalPension,
        transitionPension: transitionPension,
        totalMonthly: totalMonthly,
        replacementRate: replacementRate
    };
}

function resetPensionForm() {
    document.getElementById('pensionProvince').value = '';
    document.getElementById('avgBase').value = '';
    document.getElementById('pensionYears').value = '';
    document.getElementById('personalAccount').value = '';
    document.getElementById('retirementAgeForPension').value = '60';
    document.getElementById('hasTransitionPension').checked = false;
    document.getElementById('deemedYears').value = '';
    document.getElementById('avgIndex').value = '1.0';
    document.getElementById('lifeExpectancy').value = '80';
    document.getElementById('pensionGrowthRate').value = '3';
    document.getElementById('provinceHint').textContent = '';
    document.getElementById('baseHint').textContent = '选择省份后自动填充计发基数';
    document.getElementById('baseHint').className = 'input-hint';
    document.getElementById('pensionResults').classList.remove('show');
    toggleTransitionOptions();
    saveToLocal();
}

function exportPensionResult() {
    if (!window.lastPensionResult) {
        alert('请先计算养老金');
        return;
    }
    const r = window.lastPensionResult;
    const content = `养老金测算结果
====================
省份：${r.province}
养老金计发基数：${r.provinceBase}元
平均缴费基数：${r.avgBase}元
缴费年限：${r.years}年
个人账户余额：${r.personalAccount}元
退休年龄：${r.retirementAge}岁

计算结果：
基础养老金：¥${formatMoney(r.basicPension)}/月
个人账户养老金：¥${formatMoney(r.personalPension)}/月
${r.transitionPension > 0 ? `过渡性养老金：¥${formatMoney(r.transitionPension)}/月
` : ''}月养老金合计：¥${formatMoney(r.totalMonthly)}/月
年养老金合计：¥${formatMoney(r.totalMonthly * 12)}/年
养老金替代率：${r.replacementRate}%

生成时间：${new Date().toLocaleString('zh-CN')}
`;
    downloadFile(content, '养老金测算结果.txt');
}

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', function() {
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 30);
    document.getElementById('birthDate').valueAsDate = defaultDate;
    updateIdentityTypeOptions();
    loadFromLocal();
});

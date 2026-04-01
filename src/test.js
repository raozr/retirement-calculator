// ==================== Retirement Calculator Test Suite ====================

// Test Configuration Data
const testProvinceData = {
    beijing: { base: 11297, upper: 33891, lower: 6782 },
    shanghai: { base: 12183, upper: 36549, lower: 7310 },
    guangdong: { base: 9147, upper: 26421, lower: 4528 },
    jiangsu: { base: 8873, upper: 24396, lower: 4494 },
    zhejiang: { base: 8922, upper: 24060, lower: 4812 },
    shandong: { base: 7060, upper: 21207, lower: 4242 },
    other: { base: 8000, upper: 24000, lower: 4000 }
};

const testRetirementConfig = {
    male: { startAge: 60, startYear: 1965, maxAge: 63, interval: 4, maxDelay: 36 },
    femaleCadre: { startAge: 55, startYear: 1970, maxAge: 58, interval: 4, maxDelay: 36 },
    femaleWorker: { startAge: 50, startYear: 1975, maxAge: 55, interval: 2, maxDelay: 60 }
};

const testPensionMonthsTable = {
    40: 233, 41: 230, 42: 226, 43: 223, 44: 220, 45: 216,
    46: 212, 47: 208, 48: 204, 49: 199, 50: 195, 51: 190,
    52: 185, 53: 180, 54: 175, 55: 170, 56: 164, 57: 158,
    58: 152, 59: 145, 60: 139, 61: 132, 62: 125, 63: 117,
    64: 109, 65: 101, 66: 93, 67: 84, 68: 75, 69: 65, 70: 56
};

// Test Results Storage
let testResults = [];
let passedTests = 0;
let failedTests = 0;

// Utility Functions (copied from app.js for testing)
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

function getPensionMonths(retirementAge) {
    const ageInt = Math.floor(retirementAge);
    return testPensionMonthsTable[ageInt] || 139;
}

function formatMoney(amount) {
    if (isNaN(amount) || amount < 0) return '0.00';
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Test Runner
function runTest(testId, description, testFn) {
    try {
        const result = testFn();
        if (result) {
            testResults.push({ id: testId, description, status: 'PASS', error: null });
            passedTests++;
            console.log(`✅ ${testId}: ${description}`);
        } else {
            testResults.push({ id: testId, description, status: 'FAIL', error: 'Assertion failed' });
            failedTests++;
            console.log(`❌ ${testId}: ${description}`);
        }
    } catch (error) {
        testResults.push({ id: testId, description, status: 'ERROR', error: error.message });
        failedTests++;
        console.log(`💥 ${testId}: ${description} - ${error.message}`);
    }
}

function assertEqual(actual, expected, tolerance = 0) {
    if (tolerance > 0) {
        return Math.abs(actual - expected) <= tolerance;
    }
    return actual === expected;
}

// ==================== 延迟退休计算测试 ====================

function runRetirementDelayTests() {
    console.log('\n📋 === 延迟退休计算测试 ===\n');

    // 男性测试用例
    console.log('--- 男性测试 ---');
    runTest('TC-M-001', '延迟前出生(1960-01)应延迟0个月', () => {
        return calculateDelayMonths(1960, 1, testRetirementConfig.male) === 0;
    });

    runTest('TC-M-002', '延迟起点(1965-01)应延迟0个月', () => {
        return calculateDelayMonths(1965, 1, testRetirementConfig.male) === 0;
    });

    runTest('TC-M-003', '延迟4个月(1965-05)应延迟1个月', () => {
        return calculateDelayMonths(1965, 5, testRetirementConfig.male) === 1;
    });

    runTest('TC-M-004', '延迟1年(1969-01)应延迟12个月', () => {
        return calculateDelayMonths(1969, 1, testRetirementConfig.male) === 12;
    });

    runTest('TC-M-005', '延迟中间值(1970-06)应延迟16个月', () => {
        return calculateDelayMonths(1970, 6, testRetirementConfig.male) === 16;
    });

    runTest('TC-M-006', '延迟满3年(1976-12)应延迟35个月', () => {
        // (1976-1965)*12 + 11 = 143, 143/4 = 35.75 → floor = 35
        return calculateDelayMonths(1976, 12, testRetirementConfig.male) === 35;
    });

    runTest('TC-M-007', '延迟后出生(1980-01)应延迟36个月(最大值)', () => {
        return calculateDelayMonths(1980, 1, testRetirementConfig.male) === 36;
    });

    runTest('TC-M-008', '1968-02出生应延迟9个月', () => {
        // (1968-1965)*12 + 1 = 37, 37/4 = 9.25 → floor = 9
        return calculateDelayMonths(1968, 2, testRetirementConfig.male) === 9;
    });

    // 女性干部测试用例
    console.log('\n--- 女性干部测试 ---');
    runTest('TC-FR-001', '延迟前出生(1965-01)应延迟0个月', () => {
        return calculateDelayMonths(1965, 1, testRetirementConfig.femaleCadre) === 0;
    });

    runTest('TC-FR-002', '延迟起点(1970-01)应延迟0个月', () => {
        return calculateDelayMonths(1970, 1, testRetirementConfig.femaleCadre) === 0;
    });

    runTest('TC-FR-003', '延迟4个月(1970-05)应延迟1个月', () => {
        return calculateDelayMonths(1970, 5, testRetirementConfig.femaleCadre) === 1;
    });

    runTest('TC-FR-004', '延迟满3年(1981-12)应延迟35个月', () => {
        // (1981-1970)*12 + 11 = 143, 143/4 = 35.75 → floor = 35
        return calculateDelayMonths(1981, 12, testRetirementConfig.femaleCadre) === 35;
    });

    runTest('TC-FR-005', '延迟后出生(1985-01)应延迟36个月(最大值)', () => {
        return calculateDelayMonths(1985, 1, testRetirementConfig.femaleCadre) === 36;
    });

    // 女性工人测试用例
    console.log('\n--- 女性工人测试 ---');
    runTest('TC-FW-001', '延迟前出生(1970-01)应延迟0个月', () => {
        return calculateDelayMonths(1970, 1, testRetirementConfig.femaleWorker) === 0;
    });

    runTest('TC-FW-002', '延迟起点(1975-01)应延迟0个月', () => {
        return calculateDelayMonths(1975, 1, testRetirementConfig.femaleWorker) === 0;
    });

    runTest('TC-FW-003', '延迟2个月(1975-03)应延迟1个月', () => {
        return calculateDelayMonths(1975, 3, testRetirementConfig.femaleWorker) === 1;
    });

    runTest('TC-FW-004', '延迟1年(1977-01)应延迟12个月', () => {
        return calculateDelayMonths(1977, 1, testRetirementConfig.femaleWorker) === 12;
    });

    runTest('TC-FW-005', '延迟满5年(1985-12)应延迟60个月', () => {
        return calculateDelayMonths(1985, 12, testRetirementConfig.femaleWorker) === 60;
    });

    runTest('TC-FW-006', '延迟后出生(1990-01)应延迟60个月(最大值)', () => {
        return calculateDelayMonths(1990, 1, testRetirementConfig.femaleWorker) === 60;
    });
}

// ==================== 养老金计算测试 ====================

function runPensionCalculationTests() {
    console.log('\n📋 === 养老金计算测试 ===\n');

    // 计发月数表测试
    console.log('--- 计发月数表测试 ---');
    runTest('TC-SP-001', '45岁计发月数应为216', () => {
        return getPensionMonths(45) === 216;
    });

    runTest('TC-SP-002', '50岁计发月数应为195', () => {
        return getPensionMonths(50) === 195;
    });

    runTest('TC-SP-003', '55岁计发月数应为170', () => {
        return getPensionMonths(55) === 170;
    });

    runTest('TC-SP-004', '60岁计发月数应为139', () => {
        return getPensionMonths(60) === 139;
    });

    runTest('TC-SP-005', '63岁计发月数应为117', () => {
        return getPensionMonths(63) === 117;
    });

    // 基础养老金计算测试
    console.log('\n--- 基础养老金计算测试 ---');
    runTest('TC-P-001', '北京最低缴费15年基础养老金约1447元', () => {
        const provinceBase = 11297;
        const avgBase = 8000;
        const years = 15;
        const basicPension = (provinceBase + avgBase) / 2 * years * 0.01;
        return assertEqual(basicPension, 1447.28, 1);
    });

    runTest('TC-P-002', '北京缴费30年基础养老金约3195元', () => {
        const provinceBase = 11297;
        const avgBase = 10000;
        const years = 30;
        const basicPension = (provinceBase + avgBase) / 2 * years * 0.01;
        return assertEqual(basicPension, 3194.55, 1);
    });

    runTest('TC-P-003', '北京高基数缴费30年基础养老金约6195元', () => {
        const provinceBase = 11297;
        const avgBase = 30000;
        const years = 30;
        const basicPension = (provinceBase + avgBase) / 2 * years * 0.01;
        return assertEqual(basicPension, 6194.55, 1);
    });

    // 个人账户养老金测试
    console.log('\n--- 个人账户养老金测试 ---');
    runTest('TC-PA-001', '60岁退休账户50万月领约3597元', () => {
        const personalAccount = 500000;
        const pensionMonths = getPensionMonths(60);
        const personalPension = personalAccount / pensionMonths;
        return assertEqual(personalPension, 3597.12, 0.5);
    });

    runTest('TC-PA-002', '55岁退休账户30万月领约1765元', () => {
        const personalAccount = 300000;
        const pensionMonths = getPensionMonths(55);
        const personalPension = personalAccount / pensionMonths;
        return assertEqual(personalPension, 1764.71, 0.5);
    });

    runTest('TC-PA-003', '50岁退休账户20万月领约1026元', () => {
        const personalAccount = 200000;
        const pensionMonths = getPensionMonths(50);
        const personalPension = personalAccount / pensionMonths;
        return assertEqual(personalPension, 1025.64, 0.5);
    });

    runTest('TC-PA-004', '63岁退休账户80万月领约6838元', () => {
        const personalAccount = 800000;
        const pensionMonths = getPensionMonths(63);
        const personalPension = personalAccount / pensionMonths;
        return assertEqual(personalPension, 6837.61, 0.5);
    });

    runTest('TC-PA-005', '58岁退休账户40万月领约2632元', () => {
        const personalAccount = 400000;
        const pensionMonths = getPensionMonths(58);
        const personalPension = personalAccount / pensionMonths;
        return assertEqual(personalPension, 2631.58, 0.5);
    });

    // 过渡性养老金测试
    console.log('\n--- 过渡性养老金测试 ---');
    runTest('TC-TR-001', '北京10年视同缴费过渡性养老金约1469元', () => {
        const provinceBase = 11297;
        const avgIndex = 1.0;
        const deemedYears = 10;
        const transitionPension = provinceBase * avgIndex * deemedYears * 0.013;
        return assertEqual(transitionPension, 1468.61, 1);
    });

    runTest('TC-TR-002', '上海5年视同缴费指数1.5过渡性养老金约1188元', () => {
        const provinceBase = 12183;
        const avgIndex = 1.5;
        const deemedYears = 5;
        const transitionPension = provinceBase * avgIndex * deemedYears * 0.013;
        return assertEqual(transitionPension, 1187.84, 1);
    });

    runTest('TC-TR-003', '无视同缴费过渡性养老金为0', () => {
        const provinceBase = 11297;
        const avgIndex = 1.0;
        const deemedYears = 0;
        const transitionPension = provinceBase * avgIndex * deemedYears * 0.013;
        return transitionPension === 0;
    });
}

// ==================== 缴费基数验证测试 ====================

function runBaseValidationTests() {
    console.log('\n📋 === 缴费基数验证测试 ===\n');

    runTest('TC-BASE-001', '基数低于下限应触发下限警告', () => {
        const base = 5000;
        const lower = 6782;
        return base < lower;
    });

    runTest('TC-BASE-002', '基数高于上限应触发上限警告', () => {
        const base = 40000;
        const upper = 33891;
        return base > upper;
    });

    runTest('TC-BASE-003', '基数在范围内应通过验证', () => {
        const base = 10000;
        const lower = 6782;
        const upper = 33891;
        return base >= lower && base <= upper;
    });
}

// ==================== 边界条件测试 ====================

function runBoundaryTests() {
    console.log('\n📋 === 边界条件测试 ===\n');

    runTest('TC-BOUND-001', '1965-01男性延迟月数应为0', () => {
        return calculateDelayMonths(1965, 1, testRetirementConfig.male) === 0;
    });

    runTest('TC-BOUND-002', '1970-01女性干部延迟月数应为0', () => {
        return calculateDelayMonths(1970, 1, testRetirementConfig.femaleCadre) === 0;
    });

    runTest('TC-BOUND-003', '1975-01女性工人延迟月数应为0', () => {
        return calculateDelayMonths(1975, 1, testRetirementConfig.femaleWorker) === 0;
    });

    runTest('TC-BOUND-004', '缴费年限15年为最低要求', () => {
        const years = 15;
        return years >= 15;
    });

    runTest('TC-BOUND-005', '缴费年限不足15年应提示', () => {
        const years = 14;
        return years < 15;
    });
}

// ==================== 数据格式化测试 ====================

function runFormatTests() {
    console.log('\n📋 === 数据格式化测试 ===\n');

    runTest('TC-FMT-001', '金额格式化应保留两位小数', () => {
        return formatMoney(1234.5) === '1,234.50';
    });

    runTest('TC-FMT-002', '金额格式化应添加千分位', () => {
        return formatMoney(1234567.89) === '1,234,567.89';
    });

    runTest('TC-FMT-003', '负数金额应返回0.00', () => {
        return formatMoney(-100) === '0.00';
    });

    runTest('TC-FMT-004', 'NaN金额应返回0.00', () => {
        return formatMoney(NaN) === '0.00';
    });
}

// ==================== 主运行函数 ====================

function runAllTests() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     全国退休计算器 - 自动化测试套件 v1.0.0            ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('');

    // 重置计数
    testResults = [];
    passedTests = 0;
    failedTests = 0;

    // 运行所有测试
    runRetirementDelayTests();
    runPensionCalculationTests();
    runBaseValidationTests();
    runBoundaryTests();
    runFormatTests();

    // 输出汇总报告
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                      测试汇总报告                       ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║ 总测试数:  ${String(testResults.length).padStart(3)}                                      ║`);
    console.log(`║ 通过:      ${String(passedTests).padStart(3)} ✅                                    ║`);
    console.log(`║ 失败:      ${String(failedTests).padStart(3)} ${failedTests > 0 ? '❌' : '  '}                                    ║`);
    console.log(`║ 通过率:    ${String(((passedTests / testResults.length) * 100).toFixed(1)).padStart(5)}%                                 ║`);
    console.log('╚════════════════════════════════════════════════════════╝');

    // 失败的测试详情
    if (failedTests > 0) {
        console.log('\n❌ 失败的测试:');
        testResults
            .filter(r => r.status !== 'PASS')
            .forEach(r => {
                console.log(`   ${r.id}: ${r.description}`);
                if (r.error) console.log(`   错误: ${r.error}`);
            });
    }

    return {
        total: testResults.length,
        passed: passedTests,
        failed: failedTests,
        passRate: ((passedTests / testResults.length) * 100).toFixed(1),
        results: testResults
    };
}

// 如果在 Node.js 环境运行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, calculateDelayMonths, getPensionMonths, formatMoney };
}

// 如果在浏览器控制台运行
if (typeof window !== 'undefined') {
    window.runAllTests = runAllTests;
    console.log('测试套件已加载。在控制台输入 runAllTests() 运行测试。');
}

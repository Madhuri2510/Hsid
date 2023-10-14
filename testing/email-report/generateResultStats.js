const platform = require('./platform.json');
let platformName = process.argv[2].toUpperCase();
const resultStats =
  platformName === platform.browser
    ? require('../mochawesome-report/output.json')
    : require('../output/mochawesome.json');

const generatedResultStats = {
  moduleName: [],
  PassedTCs: [],
  FailedTCs: [],
  SkippedTCs: [],
  TotalTCs: [],
  TotalPassedTCs: 0,
  TotalFailedTCs: 0,
  TotalSkippedTCs: 0,
  SumOfTCs: 0,
  PassPercentage: 0,
};
let countOfPassedTCs = 0,
  countOfFailedTCs = 0,
  countOfSkippedTCs = 0,
  countOfTotalTCs = 0,
  chunk = 0;

while (chunk < 4) {
  if (chunk !== 0 && platformName !== platform.browser) {
    chunk++;
    continue;
  }
  for (
    let moduleCount = 0;
    moduleCount < resultStats.results[chunk].suites.length;
    moduleCount++
  ) {
    let moduleName = resultStats.results[chunk].suites[
      moduleCount
    ].title.replace(/OnStream |- Verification/g, '');
    generatedResultStats.moduleName.push(moduleName);
    for (
      let testCount = 0;
      testCount < resultStats.results[chunk].suites[moduleCount].tests.length;
      testCount++
    ) {
      let test =
        resultStats.results[chunk].suites[moduleCount].tests[testCount];
      if (test.pass === true) {
        countOfPassedTCs++;
      } else if (test.fail === true) {
        countOfFailedTCs++;
      } else if (test.pending === true) {
        countOfSkippedTCs++;
      } else if (test.duration !== 0 && test.skipped === true) {
        countOfFailedTCs++;
      }
    }
    generatedResultStats.PassedTCs.push(countOfPassedTCs);
    generatedResultStats.FailedTCs.push(countOfFailedTCs);
    generatedResultStats.SkippedTCs.push(countOfSkippedTCs);
    countOfTotalTCs = countOfPassedTCs + countOfFailedTCs + countOfSkippedTCs;
    generatedResultStats.TotalTCs.push(countOfTotalTCs);
    countOfPassedTCs = 0;
    countOfFailedTCs = 0;
    countOfSkippedTCs = 0;
    countOfTotalTCs = 0;
  }
  chunk++;
}

for (let i = 0; i < generatedResultStats.moduleName.length; i++) {
  generatedResultStats.TotalPassedTCs =
    generatedResultStats.TotalPassedTCs + generatedResultStats.PassedTCs[i];
  generatedResultStats.TotalFailedTCs =
    generatedResultStats.TotalFailedTCs + generatedResultStats.FailedTCs[i];
  generatedResultStats.TotalSkippedTCs =
    generatedResultStats.TotalSkippedTCs + generatedResultStats.SkippedTCs[i];
}

generatedResultStats.SumOfTCs =
  generatedResultStats.TotalPassedTCs +
  generatedResultStats.TotalFailedTCs +
  generatedResultStats.TotalSkippedTCs;

generatedResultStats.PassPercentage = (
  (generatedResultStats.TotalPassedTCs /
    (generatedResultStats.SumOfTCs - generatedResultStats.TotalSkippedTCs)) *
  100
).toFixed(2);

module.exports = generatedResultStats;

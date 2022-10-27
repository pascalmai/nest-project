// https://github.com/oleg-koval/excel-date-to-js/blob/master/index.js
export function formatExcelDate(excelDate: number) {
  const secondsInDay = 24 * 60 * 60;
  const missingLeapYearDay = secondsInDay * 1000;
  const delta = excelDate - (25567 + 2);
  const parsed = delta * missingLeapYearDay;

  const date = new Date(parsed);

  return (
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0')
  );
}

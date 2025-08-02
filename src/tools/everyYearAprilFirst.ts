const everyYearAprilFirst = (date: Date): Date[] => {
  const days: Date[] = [];

  // 3月以前（3/31以前）なら前年を起点にする。
  const baseYear =
    date.getMonth() <= 2 ? date.getFullYear() - 1 : date.getFullYear();

  for (let i = 0; i < 15; i++) {
    days.push(new Date(baseYear + i + 7, 3, 1)); // 月: 3 = 4月
  }

  return days;
};

export default everyYearAprilFirst;
/*
日付システムはクソなので対応表に頼る。

対応はこんな感じ

0:  BVS BV    小1
1:  BVS BigBV 小2
2:  CS Rabbit 小3
3:  CS Deer   小4
4:  CS Bear   小5
5:  BS        小6
6:  BS        中1
7:  BS        中2
8:  BS        中3
9:  VS        高1
10: VS        高2
11: VS        高3
12: RS        大1
13: RS        大2

*/
for (let i = 0; i < 20; i++) {
  console.log(i, everyYearAprilFirst(new Date("2008/12/29"))[i]);
}

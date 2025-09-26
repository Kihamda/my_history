const tips: string[] = [
  "カブ隊の敬礼は、動物の耳を模していると言われています",
  "チーフは各団のオーダーメイドで作られていることがあります",
];

const getRandomTip = () => {
  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex];
};

export default getRandomTip;

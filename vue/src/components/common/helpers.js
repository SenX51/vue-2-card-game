//[min, max]
export const randomInteger = (min, max) => {
  const rand = min + Math.random() * (max - min);
  return Math.round(rand);
}

export function selectRandomPattern(patterns) {
  var probabilitySum = 0;
  patterns.forEach((pattern) => {
    probabilitySum += pattern.probability;
  });
  
  var random = randomInteger(0, probabilitySum-1);
  for (let i = 0; i < patterns.length; i++) {
    if (random < patterns[i].probability) {
      return patterns[i].pattern;
    }
    random -= patterns[i].probability;
  }
}

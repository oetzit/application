export function nthFibonacci(n: number) {
  return Math.round(Math.pow((1 + Math.sqrt(5)) / 2, n) / Math.sqrt(5));
}

export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export function randomExponential(rate = 1) {
  // http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates
  return -Math.log(Math.random()) / rate;
}

export function randomPareto(scale = 1, shape = 1) {
  // https://en.wikipedia.org/wiki/Pareto_distribution#Random_sample_generation
  return scale / Math.pow(Math.random(), 1 / shape);
}

export function sawtoothRamp(
  t: number,
  peaksCount = 5,
  dipsHeight = 0.2,
  midwayAt = 0.3,
) {
  // https://www.desmos.com/calculator/7zcb6p8qeu
  // NOTE: this always maps [0;1] ↦ [0;1]
  const ramp = t * (peaksCount * dipsHeight + 1);
  const dips =
    (-Math.floor(t * peaksCount) * (peaksCount * dipsHeight)) /
    (peaksCount - 1);
  const bend = Math.log(0.5) / Math.log(midwayAt);
  return Math.pow(ramp + dips, bend);
}

export async function sha256(message: string) {
  // encode string to UTF-8 Uint8Array
  const msgUint8 = new TextEncoder().encode(message);
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

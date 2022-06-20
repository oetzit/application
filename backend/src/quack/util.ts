export function msg(message: string, final = false) {
  process.stdout.write(message.padEnd(120, " ") + (final ? "\n" : "\r"));
}

export function pad(value: number, length: number) {
  return value.toString().padStart(Math.ceil(Math.log10(1 + length)), "0");
}

export function progress<T>(value: number, range: number | Array<T>) {
  const length: number = range instanceof Array ? range.length : range;
  return `${pad(value, length)}/${length}`;
}

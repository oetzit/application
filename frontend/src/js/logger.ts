const enum LogLevels {
  LOG = "log",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

const TAG_STYLE = [
  "background-color:#df1b12;",
  "font-weight: bold;",
  "border-radius: 0.5em;",
  "padding: 2px 0.5em;",
  "color: white;",
].join("");

export default class Logger {
  tagLabel: string;

  constructor(tagLabel: string) {
    this.tagLabel = `%cÖ!::${tagLabel}%c`;
  }

  call(method: LogLevels, data: unknown[]) {
    // eslint-disable-next-line no-console
    console[method](this.tagLabel, TAG_STYLE, null, ...data);
  }

  log = (...data: unknown[]) => this.call(LogLevels.LOG, data);
  debug = (...data: unknown[]) => this.call(LogLevels.DEBUG, data);
  info = (...data: unknown[]) => this.call(LogLevels.INFO, data);
  warn = (...data: unknown[]) => this.call(LogLevels.WARN, data);
  error = (...data: unknown[]) => this.call(LogLevels.ERROR, data);
}

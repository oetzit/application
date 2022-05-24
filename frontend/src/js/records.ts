export interface FightOutcome {
  level: number;
  words: number;
  score: number;
  timer: number;
}

const SS_KEYS = {
  BEST_LEVEL: "OETZIT/BEST_LEVEL",
  BEST_SCORE: "OETZIT/BEST_SCORE",
  BEST_TIMER: "OETZIT/BEST_TIMER",
  BEST_WORDS: "OETZIT/BEST_WORDS",
};

export default class Records {
  best = this.loadBest();
  last = this.best;
  improved = {
    level: false,
    words: false,
    score: false,
    timer: false,
  };

  loadBest() {
    return {
      level: parseInt(sessionStorage.getItem(SS_KEYS.BEST_LEVEL) ?? "0"),
      score: parseInt(sessionStorage.getItem(SS_KEYS.BEST_SCORE) ?? "0"),
      timer: parseInt(sessionStorage.getItem(SS_KEYS.BEST_TIMER) ?? "0"),
      words: parseInt(sessionStorage.getItem(SS_KEYS.BEST_WORDS) ?? "0"),
    };
  }

  saveBest() {
    sessionStorage.setItem(SS_KEYS.BEST_LEVEL, this.best.level.toString());
    sessionStorage.setItem(SS_KEYS.BEST_SCORE, this.best.score.toString());
    sessionStorage.setItem(SS_KEYS.BEST_TIMER, this.best.timer.toString());
    sessionStorage.setItem(SS_KEYS.BEST_WORDS, this.best.words.toString());
  }

  updateLast(last: FightOutcome) {
    this.last = last;
    this.improved.level = this.best.level < this.last.level;
    this.improved.score = this.best.score < this.last.score;
    this.improved.timer = this.best.timer < this.last.timer;
    this.improved.words = this.best.words < this.last.words;
    if (this.improved.level) this.best.level = this.last.level;
    if (this.improved.score) this.best.score = this.last.score;
    if (this.improved.timer) this.best.timer = this.last.timer;
    if (this.improved.words) this.best.words = this.last.words;
    this.saveBest();
  }
}

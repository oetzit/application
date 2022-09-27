export default class Storage {
  fallingBack = false;
  fallback: Record<string, string> = {};

  constructor() {
    try {
      window.sessionStorage;
    } catch {
      this.fallingBack = true;
      alert(
        "Warning: your browser is disabling cookies. You can play just fine anyways, but we'll be unable to recall your email and personal records next time you're here. Enable them and reload the page if you wish so.",
      );
    }
  }

  setItem(key: string, value: string) {
    if (this.fallingBack) {
      this.fallback[key] = value;
    } else {
      sessionStorage.setItem(key, value);
    }
  }

  getItem(key: string) {
    if (this.fallingBack) {
      return Object.prototype.hasOwnProperty.call(this.fallback, key)
        ? this.fallback[key]
        : null;
    } else {
      return sessionStorage.getItem(key);
    }
  }
}

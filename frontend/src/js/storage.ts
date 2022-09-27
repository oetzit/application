export default class Storage {
  fallingBack = false;
  fallback: Record<string, string> = {};

  constructor() {
    try {
      window.localStorage;
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
      localStorage.setItem(key, value);
    }
  }

  getItem(key: string) {
    if (this.fallingBack) {
      return Object.prototype.hasOwnProperty.call(this.fallback, key)
        ? this.fallback[key]
        : null;
    } else {
      // NOTE: sessionStorage is there because we started using that, silly me and silly Chrome. It can be removed safely in future.
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    }
  }
}

import Keyboard from "simple-keyboard";
import { KeyboardOptions } from "simple-keyboard/build/interfaces";

interface InputStatus {
  began_at: Date | null;
  ended_at: Date | null;
  typed: string;
  final: string;
  began_at_gmtm: number | null;
  ended_at_gmtm: number | null;
}

enum Key {
  Space = "{space}",
  Enter = "{enter}",
  Backspace = "{backspace}",
  ShiftLeft = "{shiftleft}",
  ShiftRight = "{shiftright}",
  a = "a",
  b = "b",
  c = "c",
  d = "d",
  e = "e",
  f = "f",
  g = "g",
  h = "h",
  i = "i",
  j = "j",
  k = "k",
  l = "l",
  m = "m",
  n = "n",
  o = "o",
  p = "p",
  q = "q",
  r = "r",
  s = "s",
  t = "t",
  u = "u",
  v = "v",
  w = "w",
  x = "x",
  y = "y",
  z = "z",
  ä = "ä",
  ö = "ö",
  ü = "ü",
  ß = "ß",
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  H = "H",
  I = "I",
  J = "J",
  K = "K",
  L = "L",
  M = "M",
  N = "N",
  O = "O",
  P = "P",
  Q = "Q",
  R = "R",
  S = "S",
  T = "T",
  U = "U",
  V = "V",
  W = "W",
  X = "X",
  Y = "Y",
  Z = "Z",
  Ä = "Ä",
  Ö = "Ö",
  Ü = "Ü",
  ẞ = "ẞ", // TODO: is this even typeable on a physical keyboard?
}

// NOTE: this is a hack to get onKeyReleased to work with physical keyboards, stealing from the following points
// https://github.com/hodgef/simple-keyboard/blob/ed2c5ce81d7149b07cb3b11f4b629a63034be8ce/src/lib/services/PhysicalKeyboard.ts#L27-L64
// https://github.com/hodgef/simple-keyboard/blob/ed2c5ce81d7149b07cb3b11f4b629a63034be8ce/src/lib/components/Keyboard.ts#L1757-L1812
const hackPhysicalKeyboardKeyUp = function (event: KeyboardEvent) {
  const buttonPressed = this.getSimpleKeyboardLayoutKey(event);

  this.dispatch((instance: any) => {
    const standardButtonPressed = instance.getButtonElement(buttonPressed);
    const functionButtonPressed = instance.getButtonElement(
      `{${buttonPressed}}`,
    );
    let buttonDOM;
    let buttonName;

    if (standardButtonPressed) {
      buttonDOM = standardButtonPressed;
      buttonName = buttonPressed;
    } else if (functionButtonPressed) {
      buttonDOM = functionButtonPressed;
      buttonName = `{${buttonPressed}}`;
    } else {
      return;
    }

    if (buttonDOM && buttonDOM.removeAttribute) {
      buttonDOM.removeAttribute("style");

      instance.handleButtonMouseUp(buttonName, event);
    }
  });
};

class Typewriter {
  inputStatus: InputStatus;
  keyboard: Keyboard;
  desktop: boolean;
  heldKey!: Key;

  onChange: (inputStatus: InputStatus) => unknown;
  onSubmit: (inputStatus: InputStatus) => unknown;
  getGameTime: () => number; // NOTE: sigh.

  constructor(desktop: boolean) {
    this.onChange = () => {};
    this.onSubmit = () => {};

    this.desktop = desktop;
    this.inputStatus = {
      began_at: null,
      ended_at: null,
      typed: "",
      final: "",
      began_at_gmtm: null,
      ended_at_gmtm: null,
    };

    this.keyboard = new Keyboard({
      // debug: true,
      // physicalKeyboardHighlight: true,
      // physicalKeyboardHighlightPress: true,
      // autoUseTouchEvents: true,
      newLineOnEnter: true,
      disableCaretPositioning: true,
      layout: {
        // NOTE: we keep both SHIFTs to catch events from both sides of physical keyboards
        default: [
          `q w e r t z u i o p ü ${Key.Backspace}`,
          `a s d f g h j k l ö ä`,
          `${Key.ShiftLeft} ${Key.ShiftRight} y x c v b n m ß ${Key.Enter}`,
        ],
        shifted: [
          `Q W E R T Z U I O P Ü ${Key.Backspace}`,
          `A S D F G H J K L Ö Ä`,
          `${Key.ShiftLeft} ${Key.ShiftRight} Y X C V B N M ẞ ${Key.Enter}`,
        ],
      },
      display: {
        [Key.Backspace]: "⟵", // "⌫⟵",
        [Key.Enter]: "↩", // "⏎↩↵⏎",
        [Key.Space]: " ", // "␣",
        [Key.ShiftLeft]: "⇧",
        [Key.ShiftRight]: "⇧",
      },
      onChange: this.keyboardOnChangeHandler.bind(this),
    } as KeyboardOptions);

    if (this.desktop) {
      this.setShiftModeHoldable();
    } else {
      this.setShiftModeOneShot();
    }

    this.keyboard.physicalKeyboard.handleHighlightKeyUp =
      hackPhysicalKeyboardKeyUp;
  }

  extractKeyfromEvent(
    event: KeyboardEvent | PointerEvent | MouseEvent | TouchEvent,
  ): Key {
    if (event instanceof KeyboardEvent) {
      return (
        {
          ["Backspace"]: Key.Backspace,
          ["Enter"]: Key.Enter,
          [" "]: Key.Space,
        }[event.key] ?? (event.key as Key)
      );
    } else {
      const element = event.target as HTMLDivElement;
      return element.dataset.skbtn as Key;
    }
  }

  keyboardOnChangeHandler(
    input: string,
    event: KeyboardEvent | PointerEvent | MouseEvent | TouchEvent,
  ) {
    if (navigator.vibrate) navigator.vibrate(20);

    const key = this.keyboard.isMouseHold
      ? this.heldKey
      : this.extractKeyfromEvent(event);
    this.heldKey = key;

    if (this.inputStatus.began_at === null)
      this.inputStatus.began_at = new Date();
    if (this.inputStatus.began_at_gmtm === null)
      this.inputStatus.began_at_gmtm = this.getGameTime();
    if (key === Key.Enter) {
      this.inputStatus.typed += "\n";
      this.inputStatus.ended_at = new Date();
      this.inputStatus.ended_at_gmtm = this.getGameTime();
      this.onSubmit(this.inputStatus);
      this.resetInputStatus();
    } else if (key === Key.Backspace) {
      // NOTE: Backspace events are skipped by simple-keyboard if its internal input is empty!
      this.inputStatus.typed += "\b";
      this.inputStatus.final = input;
      this.onChange(this.inputStatus);
    } else if (key === Key.Space) {
      this.inputStatus.typed += " ";
      this.inputStatus.final = input;
      this.onChange(this.inputStatus);
    } else {
      this.inputStatus.typed += key;
      this.inputStatus.final = input;
      this.onChange(this.inputStatus);
    }
  }

  resetInputStatus() {
    this.keyboard.clearInput();
    this.inputStatus = {
      began_at: null,
      ended_at: null,
      typed: "",
      final: "",
      began_at_gmtm: null,
      ended_at_gmtm: null,
    };
  }

  setActive(active: boolean) {
    // disables physical kbd on desktop
    this.keyboard.setOptions({
      physicalKeyboardHighlight: active && this.desktop,
      physicalKeyboardHighlightPress: active && this.desktop,
    } as KeyboardOptions);
    // hides virtual kbd on mobile
    this.keyboard.keyboardDOM.hidden = !(active && !this.desktop);
    // NOTE: this is not really disabled at event level, but events can't be triggered
  }

  setShiftModeHoldable() {
    this.keyboard.setOptions({
      onKeyPress: (key: string) => {
        if (Key.ShiftLeft == key || Key.ShiftRight == key) {
          this.keyboard.setOptions({ layoutName: "shifted" });
        }
      },
      onKeyReleased: (key: string) => {
        if (Key.ShiftLeft == key || Key.ShiftRight == key) {
          this.keyboard.setOptions({ layoutName: "default" });
        }
      },
    });
  }

  setShiftModeOneShot() {
    this.keyboard.setOptions({
      onKeyPress: undefined,
      onKeyReleased: (key: string) => {
        if (this.keyboard.options.layoutName == "shifted") {
          this.keyboard.setOptions({ layoutName: "default" });
        } else if (Key.ShiftLeft == key || Key.ShiftRight == key) {
          this.keyboard.setOptions({
            layoutName: "shifted",
          });
        }
      },
    });
  }
}

export default Typewriter;

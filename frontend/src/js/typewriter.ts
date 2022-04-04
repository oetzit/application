import Keyboard from "simple-keyboard";
import { KeyboardOptions } from "simple-keyboard/build/interfaces";

interface InputStatus {
  began_at: Date | null;
  ended_at: Date | null;
  typed: string;
  final: string;
}

enum Key {
  Space = "{space}",
  Enter = "{enter}",
  Backspace = "{backspace}",
  A = "a",
  B = "b",
  C = "c",
  D = "d",
  E = "e",
  F = "f",
  G = "g",
  H = "h",
  I = "i",
  J = "j",
  K = "k",
  L = "l",
  M = "m",
  N = "n",
  O = "o",
  P = "p",
  Q = "q",
  R = "r",
  S = "s",
  T = "t",
  U = "u",
  V = "v",
  W = "w",
  X = "x",
  Y = "y",
  Z = "z",
  Ä = "ä",
  Ö = "ö",
  Ü = "ü",
  ß = "ß",

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

  onChange: (inputStatus: InputStatus) => unknown;
  onSubmit: (inputStatus: InputStatus) => unknown;

  constructor() {
    this.onChange = () => {};
    this.onSubmit = () => {};

    this.inputStatus = {
      began_at: null,
      ended_at: null,
      typed: "",
      final: "",
    };

    this.keyboard = new Keyboard({
      // debug: true,
      physicalKeyboardHighlight: true,
      physicalKeyboardHighlightPress: true,
      // autoUseTouchEvents: true,
      newLineOnEnter: true,
      disableCaretPositioning: true,
      layout: {
        default: [
          `q w e r t z u i o p ü ${Key.Backspace}`,
          `a s d f g h j k l ö ä`,
          `${Key.Space} y x c v b n m ß ${Key.Enter}`,
        ],
      },
      display: {
        [Key.Backspace]: "⟵", // "⌫⟵",
        [Key.Enter]: "↩", // "⏎↩↵⏎",
        [Key.Space]: " ", // "␣",
      },
      onChange: this.keyboardOnChangeHandler.bind(this),
    } as KeyboardOptions);

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
    const key = this.extractKeyfromEvent(event);
    if (!this.inputStatus.began_at) this.inputStatus.began_at = new Date();
    if (key === Key.Enter) {
      this.keyboard.clearInput();
      this.inputStatus.typed += "\n";
      this.inputStatus.ended_at = new Date();
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
    this.inputStatus = {
      began_at: null,
      ended_at: null,
      typed: "",
      final: "",
    };
  }

  setHidden(hidden: boolean) {
    this.keyboard.keyboardDOM.hidden = hidden;
  }
}

export default Typewriter;

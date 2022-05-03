import loBeep from "url:/public/assets/audio/Cancel 1.mp3";
import mdBeep from "url:/public/assets/audio/Text 1.mp3";
import hiBeep from "url:/public/assets/audio/Confirm 1.mp3";
import hitCritter from "url:/public/assets/audio/Hit damage 1.mp3";
import hitPlayer from "url:/public/assets/audio/Boss hit 1.mp3";
import gameOver from "url:/public/assets/audio/Bubble heavy 2.mp3";

export const SFX = {
  LoBeep: loBeep as string,
  MdBeep: mdBeep as string,
  HiBeep: hiBeep as string,
  HitCritter: hitCritter as string,
  HitPlayer: hitPlayer as string,
  GameOver: gameOver as string,
};

import buildup from "url:/public/assets/music/buildup.mp3";
import loopOne from "url:/public/assets/music/loop.mp3";
import loopTwo from "url:/public/assets/music/loopTwo.mp3";
import loopThree from "url:/public/assets/music/loopThree.mp3";
import failure from "url:/public/assets/music/loose.mp3";

export const MFX = {
  Buildup: buildup as string,
  LoopOne: loopOne as string,
  LoopTwo: loopTwo as string,
  LoopThree: loopThree as string,
  Failure: failure as string,
};

import BearWalkURL from "url:/public/assets/sprites/animals/Bear_Walk.png";
import BearRunURL from "url:/public/assets/sprites/animals/Bear_Run.png";
import BoarWalkURL from "url:/public/assets/sprites/animals/Boar_Walk.png";
import BoarRunURL from "url:/public/assets/sprites/animals/Boar_Run.png";
import DeerWalkURL from "url:/public/assets/sprites/animals/Deer_Walk.png";
import DeerRunURL from "url:/public/assets/sprites/animals/Deer_Run.png";
import FoxWalkURL from "url:/public/assets/sprites/animals/Fox_Walk.png";
import FoxRunURL from "url:/public/assets/sprites/animals/Fox_Run.png";
import HorseWalkURL from "url:/public/assets/sprites/animals/Horse_Walk.png";
import HorseRunURL from "url:/public/assets/sprites/animals/Horse_Run.png";
import RabbitWalkURL from "url:/public/assets/sprites/animals/Rabbit_Walk.png";
import RabbitRunURL from "url:/public/assets/sprites/animals/Rabbit_Run.png";
import WolfWalkURL from "url:/public/assets/sprites/animals/Wolf_Walk.png";
import WolfRunURL from "url:/public/assets/sprites/animals/Wolf_Run.png";

import OetziURL from "url:/public/assets/sprites/player/oezi.png";
import SpearStillURL from "url:/public/assets/sprites/player/spear.png";
import SpearWobbleURL from "url:/public/assets/sprites/player/spearhit.png";

export const SpriteSheets: {
  [key: string]: Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig;
} = {
  BearWalk: {
    key: "BearWalk",
    url: BearWalkURL as string,
    frameConfig: { frameWidth: 64, frameHeight: 33 },
  },
  BearRun: {
    key: "BearRun",
    url: BearRunURL as string,
    frameConfig: { frameWidth: 64, frameHeight: 33 },
  },
  BoarWalk: {
    key: "BoarWalk",
    url: BoarWalkURL as string,
    frameConfig: { frameWidth: 64, frameHeight: 40 },
  },
  BoarRun: {
    key: "BoarRun",
    url: BoarRunURL as string,
    frameConfig: { frameWidth: 64, frameHeight: 40 },
  },
  DeerWalk: {
    key: "DeerWalk",
    url: DeerWalkURL as string,
    frameConfig: { frameWidth: 72, frameHeight: 52 },
  },
  DeerRun: {
    key: "DeerRun",
    url: DeerRunURL as string,
    frameConfig: { frameWidth: 72, frameHeight: 52 },
  },
  HorseWalk: {
    key: "HorseWalk",
    url: HorseWalkURL as string,
    frameConfig: { frameWidth: 60, frameHeight: 33 },
  },
  HorseRun: {
    key: "HorseRun",
    url: HorseRunURL as string,
    frameConfig: { frameWidth: 60, frameHeight: 33 },
  },
  FoxWalk: {
    key: "FoxWalk",
    url: FoxWalkURL as string,
    frameConfig: { frameWidth: 64, frameHeight: 36 },
  },
  FoxRun: {
    key: "FoxRun",
    url: FoxRunURL as string,
    frameConfig: { frameWidth: 64, frameHeight: 36 },
  },
  RabbitWalk: {
    key: "RabbitWalk",
    url: RabbitWalkURL as string,
    frameConfig: { frameWidth: 32, frameHeight: 26 },
  },
  RabbitRun: {
    key: "RabbitRun",
    url: RabbitRunURL as string,
    frameConfig: { frameWidth: 32, frameHeight: 26 },
  },
  WolfWalk: {
    key: "WolfWalk",
    url: WolfWalkURL as string,
    frameConfig: { frameWidth: 64, frameHeight: 40 },
  },
  WolfRun: {
    key: "WolfRun",
    url: WolfRunURL as string,
    frameConfig: { frameWidth: 64, frameHeight: 40 },
  },
  Oetzi: {
    key: "Oetzi",
    url: OetziURL as string,
    frameConfig: { frameWidth: 27, frameHeight: 35 },
  },
  SpearStill: {
    key: "SpearStill",
    url: SpearStillURL as string,
    frameConfig: { frameWidth: 31, frameHeight: 7 },
  },
  SpearWobble: {
    key: "SpearWobble",
    url: SpearWobbleURL as string,
    frameConfig: { frameWidth: 14, frameHeight: 33 },
  },
};

import L00URL from "url:/public/assets/background_layers/Layer_0011_0.png";
import L01URL from "url:/public/assets/background_layers/Layer_0010_1.png";
import L02URL from "url:/public/assets/background_layers/Layer_0009_2.png";
import L03URL from "url:/public/assets/background_layers/Layer_0008_3.png";
import L04URL from "url:/public/assets/background_layers/Layer_0007_Lights.png";
import L05URL from "url:/public/assets/background_layers/Layer_0006_4.png";
import L06URL from "url:/public/assets/background_layers/Layer_0005_5.png";
import L07URL from "url:/public/assets/background_layers/Layer_0004_Lights.png";
import L08URL from "url:/public/assets/background_layers/Layer_0003_6.png";
import L09URL from "url:/public/assets/background_layers/Layer_0002_7.png";
import L10URL from "url:/public/assets/background_layers/Layer_0001_8.png";
import L11URL from "url:/public/assets/background_layers/Layer_0000_9.png";

export const BackgroundImages: {
  [key: string]: Phaser.Types.Loader.FileTypes.ImageFileConfig;
} = {
  L00: { key: "L00", url: L00URL as string },
  L01: { key: "L01", url: L01URL as string },
  L02: { key: "L02", url: L02URL as string },
  L03: { key: "L03", url: L03URL as string },
  L04: { key: "L04", url: L04URL as string },
  L05: { key: "L05", url: L05URL as string },
  L06: { key: "L06", url: L06URL as string },
  L07: { key: "L07", url: L07URL as string },
  L08: { key: "L08", url: L08URL as string },
  L09: { key: "L09", url: L09URL as string },
  L10: { key: "L10", url: L10URL as string },
  L11: { key: "L11", url: L11URL as string },
};

export default { SFX, MFX };

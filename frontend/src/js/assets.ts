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

import oetzi from "url:/public/assets/sprites/player/oezi.png";
import spearStill from "url:/public/assets/sprites/player/spear.png";
import spearWobble from "url:/public/assets/sprites/player/spearhit.png";

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
};

export const SPR = {
  Oetzi: oetzi as string,
  SpearStill: spearStill as string,
  SpearWobble: spearWobble as string,
};

import l00 from "url:/public/assets/background_layers/Layer_0011_0.png";
import l01 from "url:/public/assets/background_layers/Layer_0010_1.png";
import l02 from "url:/public/assets/background_layers/Layer_0009_2.png";
import l03 from "url:/public/assets/background_layers/Layer_0008_3.png";
import l04 from "url:/public/assets/background_layers/Layer_0007_Lights.png";
import l05 from "url:/public/assets/background_layers/Layer_0006_4.png";
import l06 from "url:/public/assets/background_layers/Layer_0005_5.png";
import l07 from "url:/public/assets/background_layers/Layer_0004_Lights.png";
import l08 from "url:/public/assets/background_layers/Layer_0003_6.png";
import l09 from "url:/public/assets/background_layers/Layer_0002_7.png";
import l10 from "url:/public/assets/background_layers/Layer_0001_8.png";
import l11 from "url:/public/assets/background_layers/Layer_0000_9.png";

export const BKG = {
  L00: l00 as string,
  L01: l01 as string,
  L02: l02 as string,
  L03: l03 as string,
  L04: l04 as string,
  L05: l05 as string,
  L06: l06 as string,
  L07: l07 as string,
  L08: l08 as string,
  L09: l09 as string,
  L10: l10 as string,
  L11: l11 as string,
};

export default { SFX, MFX, SPR, BKG };

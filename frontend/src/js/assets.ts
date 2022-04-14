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
import deer from "url:/public/assets/sprites/player/deer.png";
import boar from "url:/public/assets/sprites/player/boar.png";
import wolf from "url:/public/assets/sprites/player/wolf.png";
import bear from "url:/public/assets/sprites/player/bear.png";
import spearStill from "url:/public/assets/sprites/player/spear.png";
import spearWobble from "url:/public/assets/sprites/player/spearhit.png";

export const SPR = {
  Oetzi: oetzi as string,
  Deer: deer as string,
  Boar: boar as string,
  Wolf: wolf as string,
  Bear: bear as string,
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

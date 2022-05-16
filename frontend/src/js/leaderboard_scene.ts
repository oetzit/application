import "phaser";
import { FONTS } from "./assets";

import { uniqueNamesGenerator, names } from "unique-names-generator";
import backend from "./backend";
import { LeaderboardItem, LeaderboardView } from "../../../backend/src/types";

const MEDALS = ["🥇", "🥈", "🥉"];
const DEVICE_KEY = "OETZIT/DEVICE_ID";

const BUTTON_HIGHLIGHT_COLOR = "darkorange";

const TEXT_STYLE: {
  [key: string]: Phaser.Types.GameObjects.Text.TextStyle;
} = {
  LIST: {
    fontSize: "28px",
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "#ffffff",
    stroke: "black",
    strokeThickness: 4,
  },
  MESSAGE: {
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "#ffffff",
    fontSize: "32px",
    testString:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
    align: "center",
  },
  BUTTON: {
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "white",
    stroke: "black",
    strokeThickness: 8,
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    fontSize: "32px",
  },
};

export default class LeaderboardScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;
  rankings!: Phaser.GameObjects.Text;
  message!: Phaser.GameObjects.Text;
  backBtn!: Phaser.GameObjects.Text;
  leaderboardView!: LeaderboardView;
  currentDeviceIndex!: number;

  constructor() {
    super("leaderboard");
  }

  async create(data: { music: Phaser.Sound.BaseSound }) {
    this.music = data.music;

    this.leaderboardView = await this.fetchLeaderboardView();
    this.currentDeviceIndex = this.calculateCurrentDeviceIndex();

    this.createRankings();
    this.createMessage();
    this.createBackBtn();
    this.bindEvents();
  }

  async fetchLeaderboardView() {
    return (
      await backend.createLeaderboardView({
        device_id: this.getDeviceUUID() ?? undefined,
      })
    ).data;
  }

  calculateCurrentDeviceIndex() {
    const uuid = this.getDeviceUUID();
    return this.leaderboardView.findIndex(({ device_id }) => device_id == uuid);
  }

  getDeviceUUID() {
    return sessionStorage.getItem(DEVICE_KEY);
  }

  async createRankings() {
    const renderedRankings = this.renderRankings(this.leaderboardView);

    this.rankings = this.add
      .text(0, 0, renderedRankings, {
        ...TEXT_STYLE.LIST,
        testString: renderedRankings,
      })
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.1);
  }

  renderRankings(leaderboardItems: LeaderboardItem[]) {
    const output: [string, string, string, string][] = [];

    // Render basic properties
    leaderboardItems.forEach((entry) => {
      output.push([
        entry.place.toString(),
        this.deterministicNameFromUUID(entry.device_id),
        entry.game_score.toString(),
        entry.place < 4 ? MEDALS[entry.place - 1] : "",
      ]);
    });

    // Find and mark current device
    const myIndex = leaderboardItems.findIndex(
      ({ device_id }) => device_id == this.getDeviceUUID(),
    );
    if (myIndex > -1) output[myIndex][1] = "> YOU <";

    // Add spacers
    for (let i = leaderboardItems.length - 1; i > 1; i--) {
      const thereIsAGap =
        leaderboardItems[i].place - leaderboardItems[i - 1].place > 1;
      if (thereIsAGap) output.splice(i, 0, ["", "...", "", ""]);
    }
    output.push(["", "...", "", ""]);

    this.padColumns(output);

    return output.map((i) => i.join("  ")).join("\n");
  }

  padColumns(renderedItems: [string, string, string, string][]) {
    const maxWidth = Array(4)
      .fill(0)
      .map((_, i) =>
        renderedItems.reduce(
          (max, cur) => Math.max(max, cur[i].length),
          -Infinity,
        ),
      );

    renderedItems.forEach((c) => (c[0] = c[0].padStart(maxWidth[0], " ")));
    renderedItems.forEach((c) => (c[1] = c[1].padEnd(maxWidth[1], " ")));
    renderedItems.forEach((c) => (c[2] = c[2].padStart(maxWidth[2], " ")));
  }

  deterministicNameFromUUID(uuid: string) {
    return uniqueNamesGenerator({
      dictionaries: [names],
      seed: parseInt(uuid.slice(-12), 16),
    });
  }

  createMessage() {
    const renderedMessage = this.renderMessage();
    this.message = this.add
      .text(
        this.cameras.main.centerX,
        this.rankings.getBounds().bottom + 32,
        renderedMessage,
        TEXT_STYLE.MESSAGE,
      )
      .setOrigin(0.5, 0);
  }

  renderMessage() {
    if (this.currentDeviceIndex < 0) return "You still haven't played!";
    const place = this.leaderboardView[this.currentDeviceIndex].place;
    if (place == 1) return "You're in first place!\nAmazing!";
    if (place < 4) return "You're on the podium!\nExcellent!";
    return `You're number ${place}\nGood job!`;
  }

  createBackBtn() {
    const verb = this.game.device.os.desktop ? "Click" : "Tap";
    const text = `${verb} to continue`;
    this.backBtn = this.add
      .text(this.cameras.main.centerX, this.cameras.main.height * 0.9, text, {
        ...TEXT_STYLE.BUTTON,
      })
      .setOrigin(0.5, 1)
      .setPadding(4)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        this.backBtn.setStyle({ stroke: BUTTON_HIGHLIGHT_COLOR }),
      )
      .on("pointerout", () =>
        this.backBtn.setStyle({ stroke: TEXT_STYLE.BUTTON.stroke }),
      );
  }

  bindEvents() {
    this.backBtn.on("pointerup", this.backToWelcome.bind(this));
  }

  backToWelcome() {
    this.scene.start("welcome", { music: this.music });
  }
}

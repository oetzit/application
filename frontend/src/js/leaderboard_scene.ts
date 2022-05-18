import "phaser";

import { uniqueNamesGenerator, names } from "unique-names-generator";
import backend from "./backend";
import {
  LeaderboardSafeItem,
  LeaderboardSafeView,
} from "../../../backend/src/types";
import Game from "./game";
import { sha256 } from "./utils";
import TEXT_STYLES, { makeButtonHoverable } from "./text_styles";

const MEDALS = ["🥇", "🥈", "🥉"];

export default class LeaderboardScene extends Phaser.Scene {
  game!: Game;
  music!: Phaser.Sound.BaseSound;
  rankings!: Phaser.GameObjects.Text;
  message!: Phaser.GameObjects.Text;
  backBtn!: Phaser.GameObjects.Text;
  leaderboardView!: LeaderboardSafeView;
  currentDeviceIndex!: number;

  constructor() {
    super("leaderboard");
  }

  async create(data: { music: Phaser.Sound.BaseSound }) {
    this.music = data.music;

    this.leaderboardView = await this.fetchLeaderboardView();
    this.currentDeviceIndex = await this.calculateCurrentDeviceIndex();

    this.createRankings();
    this.createMessage();
    this.createBackBtn();
    this.bindEvents();
  }

  async fetchLeaderboardView() {
    return (
      await backend.createLeaderboardView({
        device_id: this.game.beDevice.id ?? undefined,
      })
    ).data;
  }

  async calculateCurrentDeviceIndex() {
    const deviceHash = await sha256(this.game.beDevice.id);
    return this.leaderboardView.findIndex(
      ({ device_hash }) => device_hash == deviceHash,
    );
  }

  async createRankings() {
    const renderedRankings = this.renderRankings(this.leaderboardView);
    const fontSize = Math.min(this.cameras.main.height * 0.25, 24);
    this.rankings = this.add
      .text(0, 0, renderedRankings, {
        ...TEXT_STYLES.BASE,
        testString: renderedRankings,
      })
      .setFontSize(fontSize)
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.1);
  }

  renderRankings(leaderboardItems: LeaderboardSafeItem[]) {
    const output: [string, string, string, string][] = [];

    // Render basic properties
    leaderboardItems.forEach((entry) => {
      output.push([
        entry.place.toString(),
        this.deterministicNameFromHash(entry.device_hash),
        entry.game_score.toString(),
        entry.place < 4 ? MEDALS[entry.place - 1] : "",
      ]);
    });

    // Find and mark current device
    if (this.currentDeviceIndex > -1)
      output[this.currentDeviceIndex][1] = "> YOU <";

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

  deterministicNameFromHash(hash: string) {
    //TODO
    return uniqueNamesGenerator({
      dictionaries: [names],
      seed: parseInt(hash.slice(-12), 16),
    });
  }

  createMessage() {
    const renderedMessage = this.renderMessage();
    const fontSize = Math.min(this.cameras.main.height * 0.25, 24);
    this.message = this.add
      .text(0, 0, renderedMessage, TEXT_STYLES.BASE)
      .setOrigin(0.5, 0)
      .setFontSize(fontSize)
      .setPosition(
        this.cameras.main.centerX,
        this.rankings.getBounds().bottom + 32,
      );
  }

  renderMessage() {
    if (this.currentDeviceIndex < 0) return "You still haven't played!";
    const place = this.leaderboardView[this.currentDeviceIndex].place;
    if (place == 1) return "You're in first place!\nAmazing!";
    if (place < 4) return "You're on the podium!\nExcellent!";
    return `You're number ${place}\nGood job!`;
  }

  createBackBtn() {
    const text = "Back to menu";
    const fontSize = Math.min(this.cameras.main.height * 0.25, 32);
    this.backBtn = this.add
      .text(0, 0, text, TEXT_STYLES.BUTTON)
      .setOrigin(0.5, 1)
      .setFontSize(fontSize)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.95);
    makeButtonHoverable(this.backBtn);
  }

  bindEvents() {
    this.backBtn.on("pointerup", this.backToWelcome.bind(this));
  }

  backToWelcome() {
    this.scene.start("welcome", { music: this.music });
  }
}

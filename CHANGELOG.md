# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.9.0] - 2022-09-14

### Added

- Whip up competition dashboard.

## [1.8.1] - 2022-09-05

### Fixed

- Repair sample link in workshop leaderboard.

## [1.8.0] - 2022-09-05

### Added

- Add a leaderboard view to backoffice for usage in workshops.

## [1.7.0] - 2022-08-30

### Added

- Add status markers on dashboard distributions list.
- Add OCR confidence on dashboard distributions list.

## [1.6.0] - 2022-07-18

### Added

- Improved statisticts on dashboard (including entropy scores).

## [1.5.0] - 2022-06-21

### Added

- Implemented scraping/seeding script to fill database with transcriptions from Quack.
- Implemented scraping/seeding script to fill storage with images from Quack.
- MinIO setup for object storage in local development environment and k8s manifests.

### Changed

- Images are now fetched from object storage instead of database (via API).
- Clean up tag generation in CI/CD.
- Improve setup for local development.
- `word_id` is now a padded string instead of a number.

## [1.4.1] - 2022-05-30

### Fixed

- `FE` Always install all deps in CI.

## [1.4.0] - 2022-05-30

### Added

- `FE` Caps lock now works properly on desktop.
- `FE` Track best level.
- `FE` Best (and last) level, score, time and word count are all tracked in `Record` component.

### Changed

- `BE` Migrations now run in an `initContainer` automatically upon deployment.
- `BE`/`FE` Improved tagging and deployment strategies.

### Fixed

- `FE` Removed music jumps at scene changes.

## [1.3.0] - 2022-05-18

### Added

- `BE` Leaderboard endpoint (ensure no device id escept the user's is publicly circulating).
- `FE` Leaderboard scene with top players (everyone's id is hashed and anonymized, names are generated deterministically).
- `BE` Added email to devices.
- `FE` Added reward scene to input email.
- `BE` Top weekly players in dashboard.
- `BE` Dashboard is now password protected.
- `FE` Track personal best words/time/score.
- `FE` Notify when personal best is beaten upon game over.
- `FE` Link to privacy policy in rewards scene, abiding to GDPR.

### Changed

- `FE` Wrong casing is now accepted, halving the points of the wrong letters.
- `FE` Device handling is simplified and bubbled up to the `Game` instance itself.
- `FE` Refactor text style handling.
- `FE` Refactor button interaction handling.

### Fixed

- `FE` Fix english in tutorial.
- `FE` Fix text alignment in tutorial.
- `FE` Fix arrows emoji for mobile in tutorial.
- `FE` Fix wonky clue positioning in tutorial.
- `FE` Fix pause overlay when in game over screen.
- `FE` Disable focus pausing in reward scene, as prompts are tricky.

## [1.2.0] - 2022-05-11

### Added

- `FE` Now there is an in-game thorough tutorial.

### Changed

- `FE` Huge refactor of internals, mostly to allow for tutorial creation.
- `FE` Mobile now pauses with double tap.

## [1.1.0] - 2022-05-05

### Added

- `FE` Add fox and rabbit critters.
- `FE` Critter size is now proportional to word length.
- `FE` Implement asset preloading.
- `FE` Implement haptic feedback for mobile devices.
- `FE` Allow key stroke repetition on hold.
- `FE` Implement loading screen.
- `FE` Expiring clues flash red before disappearing.
- `FE` Health pulses red when low.
- `FE` Implement webfont preloading.
- `FE` Switch to using only webfonts.
- `FE` Implement text clues (as opposed to image clues). Propedeutic to tutorial mode.
- `FE` Implement buttons on welcome screen. Propedeutic to tutorial mode.

### Changed

- `FE` Removed redundant clock icon from HUD.
- `FE` Remove SHIFT keys; replace SPACE with SHIFT.
- `FE` Make input preview smaller to improve clue overlaps for slow typers on mobile.
- `FE` Rename "wave" to "level".
- `FE` Lower max length to 3 at game start.

### Fixed

- `FE` Avoid text overlap on mobile in game over screen.

## [1.0.0] - 2022-04-21

### Added

- `BE` Favicon.
- `BE` Automatic DB triggers on timestamps.
- `FE`/`BE` Rollbar.

### Changed

- Official game name is "Ötzit!" (`oetzit` for machines).

### Removed

- `BE` Deprecated seeds.

## [0.7.0] - 2022-04-13

### Added

- `FE` Sound effects.
- `FE` Background music.
- `FE` Critters flash when hit.
- `FE` Player flashes when hit.
- `FE` HUD flashes on change.
- `BE` API for precise word choice.
- `FE` Use exponential distribution for delay between foes (i.e. their arrival is a Poisson process).
- `FE` Use parametric Pareto distribution for word length coice (i.e. we're bending the Zipfian law to control difficulty).
- `FE` Modulate difficulty ramp up in waves.
- `FE` Announce waves visually.
- `FE` Change atmospheric color to tenser tones as difficulty increases.
- `FE` Change music faster pace as difficulty increases.
- `FE` Implement scoring system (accounting for length, accuracy and speed).
- `FE`/`BE` Track score and similarity of every shot.
- `FE` Make game over screen more informative.
- `BE` Plot device behaviour in dashboard.
- `BE` Plot word performance in dashboard.

### Changed

- `FE` Failing a word does damage proportional to length.

### Fixed

- `FE` Increase minimum clue size for small screens.
- `FE` Deactivate typewriter at gameover.
- `FE` Deactivate spawner at gameover.

## [0.6.0] - 2022-04-06

### Added

- `FE` added game clock.
- `FE`/`BE` added ingame time tracking.
- `FE` clues are placed in bounded area
- `FE` clues are placed in a smart way, seeking free spaces and avoiding piles.
- `FE` the whole HUD is scaled responsively.
- `FE` all game entities are scaled responsively.
- `FE` pause shortcut for desktop and mobile.
- `FE` make game more discoverable w/ better hints.

### Changed

- `FE` general rehaul of UI/HUD and aesthetics.

### Fixed

- `FE` fixed pause handling in ingame time.
- `BE` improve shot graph readability in dashboard.
- `FE` clues don't overlap anymore.

## [0.5.0] - 2022-04-04

### Added

- `FE`/`BE` complete tracking of essential game events.
- `BE` sketch dashboard with some data.
- `FE`/`BE` display release tag/sha.
- `FE` shift key for virtual and physical keyboards.
- `FE` pause/resume on focus loss/gain.
- `FE` conceal/reveal clues on focus loss/gain.
- `FE` enemy spawn based on internal timer (to account for pauses).
- `FE` critter speed is parametric.
- `FE` foe duration is parametric (and adjusted to screen width).

### Changed

- `FE` match making is now case sensitive.

## [0.4.0] - 2022-03-29

### Added

- `FE` Nice parallax background.
- `FE` Rudimentary score/health system.
- `FE` Game over and splash screens.

### Changed

- `FE` input is centered on screen.
- `FE` submit feedback is now always given and way snappier.

### Fixed

- `FE` player doesn't fall through ground on big screens.
- `FE` animals don't fall through ground on big screens.

## [0.3.0] - 2022-03-24

### Added

- `FE` Let clues fall w/ gravity to improve overlap situation.
- `FE` Make word size more uniform by guesstimating ascenders/descenders presence.
- `FE` Track input timing and keystrokes.
- `FE` Add virtual keyboard for mobile (which becomes input handler for desktop too).
- `BE` Swagger for API.

### Changed

- `FE` Move success/failure messages to improve readability.
- `FE` Rework background scaling.
- `FE` Circumvent texture key hashing to avoid collisions.
- `BE` Completely rework API (shallow RESTlike w/ Typebox).

### Fixed

- `FE` Immediately remove clue on failure.
- `FE` Solve difficulties in typing "öäüß" (w/ hidden virtual keyboard).

## [0.2.0] - 2022-03-15

### Added

- `FE` Clues appear and fade on top of forest.
- `FE` Spears have physics, and either scare animals away or stab the ground.
- `FE` The player can just type; no clicking, no modals.
- `FE` Typed words are matched with onscreen ones by Levenshtein distance.
- `BE` Seed procedure from Quack.
- `BE`/`FE` Revise DB schema and API to handle words.

### Changed

- `FE` Complete rewrite in TypeScript.

## [0.1.0] - 2022-03-02

### Added

- Dockerization for development and deployment.
- Kubernetes architecture for deployment.
- Solid CI pipeline.
- DB seeding script.
- Various QOL improvements for developers.

### Changed

- Backend rewritten in Node.

## [0.0.1] - 2022-02-21

### Added

- POC by [Giovanni Moretti](https://www.giovannimoretti.it/).

[unreleased]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.9.0...development
[1.9.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.8.1...v1.9.0
[1.8.1]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.7.0...v1.8.1
[1.8.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.7.0...v1.8.0
[1.7.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.6.0...v1.7.0
[1.6.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.5.0...v1.6.0
[1.5.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.4.1...v1.5.0
[1.4.1]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.4.0...v1.4.1
[1.4.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.3.0...v1.4.0
[1.3.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.2.0...v1.3.0
[1.2.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.1.0...v1.2.0
[1.1.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v1.0.0...v1.1.0
[1.0.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v0.7.0...v1.0.0
[0.7.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v0.6.0...v0.7.0
[0.6.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v0.5.0...v0.6.0
[0.5.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v0.4.0...v0.5.0
[0.4.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v0.3.0...v0.4.0
[0.3.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v0.2.0...v0.3.0
[0.2.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v0.1.0...v0.2.0
[0.1.0]: https://gitlab.inf.unibz.it/commul/oetzit/compare/v0.0.1...v0.1.0
[0.0.1]: https://gitlab.inf.unibz.it/commul/oetzit/tree/v0.0.1

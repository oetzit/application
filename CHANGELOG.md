# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://gitlab.inf.unibz.it/commul/oetzi/compare/0.5.0...development
[0.5.0]: https://gitlab.inf.unibz.it/commul/oetzi/compare/0.4.0...0.5.0
[0.4.0]: https://gitlab.inf.unibz.it/commul/oetzi/compare/0.3.0...0.4.0
[0.3.0]: https://gitlab.inf.unibz.it/commul/oetzi/compare/0.2.0...0.3.0
[0.2.0]: https://gitlab.inf.unibz.it/commul/oetzi/compare/0.1.0...0.2.0
[0.1.0]: https://gitlab.inf.unibz.it/commul/oetzi/compare/0.0.1...0.1.0
[0.0.1]: https://gitlab.inf.unibz.it/commul/oetzi/tree/v0.0.1

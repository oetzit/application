# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://gitlab.inf.unibz.it/commul/oetzi/compare/0.1.0...development
[0.1.0]: https://gitlab.inf.unibz.it/commul/oetzi/compare/0.0.1...0.1.0
[0.0.1]: https://gitlab.inf.unibz.it/commul/oetzi/tree/v0.0.1

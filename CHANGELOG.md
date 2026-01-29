# Changelog

## 0.1.0 (2026-01-29)

### Refactors

* **envs:**  change how public env vars are configured (0ebe8ac5)

## 0.0.48 (2025-08-13)

### Chores

* **i18n:**  upgrade zcb (42d4e3ca)

## 0.0.47 (2025-08-12)

### Chores

* **root:**  bump deps, including zcb (880a2084)

### New Features

* **root:**  add logo to readme (50bcf9f2)

### Bug Fixes

* **root:**
  * vulnerabilities (41b30ede)
  * readme linting (4634365b)

## 0.0.46 (2025-06-20)

### Bug Fixes

* **i18n:**  component mapper type wrong (640faf92)

## 0.0.45 (2025-06-20)

### Bug Fixes

* **i18n:**  config file path resolves wrong (c24b27a5)

## 0.0.44 (2025-06-20)

### Refactors

* **i18n:**  move to using config for markdown dir (4eca8a78)

## 0.0.43 (2025-06-20)

### Refactors

* **i18n:**  change way caller filename is derived (5c24822e)

## 0.0.42 (2025-06-19)

### Chores

* **i18n:**  add logging to get all args (36c6b74c)

## 0.0.41 (2025-06-19)

### Bug Fixes

* **i18n:**  make path relative to file (27bef0b8)

## 0.0.40 (2025-06-12)

### Documentation Changes

* **envs:**  update readme (c386aaac)

## 0.0.39 (2025-06-12)

### Other Changes

* **link-extra:**  specify forward ref for own link" (58c8a65f)

## 0.0.38 (2025-06-12)

### Refactors

* **link-extra:**  specify forward ref for own link (5c88caaf)

## 0.0.37 (2025-06-12)

### Bug Fixes

* **envs:**  lock file (6cdf43cf)

## 0.0.36 (2025-06-12)

### Refactors

* **envs:**  get public envs added pre next.js init (4a111e23)

## 0.0.35 (2025-06-11)

### Bug Fixes

* **envs:**  more issues with server/client code splitting (291db03c)

## 0.0.34 (2025-06-11)

### Bug Fixes

* **envs:**  remove component from server output (132b12e3)

## 0.0.33 (2025-06-11)

### Bug Fixes

* **envs:**  make nonce optional (9712ddf0)

## 0.0.32 (2025-06-11)

### Bug Fixes

* **envs:**  export component from server output (08860223)

## 0.0.31 (2025-06-11)

### Refactors

* **envs:**  change how public envs are passed to client (098c3fa8)

## 0.0.30 (2025-06-11)

### Bug Fixes

* **i18n:**  remove client exports from index (0a8dd7bb)

## 0.0.29 (2025-06-11)

### Bug Fixes

* **root:**  build outputs wrong on some packages (f60453b7)

## 0.0.28 (2025-06-10)

### Bug Fixes

* **envs:**  guard against envs not being set on globalThis (e479bcf5)

## 0.0.27 (2025-06-10)

### New Features

* **envs:**  make getEnv generic (11243627)

## 0.0.26 (2025-06-10)

### Chores

* **root:**  minor updates (fcf02bac)

### New Features

* **envs:**  ability to get next public env outside of react (4824d37d)

## 0.0.25 (2025-06-10)

### Documentation Changes

* **i18n:**
  * update readme (f4c9358c)
  * update readme (55c24fad)

## 0.0.25-alpha-3.0 (2025-06-04)

### Chores

* **root:**  update repodog deps (7b201cb3)

### New Features

* **i18n:**  add library (d08d2853)

### Bug Fixes

* **i18n:**  just check for error rather than message as it has file path (9422b781)

## 0.0.24 (2025-05-28)

### Bug Fixes

* **root:**  vulnerabilities (3aaa4eb1)

## 0.0.23 (2025-05-28)

### Bug Fixes

* **link-extra:**  add legacy behaviour flag back in (f9b5419f)

## 0.0.22 (2025-05-28)

### Refactors

* **root:**  move to swc over babel (45d5d9d8)

## 0.0.21 (2025-05-27)

### Bug Fixes

* **link-extra:**
  * typo (ca056d95)
  * move legacy behaviour flag (b5ec25e1)

## 0.0.20 (2025-05-27)

### Chores

* **root:**  upgrade deps (a7f642c4)

## 0.0.19 (2025-05-08)

### Bug Fixes

* **feature-flags:**  update lock file (c521d67d)

## 0.0.18 (2025-05-08)

### Refactors

* **feature-flags:**  remove cookie functionality (cd1a9f08)

## 0.0.17 (2025-03-14)

### Refactors

* **link-extra:**  move to use nanoid (514afa2d)

## 0.0.16 (2025-03-10)

### Bug Fixes

* wrong search params (420390d4)

## 0.0.15 (2025-03-10)

### Bug Fixes

* regressed url comparison (b14e3bbe)

## 0.0.14 (2025-03-10)

### Bug Fixes

* cache buster changing when clicking link same as location (057f83ae)

## 0.0.13 (2025-03-10)

### Refactors

* **link-extra:**  include search params in comparison to add cache buster (2450a3ea)

## 0.0.12 (2025-03-10)

### Bug Fixes

* **link-extra:**  make Link accept type arg (e50a78ce)

## 0.0.11 (2025-03-09)

### Bug Fixes

* **link-extra:**  update next link type (fcec51c3)

## 0.0.10 (2025-03-09)

### New Features

* **link-extra:**  make href optional and add default hash (9719f5c4)

## 0.0.9 (2025-03-09)

### New Features

* **link-extra:**  add link component (0ef0b05b)

## 0.0.8 (2025-02-25)

### New Features

* **link-extra:**  create package (ce28cd65)

## 0.0.7 (2025-02-23)

### Refactors

* **feature-flags:**  remove setFlag for now to make overrides easier (b70b943a)

## 0.0.6 (2025-02-09)

### New Features

* **root:**  add use client directive to context providers (d4702789)

## 0.0.5 (2025-01-30)

### Bug Fixes

* **feature-flags:**  change to support envs as record (1cc174c0)

## 0.0.4 (2025-01-30)

### Refactors

* **envs:**  change map to record (4243953e)

## 0.0.3 (2025-01-30)

### Bug Fixes

* **envs:**  server build (b612919a)

## 0.0.2 (2025-01-29)

### Documentation Changes

* **root:**  add work in progress to readmes (732622dd)

### New Features

* **root:**  add base packages (70def815)

### Bug Fixes

* **root:**  readme linting (ad47e9a9)

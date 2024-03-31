# Changelog

## v0.3.1 (2024-03-31)

### 🏡 Chores

- Update README

## v0.3.0 (2024-03-30)

### 🔨 Breaking changes

- Rename `@makay/rpc/fetch` to `@makay/rpc/client`

### 🚀 Features

- Add `@makay/rpc/observable`

- Add SSE support

- @makay/rpc/server

  - Add `clearState` and `replaceState` functions to async server state

### 🏡 Chores

- Emit TypeScript declaration maps
- Use 2 spaces indentation in Markdown files

## v0.2.0 (2024-03-25)

### 🚀 Features

- @makay/rpc/result

  - Add `okConst` and `errConst` utility functions

    ```ts
    import { err, errConst } from "@makay/rpc/result"

    err("USER_NOT_FOUND") // => Err<string>

    // these two are equivalent
    err("USER_NOT_FOUND" as const) // => Err<"USER_NOT_FOUND">
    errConst("USER_NOT_FOUND") // => Err<"USER_NOT_FOUND">
    ```

### 🩹 Fixes

- @makay/rpc/hono

  - Prevent context collisions between requests

## v0.1.4 (2024-03-25)

### 🏡 Chores

- Fix README formatting

## v0.1.3 (2024-03-20)

### 🏡 Chores

- Update README

## v0.1.2 (2024-03-20)

### 🏡 Chores

- Update README

## v0.1.1 (2024-03-19)

### 🏡 Chores

- Include LICENSE and README.md

## v0.1.0 (2024-03-19)

### 🚀 Features

- Initial release

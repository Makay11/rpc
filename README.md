# 🌐 @makay/rpc

An RPC library for quick development of seamless full-stack applications.

Powered by a [Vite](https://vitejs.dev/) plugin and inspired by [Telefunc](https://telefunc.com/), [tRPC](https://trpc.io/) and other similar libraries.

---

<div align="center">

[✨ Features](#-features)
[🔧 Installation and setup](#-installation-and-setup)
[🚀 Usage](#-usage)

[📝 Input validation](#-input-validation)
[🚨 Errors](#-errors)
[📦 Async server state](#-async-server-state)
[👍 Results](#-results)

[🔌 Adapters](#-adapters)
[🔥 Hono](#-hono)
[💎 Zod](#-zod)

[🧑🏻‍💻 Contributing](#🧑🏻-contributing)
[📄 License](#-license)

</div>

---

## ✨ Features:

- End-to-end TypeScript
- Zero boilerplate
- Directly import and call tailored server functions from client code
- Colocate server and client files (or don't)
- Front-end and back-end framework agnostic
- Use the [composables](https://vuejs.org/guide/reusability/composables)/[hooks](https://react.dev/reference/react/hooks) pattern in server code
- Extremely small client bundle size addition
- Low server overhead with no implicit run-time validations
- Validation library agnostic
- Includes adapters for popular libraries like [Hono](https://hono.dev/) and [Zod](https://zod.dev/)
- Includes utilities for [results](https://github.com/Makay11/rpc/blob/main/lib/src/result.ts) and [async server state](https://github.com/Makay11/rpc/blob/main/lib/src/server/state.ts)

## 🔧 Installation and setup

1. Install a single package:

   ```sh
   npm i @makay/rpc
   # or
   yarn add @makay/rpc
   # or
   pnpm add @makay/rpc
   # or
   bun add @makay/rpc
   ```

   Everything is included out-of-the-box!

2. Set up the Vite plugin:

   ```ts
   // vite.config.ts
   import { rpc } from "@makay/rpc/vite"
   import { defineConfig } from "vite"

   export default defineConfig({
   	plugins: [rpc()],
   })
   ```

   You can run both `vite` to start a dev server or `vite build` to build for production.

3. Set up the RPC server (example using the included [Hono](https://hono.dev/) adapter):

   ```ts
   // src/server.ts
   import { serve } from "@hono/node-server"
   import { createRpc } from "@makay/rpc/hono"
   import { Hono } from "hono"
   import { cors } from "hono/cors"

   const app = new Hono()

   app.use(
   	"/rpc",
   	cors({ origin: "http://localhost:5173", credentials: true }),
   	await createRpc()
   )

   serve(app, (info) => {
   	console.log(`Server is running on http://localhost:${info.port}`)
   })
   ```

   You can run the above file with something like `npx tsx src/server.ts`.

   You can also run `npx tsx watch src/server.ts` to auto-reload during development.

4. Configure your client:

   ```ts
   // src/main.ts
   import { config } from "@makay/rpc/fetch"

   config.url = "http://localhost:3000/rpc"
   config.credentials = "include"
   ```

## 🚀 Usage

Create client and server files and seamlessly import server types and functions from client code with full TypeScript support!

```ts
// src/components/Todos.ts
import { createTodo, getTodos, type Todo } from "./Todos.server"

let todos: Todo[] = []

async function main() {
	todos = await getTodos()

	console.log(todos)

	const newTodo = await createTodo("New Todo")

	console.log(newTodo)
}

main()
```

```ts
// src/components/Todos.server.ts
export type Todo = {
	id: string
	text: string
}

const todos: Todo[] = []

export async function getTodos() {
	return todos
}

export async function createTodo(text: string) {
	const todo = {
		id: crypto.randomUUID(),
		text,
	}

	todos.push(todo)

	return todo
}
```

Serve the above `src/components/Todos.ts` through Vite and you should see the array of todos printed to your browser console. Reload the page a bunch of times and you should see the array grow since the state is persisted in the server!

In a real scenario you would store your data in a database rather than in the server memory, of course. The snippets above are merely illustrative.

## 📝 Input validation

There is no implicit run-time validation of inputs in the server. In the example above, the function `createTodo` expects a single string argument. However, if your server is exposed publicly, bad actors or misconfigured clients might send something unexpected which can cause undefined behavior in you program.

Therefore, it is **extremely recommended** that you validate all function inputs. You can use any validation library you want for this.

Here's a basic example using [Zod](https://zod.dev/):

```ts
// src/components/Todos.server.ts
import { z } from "zod"

const TextSchema = z.string().min(1).max(256)

export async function createTodo(text: string) {
	TextSchema.parse(text)

	// `text` is now safe to use since Zod would have
	// thrown an error if it was invalid
}
```

When using the [Hono](https://hono.dev/) adapter, for instance, the code above will result in a `500 Internal Server Error` when you send an invalid input. In order to return the expected `400 Bad Request` instead, you have many options depending on the libraries, frameworks, and adapters you are using. Here are a few examples:

1. Catch the [Zod](https://zod.dev/) error and throw a `ValidationError` from `@makay/rpc/server` instead:

   ```ts
   import { ValidationError } from "@makay/rpc/server"

   const TextSchema = z.string().min(1).max(256)

   export async function createTodo(text: string) {
   	try {
   		TextSchema.parse(text)
   	} catch {
   		throw new ValidationError()
   	}

   	// `text` is now safe to use
   ```

   This is of course a bit too verbose to be practical.

2. Use the included [Zod](https://zod.dev/) adapter:

   ```ts
   import { z, zv } from "@makay/rpc/zod"

   const TextSchema = z.string().min(1).max(256)

   export async function createTodo(text: string) {
   	zv(text, TextSchema)

   	// `text` is now safe to use
   }
   ```

   This is much less verbose than the previous option.

3. Use the `onUnhandledError` callback of the [Hono](https://hono.dev/) adapter:

   ```ts
   import { serve } from "@hono/node-server"
   import { createRpc } from "@makay/rpc/hono"
   import { Hono } from "hono"
   import { cors } from "hono/cors"
   import { ZodError } from "zod"

   const app = new Hono()

   const rpc = await createRpc({
   	onUnhandledError(ctx, error) {
   		if (error instanceof ZodError) {
   			return ctx.text(error.message, 400)
   		}

   		throw error
   	},
   })

   app.use(
   	"/rpc",
   	cors({ origin: "http://localhost:5173", credentials: true }),
   	rpc
   )

   serve(app, (info) => {
   	console.log(`Server is running on http://localhost:${info.port}`)
   })
   ```

   This allows you to catch any unhandled [Zod](https://zod.dev/) errors and return `400 Bad Request` regardless of which server function threw the error.

You can easily adapt any of the examples above to work with any libraries and frameworks you are using. Remember that `@makay/rpc` is completely agnostic.

## 🚨 Errors

WIP

## 📦 Async server state

WIP

## 👍 Results

WIP

## 🔌 Adapters

### 🔥 Hono

WIP

### 💎 Zod

WIP

## 🧑🏻‍💻 Contributing

Contributions, issues, suggestions, ideas and discussions are all welcome!

This is an extremely young library and a lot can still change, be added and removed.

## 📄 License

[MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/)

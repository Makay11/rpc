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

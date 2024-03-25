import "./assets/main.css"

import { config } from "@makay/rpc/client"
import { createApp } from "vue"

import App from "./App.vue"

config.url = "http://localhost:3000/rpc"
config.credentials = "include"

createApp(App).mount("#app")

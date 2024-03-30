<script setup lang="ts">
import { useAsyncState } from "@vueuse/core"
import { onBeforeUnmount, ref, watchEffect } from "vue"

import {
	createMessage,
	getMessages,
	getUser,
	login as _login,
	logout as _logout,
	useMessageCreatedEvents,
} from "./OnlineChat.server"

const { isLoading: isLoadingUser, state: user } = useAsyncState(getUser, null)

const username = ref("")

async function login() {
	user.value = await _login(username.value)
}

async function logout() {
	await _logout()
	user.value = null
}

const {
	isLoading: isLoadingMessages,
	state: messages,
	execute: fetchMessages,
} = useAsyncState(getMessages, [], {
	immediate: false,
	shallow: false,
})

let unsubscribe: (() => void) | undefined

onBeforeUnmount(() => {
	unsubscribe?.()
})

watchEffect(async () => {
	if (user.value == null) {
		unsubscribe?.()
		return
	}

	await fetchMessages()

	const messageCreatedEvents = await useMessageCreatedEvents()

	unsubscribe = messageCreatedEvents.subscribe((message) => {
		messages.value.push(message)
	})
})

const newMessageText = ref("")

async function sendMessage() {
	if (newMessageText.value === "") return

	await createMessage(newMessageText.value)

	newMessageText.value = ""
}
</script>

<template>
	<div v-if="isLoadingUser">Loading...</div>

	<form
		v-else-if="user == null"
		@submit.prevent="login()"
	>
		<label>
			Username

			<input
				v-model="username"
				type="text"
			/>
		</label>

		<button type="submit">Login</button>
	</form>

	<template v-else>
		<div>Logged in as "{{ user.username }}" with id "{{ user.id }}"</div>

		<button @click="logout()">Logout</button>

		<div v-if="isLoadingMessages">Loading messages...</div>

		<template v-else>
			<ul>
				<li
					v-for="message in messages"
					:key="message.id"
				>
					{{ message.text }}
				</li>
			</ul>

			<form @submit.prevent="sendMessage()">
				<label>
					New message

					<input
						v-model="newMessageText"
						type="text"
					/>

					<button type="submit">Send</button>
				</label>
			</form>
		</template>
	</template>
</template>

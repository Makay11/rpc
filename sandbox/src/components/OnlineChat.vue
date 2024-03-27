<script setup lang="ts">
import { useAsyncState } from "@vueuse/core"
import { ref } from "vue"

import { getUser, login as _login } from "./OnlineChat.server"

const { isLoading: isLoadingUser, state: user } = useAsyncState(getUser, null)

const username = ref("")

async function login() {
	user.value = await _login(username.value)
}
</script>

<template>
	<div v-if="isLoadingUser">Loading...</div>

	<form
		v-else-if="user == null"
		@submit.prevent="login()"
	>
		<input
			v-model="username"
			type="text"
			placeholder="Username"
		/>

		<button type="submit">Login</button>
	</form>

	<div v-else>{{ user }}</div>

	<!-- <ul>
			<li
			v-for="todo in todos"
			:key="todo.id"
			>
			{{ todo.text }}
		</li>
	</ul>

	<form @submit.prevent="addTodo()">
		<label>
			New Todo

			<input
			v-model="newTodo"
			type="text"
			/>

			<button type="submit">Add</button>
		</label>
	</form> -->
</template>

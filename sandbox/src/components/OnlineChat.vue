<script setup lang="ts">
import { asyncComputed } from "@vueuse/core"
import { watchEffect } from "vue"

import { getUser } from "./OnlineChat.server"

const user = asyncComputed(getUser, null)

watchEffect(() => {
	console.log(user.value)
})
</script>

<template>
	<form></form>

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

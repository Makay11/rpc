<script setup lang="ts">
import { onMounted, type ShallowRef, shallowRef } from "vue"

import { createTodo, getTodos, type Todo } from "./TodoList.server"

const todos: ShallowRef<Todo[]> = shallowRef([])

async function fetchTodos() {
	const todosResult = await getTodos()

	if (todosResult.ok) {
		todos.value = todosResult.value
	} else {
		console.error(todosResult.error)
	}
}

onMounted(async () => {
	await fetchTodos()
})

const newTodo = shallowRef("")

async function addTodo() {
	const todoResult = await createTodo(newTodo.value)

	if (todoResult.ok) {
		newTodo.value = ""

		await fetchTodos()
	} else {
		console.error(todoResult.error)
	}
}
</script>

<template>
	<ul>
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
	</form>
</template>

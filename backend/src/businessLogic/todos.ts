import { TodosAccess } from '../dataLayer/TodosAccess'
import { getAttachmentUrl, getUploadUrl } from '../dataLayer/todosStorage'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('todos')

const todosAccess = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  const todos = await todosAccess.getTodoItems(userId)

  logger.info(`Get todos for user — ${userId}`)
  return todos
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  logger.info(`Create todo — ${todoId} for user ${userId}`, {
    userId,
    todoId,
    todoItem: newItem
  })

  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  const item = await todosAccess.getTodoItem(todoId, userId)
  if (!item) throw new Error('Item not found')

  await todosAccess.updateTodoItem(
    todoId,
    updateTodoRequest as TodoUpdate,
    userId
  )
}

export async function deleteTodo(todoId: string, userId: string) {
  const item = await todosAccess.getTodoItem(todoId, userId)

  if (!item) throw new Error('Item not found')

  await todosAccess.deleteTodoItem(todoId, userId)
  logger.info(`Delete todo ${todoId} for user ${userId}`, { userId, todoId })
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentId: string
) {
  logger.info(`Generate attachment URL: ${attachmentId}`)

  const attachmentUrl = await getAttachmentUrl(attachmentId)

  const item = await todosAccess.getTodoItem(todoId, userId)
  if (!item) throw new Error('Item not found')

  await todosAccess.updateAttachmentUrl(todoId, userId, attachmentUrl)
}

export async function createAttachmentPresignedUrl(
  attachmentId: string
): Promise<string> {
  const uploadUrl = await getUploadUrl(attachmentId)

  logger.info(`Generate upload URL for attachment ${attachmentId}`)

  return uploadUrl
}

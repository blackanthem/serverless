import { TodosAccess } from '../dataLayer/TodosAccess'
import { TodosStorage } from '../dataLayer/TodosStorage'
// import { AttachmentUtils } from './attachmentUtils'
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
const todosStorage = new TodosStorage()

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
  logger.info(`Update todo — ${todoId} for user ${userId}`, {
    userId,
    todoId,
    todoUpdate: updateTodoRequest
  })

  const item = await todosAccess.getTodoItem(todoId)

  if (!item) throw new Error('Item not found') // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(
      `User ${userId} does not have permission to update todo ${todoId}`
    )
    throw new Error('User is not authorized to update item') // FIXME: 403?
  }

  todosAccess.updateTodoItem(todoId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  const item = await todosAccess.getTodoItem(todoId)

  if (!item) throw new Error('Item not found') // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(
      `User ${userId} does not have permission to delete todo ${todoId}`
    )
    throw new Error('User is not authorized to delete item') // FIXME: 403?
  }

  todosAccess.deleteTodoItem(todoId)
  logger.info(`Delete todo ${todoId} for user ${userId}`, { userId, todoId })
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentId: string
) {
  logger.info(`Generating attachment URL for attachment ${attachmentId}`)

  const attachmentUrl = await todosStorage.getAttachmentUrl(attachmentId)

  logger.info(`Updating todo ${todoId} with attachment URL ${attachmentUrl}`, {
    userId,
    todoId
  })

  const item = await todosAccess.getTodoItem(todoId)

  if (!item) throw new Error('Item not found') //TODO: FIXME: 404?

  if (item.userId !== userId) {
    logger.error(
      `User ${userId} does not have permission to update todo ${todoId}`
    )
    throw new Error('User is not authorized to update item') // FIXME: 403?
  }

  await todosAccess.updateAttachmentUrl(todoId, attachmentUrl)
}

export async function createAttachmentPresignedUrl(attachmentId: string): Promise<string> {
  const uploadUrl = await todosStorage.getUploadUrl(attachmentId)

  logger.info(`Generate upload URL for attachment ${attachmentId}`)

  return uploadUrl
}

import 'source-map-support/register'

import { APIGatewayProxyEvent } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodos')

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.info('Handle Delete Todo request', { event })

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId

  try {
    await deleteTodo(todoId, userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: '',
      isBase64Encoded: false
    }
  } catch (error) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: 'Resource not found',
      isBase64Encoded: false
    }
  }
}

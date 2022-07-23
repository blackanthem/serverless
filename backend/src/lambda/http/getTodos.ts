import 'source-map-support/register'

import {
  APIGatewayProxyEvent
  //   // APIGatewayProxyHandler,
  //   // APIGatewayProxyResult
} from 'aws-lambda'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

// DONE: Get all TODO items for a current user
const logger = createLogger('getTodos')

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    logger.info('Handle Get Todos request', { event })

    const userId = getUserId(event)
    const items = await getTodosForUser(userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ items }),
      isBase64Encoded: false
    }
  } catch (error) {
    logger.error('Error: Handle Get Todos request', { error })
  }
}

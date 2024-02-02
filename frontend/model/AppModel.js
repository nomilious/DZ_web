const API_BASE_URL = 'http://localhost:4321'

export default class AppModel {
  static async fetchData(url, method, bodyData = {}, message = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/${url}`, {
        method,
        body: method !== 'GET' ? JSON.stringify(bodyData) : undefined,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      let responseBody = null
      if (method === 'GET') responseBody = await response.json()

      if (response.status !== 200) return Promise.reject(responseBody)

      return responseBody
        ? responseBody.data
        : {
            timestamp: new Date().toISOString(),
            message: message,
          }
    } catch (err) {
      return Promise.reject({
        timestamp: new Date().toISOString(),
        statusCode: 0,
        message: err,
      })
    }
  }
  static async getWorkers() {
    return AppModel.fetchData('workers', 'GET')
  }
  static async addworkers({ id = null, name = '', position = -1 }) {
    return AppModel.fetchData(
      'workers',
      'POST',
      {
        id,
        name,
        position,
      },
      'Success addworkers'
    )
  }
  static async addTasks({ id = null, text = '', position = -1, workerId = null }) {
    return AppModel.fetchData(
      'tasks',
      'POST',
      {
        id,
        text,
        position,
        workerId,
      },
      'Success addTasks'
    )
  }
  static async editTasks({ id = null, text = '', position = -1 }) {
    return AppModel.fetchData(
      `tasks/${id}`,
      'PATCH',
      {
        text,
        position,
      },
      'Success editTasks'
    )
  }
  static async editMultipleTasks({ reorderedTasks = [] }) {
    return AppModel.fetchData('tasks', 'PATCH', { reorderedTasks }, 'Success editMultipleTasks')
  }
  static async deleteTasks({ id = null }) {
    return AppModel.fetchData(`tasks/${id}`, 'DELETE', {}, 'Success deleteTasks')
  }
  static async moveTasks({ id = null, srcTasklistId = null, destTasklistId = null }) {
    return AppModel.fetchData(
      'workers',
      'PATCH',
      {
        id,
        srcTasklistId,
        destTasklistId,
      },
      'Success moveTasks'
    )
  }
}

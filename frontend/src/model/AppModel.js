const API_BASE_URL = 'http://localhost:4321';

export default class AppModel {
  static async fetchData(url, method, bodyData = {}, message = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/${url}`, {
        method,
        body: method !== 'GET' ? JSON.stringify(bodyData) : undefined,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      let responseBody = null;
      if (method === 'GET') responseBody = await response.json();

      if (response.ok !== true) throw new Error(await response.text());

      return responseBody
        ? responseBody
        : {
            timestamp: new Date().toISOString(),
            message,
          };
    } catch (err) {
      // if could not fetch or response.ok !== true
      throw new Error(err);
    }
  }
  static async getWorkers() {
    return await AppModel.fetchData('workers', 'GET');
  }
  static async getEquipment() {
    return await AppModel.fetchData('equipment', 'GET');
  }
  static async addWorkers({ id = null, fio = '' }) {
    return await AppModel.fetchData(
      'workers',
      'POST',
      {
        id,
        fio,
      },
      'Success addworkers'
    );
  }
  static async addRequest({ id = null, startDate = '', endDate = '', equipmentId = null, workerId = null }) {
    try {
      return await AppModel.fetchData(
        'requests',
        'POST',
        {
          id,
          startDate,
          endDate,
          equipmentId,
          workerId,
        },
        'Success addRequest'
      );
    } catch (err) {
      console.log(err.message);
      throw new Error('Error addRequest');
    }
  }
  static async updateRequest({ id, startDate, endDate, equipmentId }) {
    try {
      return await AppModel.fetchData(
        `requests/${id}`,
        'PATCH',
        {
          startDate,
          endDate,
          equipmentId,
        },
        'Success updateRequest'
      );
    } catch (err) {
      console.log(err.message);
      throw new Error('Error updateRequest');
    }
  }
  static async deleteRequest({ id = null }) {
    try {
      return await AppModel.fetchData(`requests/${id}`, 'DELETE', {}, 'Success deleteTasks');
    } catch (err) {
      console.log(err.message);
      throw new Error('Error deleteRequest');
    }
  }
  static async updateWorker({ id, fio }) {
    try {
      return await AppModel.fetchData(`workers/${id}`, 'PATCH', { fio }, 'Success updateWorker');
    } catch (err) {
      console.log(err.message);
      throw new Error('Error updateWorker');
    }
  }
  static async deleteWorker({ id = null }) {
    try {
      return await AppModel.fetchData(`workers/${id}`, 'DELETE', {}, 'Success deleteWorker');
    } catch (err) {
      console.log(err.message);
      throw new Error('Error deleteWorker');
    }
  }
  static async moveRequest({ id = null, srcWorkerId = null, destWorkerId = null }) {
    try {
      return await AppModel.fetchData(
        `workers/move/${id}`,
        'PATCH',
        {
          srcWorkerId,
          destWorkerId,
        },
        'Success moveTasks'
      );
    } catch (err) {
      console.log(err.message);
      throw new Error('Error moveRequest');
    }
  }
}

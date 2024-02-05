import Request from './Request.js'
import AppModel from '../model/AppModel'

export default class Worker {
  #requests = []
  #name = ''
  #id = null

  constructor({ id = null, name, onDropRequestIn, onEditRequest, onDeleteRequest }) {
    this.#id = id || crypto.randomUUID()
    this.#name = name
    this.onDropRequestIn = onDropRequestIn
    this.onEditRequest = onEditRequest
    this.onDeleteRequest = onDeleteRequest
  }

  get id() {
    return this.#id
  }

  addRequest = ({ request }) => this.#requests.push(request)

  getRequestById = ({ reqId }) => this.#requests.find(req => req.id === reqId)

  deleteRequest = ({ reqId }) => {
    const deletedIndex = this.#requests.findIndex(req => req.id === reqId)

    if (deletedIndex === -1) return

    const [deletedTask] = this.#requests.splice(deletedIndex, 1)

    return deletedTask
  }

  reorderRequests = async () => {
    const orderedTasksIDs = Array.from(
      document.querySelector(`[id="${this.#id}"] .worker__tasks-list`).children,
      elem => elem.getAttribute('id')
    )
    let reorderTaskInfo = []

    orderedTasksIDs.forEach((taskID, position) => {
      const task = this.#requests.find(task => task.taskID === taskID)
      if (task.taskPosition !== position) {
        reorderTaskInfo.push({ id: taskID, position })
        task.taskPosition = position
      }
    })
    if (reorderTaskInfo.length >= 1) {
      try {
        await AppModel.editMultipleTasks({
          reorderedTasks: reorderTaskInfo,
        })
      } catch (error) {
        console.error(error)
      }
    }
  }

  onAddNewRequest = async (e) => {
    const modal = document.getElementById('myModal');
    modal.showModal();
    modal.querySelector('form').addEventListener('submit', async(e) => {
      e.stopPropagation();

      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      const equipmentId = document.getElementById('equipmentId').value;

      try {
        const res = await AppModel.addRequest({
          id: crypto.randomUUID(),
          startDate,
          endDate,
          equipmentId,
          workerId: this.#id
        });
      } catch (error) {
        console.error(error);
      }
    });
  }
  onAddNewRequestLocal = ({ id = null, dateStart = '', dateEnd = '',equipment }) => {
    const newTask = new Request({
      id,
      dateStart,
      dateEnd,
      equipment,
      // onEditTask: this.onEditRequest,
      // onDeleteTask: this.onDeleteRequest,
    })
    this.#requests.push(newTask)

    const newTaskElement = newTask.render()
    document.querySelector(`[id="${this.#id}"] .worker__requests-list`).appendChild(newTaskElement)
  }

  render() {
    const liElement = document.createElement('li')
    liElement.classList.add('workers-list__item', 'worker')
    liElement.setAttribute('id', this.#id)
    liElement.addEventListener('dragstart', () => localStorage.setItem('srcTasklistID', this.#id))
    liElement.addEventListener('drop', this.onDropRequestIn)

    const h2Element = document.createElement('h2')
    h2Element.classList.add('worker__name')
    h2Element.innerHTML = this.#name
    liElement.appendChild(h2Element)

    const innerUlElement = document.createElement('ul')
    innerUlElement.classList.add('worker__requests-list')
    liElement.appendChild(innerUlElement)

    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.classList.add('worker__add-request-btn')
    button.innerHTML = '&#10010; Добавить запрос'
    button.addEventListener('click', this.onAddNewRequest)
    liElement.appendChild(button)

    const adderElement = document.querySelector('.worker-adder')
    adderElement.parentElement.insertBefore(liElement, adderElement)
  }
}
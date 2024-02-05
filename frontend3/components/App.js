import Worker from './Worker.js'
import AppModel from '../model/AppModel'
import Equipment from './Equipment.js'

export default class App {
  #workers = []
  #equipment = []

  onEscapeKeydown = event => {
    if (event.key === 'Escape') {
      const input = document.querySelector('.worker-adder__input')
      input.style.display = 'none'
      input.value = ''

      document.querySelector('.worker-adder__btn').style.display = 'inherit'
    }
  }

  onInputKeydown = async event => {
    if (event.key !== 'Enter') return

    if (event.target.value) {
      const workerId = crypto.randomUUID()
      try {
        const res = await AppModel.addWorkers({
          id: workerId,
          fio: event.target.value,
        })
        console.log('added to model')
        const newTasklist = new Worker({
          id: workerId,
          name: event.target.value,
          onDropTaskInTasklist: this.onDropRequestIn,
          onEditTask: this.onEditRequest,
          onDeleteTask: this.onDeleteRequest,
        })
        console.log('created local')

        this.#workers.push(newTasklist)
        newTasklist.render()
        console.log(res)
      } catch (error) {
        console.error(error)
      }
    }

    event.target.style.display = 'none'
    event.target.value = ''

    document.querySelector('.worker-adder__btn').style.display = 'inherit'
  }

  onDropRequestIn = async evt => {
    evt.stopPropagation()

    const destTasklistElement = evt.currentTarget
    destTasklistElement.classList.remove('worker_droppable')

    const movedTaskID = localStorage.getItem('movedTaskID')
    const srcTasklistID = localStorage.getItem('srcTasklistID')
    const destTasklistID = destTasklistElement.getAttribute('id')

    localStorage.setItem('movedTaskID', '')
    localStorage.setItem('srcTasklistID', '')

    if (!destTasklistElement.querySelector(`[id="${movedTaskID}"]`)) return

    const srcTasklist = this.#workers.find(worker => worker.id === srcTasklistID)
    const destTasklist = this.#workers.find(worker => worker.id === destTasklistID)

    try {
      if (srcTasklistID !== destTasklistID) {
        const res = await AppModel.moveTasks({
          id: movedTaskID,
          srcTasklistId: srcTasklistID,
          destTasklistId: destTasklistID,
        })
        const movedRequest = srcTasklist.deleteRequest({
          taskID: movedTaskID,
        })
        destTasklist.addRequest({ request: movedRequest })

        srcTasklist.reorderRequests()
      }

      destTasklist.reorderRequests()
    } catch (error) {
      console.error(error)
    }
  }

  onEditRequest = async ({ reqId }) => {
    let fTask = null
    for (let worker of this.#workers) {
      fTask = worker.getRequestById({ reqId })
      if (fTask) break
    }

    const curTaskText = fTask.taskText
    const newTaskText = prompt('Введите новое описание задачи')

    if (!newTaskText || newTaskText === curTaskText) return
    try {
      const res = await AppModel.editTasks({
        id: reqId,
        text: newTaskText,
      })

      fTask.taskText = newTaskText

      document.querySelector(`[id="${reqId}"] span.task__text`).innerHTML = newTaskText
      console.log(res)
    } catch (error) {
      console.error(error)
    }
  }

  onDeleteRequest = async ({ reqId }) => {
    let fTask = null
    let fTasklist = null
    for (let worker of this.#workers) {
      fTasklist = worker
      fTask = worker.getRequestById({ reqId })
      if (fTask) break
    }

    // const taskShouldBeDeleted = confirm(
    //     `Задача '${fTask.taskText}' будет удалена. Прододлжить?`
    // );

    // if (!taskShouldBeDeleted) return;
    try {
      const res = await AppModel.deleteTasks({ id: reqId })
      fTasklist.deleteRequest({ reqId })
      document.getElementById(reqId).remove()
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }

  fillModalForm = async() => {
    try {
      const equipmentData = await AppModel.getEquipment();
      this.#equipment = equipmentData;
      const equipmentSelect = document.getElementById('equipmentId');
      equipmentSelect.innerHTML = ""; // Clear existing options

      equipmentData.forEach((equipment) => {
        const option = document.createElement('option');
        option.value = equipment.id;
        option.text = equipment.title;
        equipmentSelect.appendChild(option);
      });

    } catch (e) {
      console.error('Error fillModalForm, ', e);
    }
  }

  async init() {
    await this.fillModalForm()
    document.querySelector('.worker-adder__btn').addEventListener('click', event => {
      event.target.display = 'none'

      const input = document.querySelector('.worker-adder__input')
      input.style.display = 'inherit'
      input.focus()
    })

    document.addEventListener('keydown', this.onEscapeKeydown)

    document.querySelector('.worker-adder__input').addEventListener('keydown', this.onInputKeydown)

    document.getElementById('theme-switch').addEventListener('change', evt => {
      evt.target.checked ? document.body.classList.add('dark-theme') : document.body.classList.remove('dark-theme')
    })

    document.addEventListener('dragover', evt => {
      evt.preventDefault()

      const draggedElement = document.querySelector('.task.task_selected')
      const draggedElementPrevList = draggedElement.closest('.worker')

      const currentElement = evt.target
      const prevDroppable = document.querySelector('.worker_droppable')
      let curDroppable = evt.target
      while (!curDroppable.matches('.worker') && curDroppable !== document.body) {
        curDroppable = curDroppable.parentElement
      }

      if (curDroppable !== prevDroppable) {
        if (prevDroppable) prevDroppable.classList.remove('worker_droppable')

        if (curDroppable.matches('.worker')) {
          curDroppable.classList.add('worker_droppable')
        }
      }

      if (!curDroppable.matches('.worker') || draggedElement === currentElement) return

      if (curDroppable === draggedElementPrevList) {
        if (!currentElement.matches('.task')) return

        const nextElement =
          currentElement === draggedElement.nextElementSibling ? currentElement.nextElementSibling : currentElement

        curDroppable.querySelector('.worker__tasks-list').insertBefore(draggedElement, nextElement)

        return
      }

      if (currentElement.matches('.task')) {
        curDroppable.querySelector('.worker__tasks-list').insertBefore(draggedElement, currentElement)

        return
      }

      if (!curDroppable.querySelector('.worker__tasks-list').children.length) {
        curDroppable.querySelector('.worker__tasks-list').appendChild(draggedElement)
      }
    })
    try {
      const workers = await AppModel.getWorkers()

      for (const worker of workers) {
        const workerObject = new Worker({
          id: worker.id,
          name: worker.name,
          equipment: this.#equipment,
          onDropRequestIn: this.onDropRequestIn,
          onEditRequest: this.onEditRequest,
          onDeleteRequest: this.onDeleteRequest,
        })
        this.#workers.push(workerObject)
        workerObject.render()

        for (const request of worker.requests) {
          const {id, title, available} = request.equipment
          const equipment = new Equipment({
            id,
            title,
            available
          })
          workerObject.onAddNewRequestLocal({
            id: request.id,
            dateStart: request.dateStart,
            dateEnd: request.dateEnd,
            equipment: equipment
          })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}

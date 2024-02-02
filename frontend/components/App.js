import Tasklist from './Tasklist'
import AppModel from '../model/AppModel'

export default class App {
  #workers = []

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
        const res = await AppModel.addTasklists({
          id: workerId,
          name: event.target.value,
          position: this.#workers.length,
        })
        console.log('add to model')
        const newTasklist = new Tasklist({
          id: workerId,
          name: event.target.value,
          position: this.#workers.length,
          onDropTaskInTasklist: this.onDropTaskInTasklist,
          onEditTask: this.onEditTask,
          onDeleteTask: this.onDeleteTask,
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

  onDropTaskInTasklist = async evt => {
    evt.stopPropagation()

    const destTasklistElement = evt.currentTarget
    destTasklistElement.classList.remove('worker_droppable')

    const movedTaskID = localStorage.getItem('movedTaskID')
    const srcTasklistID = localStorage.getItem('srcTasklistID')
    const destTasklistID = destTasklistElement.getAttribute('id')

    localStorage.setItem('movedTaskID', '')
    localStorage.setItem('srcTasklistID', '')

    if (!destTasklistElement.querySelector(`[id="${movedTaskID}"]`)) return

    const srcTasklist = this.#workers.find(worker => worker.workerID === srcTasklistID)
    const destTasklist = this.#workers.find(worker => worker.workerID === destTasklistID)

    try {
      if (srcTasklistID !== destTasklistID) {
        const res = await AppModel.moveTasks({
          id: movedTaskID,
          srcTasklistId: srcTasklistID,
          destTasklistId: destTasklistID,
        })
        const movedTask = srcTasklist.deleteTask({
          taskID: movedTaskID,
        })
        destTasklist.addTask({ task: movedTask })

        srcTasklist.reorderTasks()
      }

      destTasklist.reorderTasks()
    } catch (error) {
      console.error(error)
    }
  }

  onEditTask = async ({ taskID }) => {
    let fTask = null
    for (let worker of this.#workers) {
      fTask = worker.getTaskById({ taskID })
      if (fTask) break
    }

    const curTaskText = fTask.taskText
    const newTaskText = prompt('Введите новое описание задачи')

    if (!newTaskText || newTaskText === curTaskText) return
    try {
      const res = await AppModel.editTasks({
        id: taskID,
        text: newTaskText,
      })

      fTask.taskText = newTaskText

      document.querySelector(`[id="${taskID}"] span.task__text`).innerHTML = newTaskText
      console.log(res)
    } catch (error) {
      console.error(error)
    }
  }

  onDeleteTask = async ({ taskID }) => {
    let fTask = null
    let fTasklist = null
    for (let worker of this.#workers) {
      fTasklist = worker
      fTask = worker.getTaskById({ taskID })
      if (fTask) break
    }

    // const taskShouldBeDeleted = confirm(
    //     `Задача '${fTask.taskText}' будет удалена. Прододлжить?`
    // );

    // if (!taskShouldBeDeleted) return;
    try {
      const res = await AppModel.deleteTasks({ id: taskID })
      fTasklist.deleteTask({ taskID })
      document.getElementById(taskID).remove()
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }

  async init() {
    document.querySelector('.worker-adder__btn').addEventListener('click', event => {
      event.target.style.display = 'none'

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
      console.log(`workers= ${workers}`)
      for (const worker of workers) {
        const workerObject = new Tasklist({
          id: worker.id,
          name: worker.fio,
          onDropTaskInTasklist: this.onDropTaskInTasklist,
          onEditTask: this.onEditTask,
          onDeleteTask: this.onDeleteTask,
        })
        this.#workers.push(workerObject)
        workerObject.render()

        for (const task of worker.tasks) {
          workerObject.onAddNewTaskLocal({
            id: task.id,
            text: task.text,
            position: task.position,
          })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}

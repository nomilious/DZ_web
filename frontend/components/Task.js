export default class Task {
  #taskID = null
  #taskText = ''
  #taskPosition = -1

  constructor({
    id = null,
    text,
    position,
    // onMoveTask,
    onEditTask,
    onDeleteTask,
  }) {
    this.#taskID = id || crypto.randomUUID()
    this.#taskText = text
    this.#taskPosition = position
    // this.onMoveTask = onMoveTask;
    this.onEditTask = onEditTask
    this.onDeleteTask = onDeleteTask
  }

  get taskID() {
    return this.#taskID
  }

  get taskText() {
    return this.#taskText
  }
  set taskText(value) {
    if (typeof value === 'string') {
      this.#taskText = value
    }
  }

  get taskPosition() {
    return this.#taskPosition
  }
  set taskPosition(value) {
    if (typeof value === 'number' && value >= 0) {
      this.#taskPosition = value
    }
  }

  render() {
    const liElement = document.createElement('li')
    liElement.classList.add('worker__tasks-list-item', 'task')
    liElement.setAttribute('id', this.#taskID)
    liElement.setAttribute('draggable', true)
    liElement.addEventListener('dragstart', evt => {
      evt.target.classList.add('task_selected')
      localStorage.setItem('movedTaskID', this.#taskID)
    })
    liElement.addEventListener('dragend', evt => evt.target.classList.remove('task_selected'))

    const span = document.createElement('span')
    span.classList.add('task__text')
    span.innerHTML = this.#taskText
    liElement.appendChild(span)

    const controlsDiv = document.createElement('div')
    controlsDiv.classList.add('task__controls')

    const lowerRowDiv = document.createElement('div')
    lowerRowDiv.classList.add('task__controls-row')

    const editBtn = document.createElement('button')
    editBtn.setAttribute('type', 'button')
    editBtn.classList.add('task__contol-btn', 'edit-icon')
    editBtn.addEventListener('click', () => this.onEditTask({ taskID: this.#taskID }))
    lowerRowDiv.appendChild(editBtn)

    const deleteBtn = document.createElement('button')
    deleteBtn.setAttribute('type', 'button')
    deleteBtn.classList.add('task__contol-btn', 'delete-icon')
    deleteBtn.addEventListener('click', () => this.onDeleteTask({ taskID: this.#taskID }))
    lowerRowDiv.appendChild(deleteBtn)

    controlsDiv.appendChild(lowerRowDiv)

    liElement.appendChild(controlsDiv)

    return liElement
  }
}

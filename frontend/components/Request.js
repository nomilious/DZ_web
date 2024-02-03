export default class Request {
  #id = null
  #dateStart = ''
  #dateEnd = ''
  #equipment = null

  constructor({
    id = null,
    dateStart,
    dateEnd,
    equipment,
    // onMoveTask,
    // onEditTask,
    // onDeleteTask,
  }) {
    this.#id = id || crypto.randomUUID()
    this.#dateStart = dateStart.split('T')[0]
    this.#dateEnd = dateEnd.split('T')[0]
    this.#equipment = equipment
    // this.onMoveTask = onMoveTask;
    // this.onEditTask = onEditTask
    // this.onDeleteTask = onDeleteTask
  }

  get id() {
    return this.#id
  }

  get dateStart() {
    return this.#dateStart;
  }

  render() {
    const liElement = document.createElement('li')
    liElement.classList.add('worker__requests-list-item', 'request')
    liElement.setAttribute('id', this.#id)
    liElement.setAttribute('draggable', true)
    liElement.addEventListener('dragstart', evt => {
      evt.target.classList.add('request_selected')
      localStorage.setItem('movedTaskID', this.#id)
    })
    liElement.addEventListener('dragend', evt => evt.target.classList.remove('request_selected'))

   // request text inside
    const div = document.createElement('div');
    div.classList.add('request');
    console.log(this.#dateStart, this.#dateEnd)

    const title = document.createElement('span');
    title.classList.add('request__text', 'request__title');
    title.innerHTML = this.#equipment.title;

    const startDate = document.createElement('span');
    startDate.classList.add('request__text', 'request__start-date');
    startDate.innerHTML = this.#dateStart;

    const endDate = document.createElement('span');
    endDate.classList.add('request__text', 'request__end-date');
    endDate.innerHTML = this.#dateEnd;

    div.appendChild(title);
    div.appendChild(startDate);
    div.appendChild(endDate);

    liElement.appendChild(div);
    // end of part =============

    const controlsDiv = document.createElement('div')
    controlsDiv.classList.add('request__controls')

    const lowerRowDiv = document.createElement('div')
    lowerRowDiv.classList.add('request__controls-row')

    const editBtn = document.createElement('button')
    editBtn.setAttribute('type', 'button')
    editBtn.classList.add('request__contol-btn', 'edit-icon')
    editBtn.addEventListener('click', () => this.onEditTask({ taskID: this.#id }))
    lowerRowDiv.appendChild(editBtn)

    const deleteBtn = document.createElement('button')
    deleteBtn.setAttribute('type', 'button')
    deleteBtn.classList.add('request__contol-btn', 'delete-icon')
    deleteBtn.addEventListener('click', () => this.onDeleteTask({ taskID: this.#id }))
    lowerRowDiv.appendChild(deleteBtn)

    controlsDiv.appendChild(lowerRowDiv)

    liElement.appendChild(controlsDiv)

    return liElement
  }
}

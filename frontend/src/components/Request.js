import React, { Component } from 'react'

class Request extends Component {
  constructor({
    id,
    dateStart,
    dateEnd,
    equipment,
    // onMoveTask,
    // onEditTask,
    // onDeleteTask,
  }) {
    super()
    this.state = {
      id: id || crypto.randomUUID(),
      dateStart,
      dateEnd,
      equipment,
    }
  }

  getId = () => this.state.id
  getStartDate = () => this.state.dateStart

  handleDragStart = evt => {
    evt.target.classList.add('request_selected')
    localStorage.setItem('movedTaskID', this.state.id)
  }

  handleDragEnd = evt => {
    evt.target.classList.remove('request_selected')
  }

  render() {
    return (
      <li
        className='worker__requests-list-item request'
        id={this.state.id}
        draggable
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
      >
        <div className='request'>
          <span className='request__text request__title'>{this.state.equipment.title}</span>
          <span className='request__text request__start-date'>{this.state.dateStart}</span>
          <span className='request__text request__end-date'>{this.state.dateEnd}</span>
        </div>

        <div className='request__controls'>
          <div className='request__controls-row'>
            <button
              type='button'
              className='request__contol-btn edit-icon'
              // onClick={this.handleEditTask}
            >
              Edit
            </button>
            <button
              type='button'
              className='request__contol-btn delete-icon'
              // onClick={this.handleDeleteTask}
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    )
  }
}

export default Request

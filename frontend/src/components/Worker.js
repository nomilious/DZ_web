// import Equipment from './Equipment'
import React, { Component } from 'react'
import AppModel from './../model/AppModel'
import Request from './Request'

class Worker extends Component {
  constructor({ id = null, name, onDropRequestIn, onEditRequest, onDeleteRequest, equipment = [], requests = [] }) {
    super()
    this.state = {
      id: id,
      name: name,
      equipment: equipment,
      requests: requests,
      onDropRequestIn: onDropRequestIn,
      onEditRequest: onEditRequest,
      onDeleteRequest: onDeleteRequest,
    }
  }

  getRequestById = ({ reqId }) => this.state.requests.find(req => req.id === reqId)

  deleteRequest = ({ reqId }) => {
    const deletedIndex = this.state.requests.findIndex(req => req.id === reqId)

    if (deletedIndex === -1) return

    const [deletedTask] = this.state.requests.splice(deletedIndex, 1)

    return deletedTask
  }
  reorderRequests = async () => {
    const orderedTasksIDs = Array.from(
      document.querySelector(`[id="${this.state.id}"] .worker__tasks-list`).children,
      elem => elem.getAttribute('id')
    )
    let reorderTaskInfo = []

    orderedTasksIDs.forEach((taskID, position) => {
      const task = this.state.requests.find(task => task.taskID === taskID)
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
  onAddNewRequest = async e => {
    const modal = document.getElementById('myModal')
    modal.showModal()

    // TODO move above
    modal.querySelector('form').addEventListener(
      'submit',
      async e => {
        const startDate = document.getElementById('startDate').value
        const endDate = document.getElementById('endDate').value
        const equipmentId = document.getElementById('equipmentId').value

        try {
          const id = crypto.randomUUID()
          // const res =
          await AppModel.addRequest({
            id,
            startDate,
            endDate,
            equipmentId,
            workerId: this.state.id,
          })

          const equipmentData = this.state.equipment.filter(equipment => equipment.id === equipmentId)[0]
          this.onAddNewRequestLocal({
            id,
            startDate,
            endDate,
            equipment: { ...equipmentData },
          })
        } catch (error) {
          console.error(error.message)
        }
      },
      { once: true }
    )
    // clear the form
    modal.querySelector('form').reset()
  }
  onAddNewRequestLocal = ({ id = null, startDate = '', endDate = '', equipment }) => {
    const newRequest = {
      id,
      startDate,
      endDate,
      equipment,
      // onEditTask: this.state.onEditRequest,
      // onDeleteTask: this.state.onDeleteRequest,
    }
    this.setState(prevState => ({
      ...prevState,
      requests: [...prevState.requests, newRequest],
    }))

    // const newTaskElement = newTask.render()
    // document.querySelector(`[id="${this.state.id}"] .worker__requests-list`).appendChild(newTaskElement)
  }

  render() {
    return (
      <li
        className='workers-list__item worker'
        id={this.state.id}
        onDragStart={() => localStorage.setItem('srcTasklistID', this.state.id)}
        onDrop={this.state.onDropRequestIn}
      >
        <h2 className='worker__name'>{this.state.name}</h2>
        <ul className='worker__requests-list'>
          {this.state.requests.map(request => (
            <Request
              id={request.id}
              dateStart={request.dateStart}
              dateEnd={request.dateEnd}
              equipment={request.equipment}
            />
          ))}
        </ul>
        <button type='button' className='worker__add-request-btn' onClick={this.onAddNewRequest}>
          &#10010; Добавить запрос
        </button>
      </li>
    )
  }
}

export default Worker

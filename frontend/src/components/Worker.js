import React, { Component } from 'react';
import AppModel from './../model/AppModel';
import Request from './Request';

class Worker extends Component {
  constructor({
    id,
    name,
    requests = [],
    onDropRequestIn,
    onEditRequest,
    onDeleteRequest,
    showModalAndCallback,
    equipment = [],
  }) {
    super();
    this.state = {
      id,
      name,
      equipment,
      requests,
      onDropRequestIn,
      onEditRequest,
      onDeleteRequest,
      showModalAndCallback,
    };
  }
  reorderRequests = async () => {
    const orderedTasksIDs = Array.from(
      document.querySelector(`[id="${this.state.id}"] .worker__tasks-list`).children,
      elem => elem.getAttribute('id')
    );
    let reorderTaskInfo = [];

    orderedTasksIDs.forEach((taskID, position) => {
      const task = this.state.requests.find(task => task.taskID === taskID);
      if (task.taskPosition !== position) {
        reorderTaskInfo.push({ id: taskID, position });
        task.taskPosition = position;
      }
    });
    if (reorderTaskInfo.length >= 1) {
      try {
        await AppModel.editMultipleTasks({
          reorderedTasks: reorderTaskInfo,
        });
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }
  };

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
          {this.state.requests.map((request, ind) => (
            <Request
              key={request.equipment.id + request.dateStart + request.dateEnd}
              id={request.id}
              dateStart={request.dateStart}
              dateEnd={request.dateEnd}
              equipment={request.equipment}
              onEditRequest={this.state.onEditRequest}
              onDeleteRequest={({ reqId }) => this.state.onDeleteRequest({ reqId })}
            />
          ))}
        </ul>
        <button
          type='button'
          className='worker__add-request-btn'
          onClick={async () => this.state.showModalAndCallback({ workerId: this.state.id })}
        >
          &#10010; Добавить запрос
        </button>
      </li>
    );
  }
}

export default Worker;

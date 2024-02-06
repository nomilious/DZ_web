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
  onSubmitAction = async () => {
    const dateStart = document.getElementById('startDate').value;
    const dateEnd = document.getElementById('endDate').value;
    const equipmentId = document.getElementById('equipmentId').value;

    try {
      const id = crypto.randomUUID();
      // const res =
      await AppModel.addRequest({
        id,
        startDate: dateStart,
        endDate: dateEnd,
        equipmentId,
        workerId: this.state.id,
      });

      const equipmentData = this.state.equipment.filter(equipment => equipment.id === equipmentId)[0];

      this.onAddNewRequestLocal({
        id,
        dateStart,
        dateEnd,
        equipment: { ...equipmentData },
      });
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  };
  onAddNewRequestLocal = ({ id, dateStart, dateEnd, equipment }) => {
    const newRequest = {
      id,
      dateStart,
      dateEnd,
      equipment,
      // onEditTask: this.state.onEditRequest,
      onDeleteRequest: this.state.onDeleteRequest,
    };
    this.setState(prevState => ({
      ...prevState,
      requests: [...prevState.requests, newRequest],
    }));
  };
  // Не удалять! подругому не работает. Я не придумал поумнее.
  // React doesnt rerender... I dont now why.... In app.js worker.request changes, but it doesnt rerender ......
  onDeleteRequestLocally({ reqId }) {
    this.setState(prevState => ({
      ...prevState,
      requests: prevState.requests.filter(request => request.id !== reqId),
    }));
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
            <>
              <Request
                key={request.id}
                id={request.id}
                dateStart={request.dateStart}
                dateEnd={request.dateEnd}
                equipment={request.equipment}
                onDeleteRequest={({ reqId }) => {
                  this.onDeleteRequestLocally({ reqId });
                  return this.state.onDeleteRequest({ reqId });
                }}
              />
            </>
          ))}
        </ul>
        <button
          type='button'
          className='worker__add-request-btn'
          onClick={() => {
            this.state.showModalAndCallback(this.onSubmitAction);
          }}
        >
          &#10010; Добавить запрос
        </button>
      </li>
    );
  }
}

export default Worker;

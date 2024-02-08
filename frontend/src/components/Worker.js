import React, { Component } from 'react';
import AppModel from './../model/AppModel';
import Request from './Request';

class Worker extends Component {
  constructor({
    id,
    name,
    requests = [],
    onDrop,
    onEditRequest,
    onDeleteRequest,
    showModalAndCallback,
    equipment = [],
    onDragStart,
    onDragEnd,
    onDeleteWorker,
  }) {
    super();
    this.state = {
      id,
      name,
      equipment,
      requests,
      onDrop,
      onEditRequest,
      onDeleteRequest,
      showModalAndCallback,
      onDragStart,
      onDragEnd,
      onDeleteWorker,
    };
  }

  render() {
    return (
      <li
        className='workers-list__item worker'
        id={this.state.id}
        onDragStart={() => localStorage.setItem('srcTasklistID', this.state.id)}
        onDrop={this.state.onDrop}
      >
        <button
          type='button'
          className='worker-delete-btn'
          onClick={() => {
            this.state.onDeleteWorker({ id: this.state.id });
          }}
        >
          Удалить
        </button>
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
              onDragStart={this.state.onDragStart}
              onDragEnd={this.state.onDragEnd}
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

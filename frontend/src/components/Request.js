import React, { Component } from 'react';
import { logDOM } from '@testing-library/react';

class Request extends Component {
  constructor({ id, dateStart, dateEnd, equipment, onDeleteRequest, onEditRequest, onDragStart, onDragEnd }) {
    super();
    this.state = {
      id: id || crypto.randomUUID(),
      dateStart,
      dateEnd,
      equipment,
      onDeleteRequest,
      onEditRequest,
      onDragStart,
      onDragEnd,
    };
  }

  render() {
    return (
      <li
        key={this.state.title}
        className='worker__requests-list-item request'
        id={this.state.id}
        draggable
        onDragStart={this.state.onDragStart}
        onDragEnd={this.state.onDragEnd}
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
              onClick={() => this.state.onEditRequest({ reqId: this.state.id })}
            ></button>
            <button
              type='button'
              className='request__contol-btn delete-icon'
              onClick={() => this.state.onDeleteRequest({ reqId: this.state.id })}
            ></button>
          </div>
        </div>
      </li>
    );
  }
}

export default Request;

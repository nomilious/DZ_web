import { useEffect, useState } from 'react';
import AppModel from './model/AppModel';
import Worker from './components/Worker';

// TODO Test all actions in one
function App() {
  const [workers, setWorkers] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const addNotification = ({ name, type }) => {
    const notifications = document.getElementById('app-notifications');

    const notificationID = crypto.randomUUID();
    const notification = document.createElement('div');
    notification.classList.add('notification', type === 'success' ? 'notification-success' : 'notification-error');

    notification.setAttribute('id', notificationID);
    notification.innerHTML = name;

    notifications.appendChild(notification);

    setTimeout(() => {
      document.getElementById(notificationID).remove();
    }, 5000);
  };

  const onEscpKeydown = event => {
    if (event.key === 'Escape') {
      const input = document.querySelector('.worker-adder__input');
      input.style.display = 'none';
      input.value = '';

      document.querySelector('.worker-adder__btn').style.display = 'inherit';
    }
  };
  const onInputKeydown = async event => {
    if (event.key !== 'Enter') return;

    if (event.target.value) {
      const workerId = crypto.randomUUID();
      try {
        const res = await AppModel.addWorkers({
          id: workerId,
          fio: event.target.value,
        });
        const newWorker = {
          id: workerId,
          name: event.target.value,
          requests: [],
        };

        setWorkers(workers => [...workers, { ...newWorker }]);
        addNotification({ name: res.message, type: 'success' });
      } catch (error) {
        addNotification({ name: error.message, type: 'success' });
      }
    }
    event.target.style.display = 'none';
    event.target.value = '';

    document.querySelector('.worker-adder__btn').style.display = 'inherit';
  };
  const showModalAndCallback = ({ workerId }) => {
    const modal = document.getElementById('myModal');
    modal.showModal();
    const onSubmitHandler = async () => {
      await createRequest({ workerId });
    };

    const submitListener = () =>
      onSubmitHandler().then(() => {
        modal.removeEventListener('submit', submitListener);
        modal.querySelector('form').reset();
      });

    modal.addEventListener('submit', submitListener);

    // remove eventListener if user clicks Esc
    modal.addEventListener('close', () => modal.removeEventListener('submit', submitListener));
  };
  const createRequest = async ({ workerId }) => {
    const dateStart = document.getElementById('startDate').value;
    const dateEnd = document.getElementById('endDate').value;
    const equipmentId = document.getElementById('equipmentId').value;

    try {
      const id = crypto.randomUUID();
      // const res =
      const res = await AppModel.addRequest({
        id,
        startDate: dateStart,
        endDate: dateEnd,
        equipmentId,
        workerId,
      });

      const equipmentData = equipment.filter(equipment => equipment.id === equipmentId)[0];

      console.log(res);
      addRequest({ workerId, id, dateStart, dateEnd, equipmentData });
      await reorderRequests();
      addNotification({ name: 'Success Reorder', type: 'success' });
    } catch (error) {
      addNotification({ name: error.message, type: 'error' });
    }
  };
  const convertStringToDate = dateString => {
    const parts = dateString.split('-');
    // Note: months are 0-based in JavaScript Date objects, so we subtract 1 from the month
    const jsDate = new Date(+parts[0], +parts[1] - 1, +parts[2] + 1);
    return jsDate.toISOString().substring(0, 10);
  };
  const onEditRequest = async ({ reqId }) => {
    let Worker_request = null;
    for (let worker of workers) {
      Worker_request = worker.requests.find(req => req.id === reqId);
      if (Worker_request) break;
    }

    const modal = document.getElementById('myModal');
    modal.showModal();
    // set dafult values
    const form = modal.querySelector('form');
    const [startDateInput, endDateInput, equipmentIdInput] = form.elements;
    const { dateStart, dateEnd } = Worker_request;
    const equipmentId = Worker_request.equipment.id;

    startDateInput.value = convertStringToDate(dateStart);
    endDateInput.value = convertStringToDate(dateEnd);
    equipmentIdInput.value = equipmentId;

    const submitListener = async () => {
      // Костыль изза ошибки с таймзонами
      const changedValues = {
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        equipmentId: equipmentIdInput.value,
      };

      if (Object.keys(changedValues).length > 0) {
        try {
          console.log(changedValues);
          const res = await AppModel.updateRequest({ id: reqId, ...changedValues });

          // change in the model
          updateRequest({ reqId, changedValues });
          await reorderRequests();
          addNotification({ name: res.message, type: 'success' });
        } catch (error) {
          addNotification({ name: error.message, type: 'error' });
        }
      }
    };

    modal.addEventListener('submit', submitListener);

    // remove eventListener if user clicks Esc
    modal.addEventListener('close', () => {
      modal.removeEventListener('submit', submitListener);
      form.reset();
    });
  };
  const onDeleteRequest = async ({ reqId }) => {
    let fRequest = null;
    let index = 0;

    for (const worker of workers) {
      fRequest = worker.requests.find(req => req.id === reqId);
      if (fRequest) break;
      index++;
    }
    console.log('needed ' + reqId);

    try {
      deleteRequest({ workerId: index, reqId });
      const res = await AppModel.deleteRequest({ id: reqId });
      addNotification({ name: res.message, type: 'success' });
    } catch (error) {
      addNotification({ name: error.message, type: 'error' });
    }
  };

  const onEditWorker = async ({ id }) => {
    const newName = prompt('Введите новое имя');
    if (newName) {
      try {
        const res = await AppModel.updateWorker({ id, fio: newName });
        setWorkers(prevState => {
          return prevState.map(worker => {
            if (worker.id === id) {
              worker.name = newName;
            }
            return worker;
          });
        });
        addNotification({ name: res.message, type: 'success' });
      } catch (error) {
        addNotification({ name: error.message, type: 'error' });
      }
    }
  };

  const onDeleteWorker = async ({ id }) => {
    // delete locally
    setWorkers(prevState => {
      return prevState.filter(worker => worker.id !== id);
    });
    try {
      const res = await AppModel.deleteWorker({ id });
      addNotification({ name: res.message, type: 'success' });
    } catch (error) {
      addNotification({ name: error.message, type: 'error' });
    }
  };
  const fillModalForm = async () => {
    try {
      const equipmentData = await AppModel.getEquipment();

      setEquipment(equipmentData);

      const equipmentSelect = document.getElementById('equipmentId');

      equipmentData.forEach(equipment => {
        const option = document.createElement('option');
        option.value = equipment.id;
        option.text = equipment.title;
        equipmentSelect.appendChild(option);
      });
    } catch (e) {
      console.error('Error fillModalForm, ', e);
    }
  };

  const reorderRequests = async () => {
    // reorder them locally by startDate
    setWorkers(prevState => {
      return prevState.map(worker => {
        worker.requests.sort((a, b) => {
          return new Date(a.dateStart) - new Date(b.dateStart);
        });
        return worker;
      });
    });
  };

  // CRUD actions in model
  const addRequest = ({ workerId, id, dateStart, dateEnd, equipmentData }) => {
    setWorkers(prevState => {
      return prevState.map(worker => {
        if (worker.id === workerId) {
          worker.requests.push({
            id,
            dateStart,
            dateEnd,
            equipment: { ...equipmentData },
          });
        }
        return worker;
      });
    });
  };
  const updateRequest = ({ reqId, changedValues }) => {
    setWorkers(prevState => {
      return prevState.map(worker => {
        const updatedRequests = worker.requests.map(request => {
          if (request.id === reqId) {
            request.dateStart = changedValues.startDate;
            request.dateEnd = changedValues.endDate;
            request.equipment = equipment.find(equipment => equipment.id === changedValues.equipmentId);
          }
          return request;
        });
        return { ...worker, requests: updatedRequests };
      });
    });
  };
  const deleteRequest = ({ workerId, reqId }) => {
    setWorkers(prevWorkers => {
      return prevWorkers.map((worker, ind) => {
        if (ind === workerId) {
          // Copy the worker object
          const updatedWorker = { ...worker };
          // Filter out the request to delete
          updatedWorker.requests = updatedWorker.requests.filter(request => request.id !== reqId);
          return updatedWorker;
        }
        return worker;
      });
    });
  };
  const moveRequest = ({ srcWorkerId, destWorkerId, movedRequestId }) => {
    setWorkers(prevState => {
      return prevState.map(worker => {
        if (worker.id === srcWorkerId) {
          const updatedRequests = worker.requests.filter(request => request.id !== movedRequestId);
          return { ...worker, requests: updatedRequests };
        } else if (worker.id === destWorkerId) {
          const movedRequest = prevState
            .find(w => w.id === srcWorkerId)
            .requests.find(request => request.id === movedRequestId);
          const updatedRequests = [...worker.requests, movedRequest];
          return { ...worker, requests: updatedRequests };
        }
        return worker;
      });
    });
  };
  const onDragStart = evt => {
    const draggedElement = evt.target;
    draggedElement.classList.add('request_selected');
    localStorage.setItem('movedTaskID', draggedElement.id);
    localStorage.setItem('srcTasklistID', draggedElement.closest('.worker').id);
  };
  const onDragEnd = evt => {
    const draggedElement = evt.target;
    draggedElement.classList.remove('request_selected');
    localStorage.setItem('movedTaskID', '');
    localStorage.setItem('srcTasklistID', '');
  };

  const dragOver = evt => {
    evt.preventDefault();

    // // Get the dragged element and its previous list
    const draggedElement = document.querySelector('.request.request_selected');
    const draggedElementPrevList = draggedElement.closest('.worker');

    // // Get the current element being dragged over and its closest droppable area
    const currentElement = evt.target;
    let curDroppable = currentElement;

    // // Get the previously highlighted droppable area
    const prevDroppable = document.querySelector('.worker_droppable');

    while (curDroppable !== document.body && !curDroppable.matches('.worker')) {
      curDroppable = curDroppable.parentElement;
    }

    // // Highlight the current droppable area if it's different from the previous one
    if (curDroppable !== prevDroppable) {
      if (prevDroppable) prevDroppable.classList.remove('worker_droppable');
      if (curDroppable.matches('.worker')) curDroppable.classList.add('worker_droppable');
    }

    // // // If not over a droppable area or dragging over the same element, exit the function
    if (!curDroppable.matches('.worker') || draggedElement === currentElement) return;

    if (curDroppable !== draggedElementPrevList) {
      curDroppable.querySelector('.worker__requests-list').appendChild(draggedElement);
    }
  };

  const onDrop = async evt => {
    evt.stopPropagation();

    const destWorkerElement = evt.currentTarget;
    destWorkerElement.classList.remove('worker_droppable');

    const movedRequestId = localStorage.getItem('movedTaskID');
    const srcWorkerId = localStorage.getItem('srcTasklistID');
    const destWorkerId = destWorkerElement.getAttribute('id');

    localStorage.setItem('movedTaskID', '');
    localStorage.setItem('srcTasklistID', '');

    if (!destWorkerElement.querySelector(`[id="${movedRequestId}"]`)) return;

    // move request in the model

    moveRequest({ srcWorkerId, destWorkerId, movedRequestId });
    await reorderRequests();

    try {
      const res = await AppModel.moveRequest({ id: movedRequestId, srcWorkerId, destWorkerId });
      addNotification({ name: res.message, type: 'success' });
    } catch (error) {
      addNotification({ name: error.message, type: 'error' });
    }
  };

  // actions on component mount
  useEffect(() => {
    const fillModal = async () => {
      try {
        await fillModalForm();
      } catch (e) {
        console.error(e);
      }
    };
    fillModal();
    //init notification
    document.getElementById('app-notifications').show();

    document.querySelector('.worker-adder__btn').addEventListener('click', event => {
      event.target.style.display = 'none';

      const input = document.querySelector('.worker-adder__input');
      input.style.display = 'inherit';
      input.focus();
    });
    document.addEventListener('keydown', onEscpKeydown);

    document.querySelector('.worker-adder__input').addEventListener('keydown', onInputKeydown);

    document.getElementById('theme-switch').addEventListener('change', evt => {
      evt.target.checked ? document.body.classList.add('dark-theme') : document.body.classList.remove('dark-theme');
    });

    document.addEventListener('dragover', dragOver);

    // get's data from backend
    const fetchData = async () => {
      try {
        const rawWorkers = await AppModel.getWorkers();

        setWorkers([...rawWorkers]);
      } catch (error) {
        addNotification({ name: error.message, type: 'error' });
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <header className='app-header' id='app-header'>
        <h1 className='app-header__app-name'>Тестирование Оборудования</h1>
        <div className='app-header__user-and-controls'>
          <div className='user-info'>
            <div className='user-info__avatar'></div>
            <span className='user-info__username'> Keanu Reeves </span>
          </div>
          <label className='toggle-switch' id='theme-switch'>
            <input type='checkbox' className='toggle-switch__checkbox' />
            <div className='toggle-switch__slider'></div>
          </label>
        </div>
      </header>
      <main className='app-main' id='app-main'>
        <ul className='workers-list'>
          {workers.map((worker, ind) => (
            <>
              <Worker
                key={worker.id + worker.requests.map(request => request.id).join('') + worker.name}
                id={worker.id}
                name={worker.name}
                requests={worker.requests}
                equipment={equipment}
                onDrop={onDrop}
                onEditRequest={onEditRequest}
                onDeleteRequest={onDeleteRequest}
                showModalAndCallback={showModalAndCallback}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDeleteWorker={onDeleteWorker}
                onEditWorker={onEditWorker}
              />
            </>
          ))}
          <li className='workers-list__item worker-adder'>
            <button type='button' className='worker-adder__btn'>
              &#10010; Добавить работника
            </button>
            <input type='text' placeholder='Новый работник' className='worker-adder__input' />
          </li>
        </ul>
      </main>
    </>
  );
}

export default App;

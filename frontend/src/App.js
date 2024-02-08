import { useEffect, useState } from 'react';
import AppModel from './model/AppModel';
import Worker from './components/Worker';

// TODO implement request drag&drop, fix notificcations
// TODO run reorderTasks on task adding
// FIXME  test the function overlapDates from databaseModule
function App() {
  const [workers, setWorkers] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const onEscpKeydown = event => {
    if (event.key === 'Escape') {
      const input = document.querySelector('.worker-adder__input');
      input.style.display = 'none';
      input.value = '';

      document.querySelector('.worker-adder__btn').style.display = 'inherit';
    }
  };
  const onDropRequestIn = async evt => {
    evt.stopPropagation();

    const destWorkerElement = evt.currentTarget;
    destWorkerElement.classList.remove('worker_droppable');

    const movedRequestId = localStorage.getItem('movedTaskID');
    const srcWorkerId = localStorage.getItem('srcTasklistID');
    const destWorkerId = destWorkerElement.getAttribute('id');

    localStorage.setItem('movedTaskID', '');
    localStorage.setItem('srcTasklistID', '');

    if (!destWorkerElement.querySelector(`[id="${movedRequestId}"]`)) return;

    const srcWorker = workers.find(worker => worker.id === srcWorkerId);
    const destWorker = workers.find(worker => worker.id === destWorkerId);

    try {
      if (srcWorkerId !== destWorkerId) {
        // const res =
        await AppModel.moveTasks({
          id: movedRequestId,
          srcTasklistId: srcWorkerId,
          destTasklistId: destWorkerId,
        });
        const movedRequest = srcWorker.deleteRequest({
          taskID: movedRequestId,
        });
        destWorker.addRequest({ request: movedRequest });

        srcWorker.reorderRequests();
      }

      destWorker.reorderRequests();
    } catch (error) {
      console.error(error);
    }
  };
  const showModalAndCallback = ({ workerId }) => {
    const modal = document.getElementById('myModal');
    modal.showModal();
    const onSubmitHandler = async () => {
      await onSubmitAction({ workerId });
    };

    const submitListener = () =>
      onSubmitHandler().then(r => {
        modal.removeEventListener('submit', submitListener);
        modal.querySelector('form').reset();
      });

    modal.addEventListener('submit', submitListener);

    // remove eventListener if user clicks Esc
    modal.addEventListener('close', () => modal.removeEventListener('submit', submitListener));
  };
  const onSubmitAction = async ({ workerId }) => {
    const dateStart = document.getElementById('startDate').value;
    const dateEnd = document.getElementById('endDate').value;
    const equipmentId = document.getElementById('equipmentId').value;

    console.log(dateStart, dateEnd);

    try {
      const id = crypto.randomUUID();
      // const res =
      await AppModel.addRequest({
        id,
        startDate: dateStart,
        endDate: dateEnd,
        equipmentId,
        workerId,
      });

      const equipmentData = equipment.filter(equipment => equipment.id === equipmentId)[0];
      console.log('workerId: ' + workerId);

      addRequest({ workerId, id, dateStart, dateEnd, equipmentData });
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  };
  const convertStringToDate = (dateString, increase = false) => {
    const parts = dateString.split('-');
    // Note: months are 0-based in JavaScript Date objects, so we subtract 1 from the month
    if (increase) {
      parts[2] = +parts[2] + 1;
    }
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
          await AppModel.updateRequest({ id: reqId, ...changedValues });

          // change in the model
          updateRequest({ reqId, changedValues });
        } catch (error) {
          console.log(error);
          return Promise.reject(error);
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
      console.log(res);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
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
  const dragOver = evt => {
    evt.preventDefault();

    const draggedElement = document.querySelector('.task.task_selected');
    const draggedElementPrevList = draggedElement.closest('.worker');

    const currentElement = evt.target;
    const prevDroppable = document.querySelector('.worker_droppable');
    let curDroppable = evt.target;
    while (!curDroppable.matches('.worker') && curDroppable !== document.body) {
      curDroppable = curDroppable.parentElement;
    }

    if (curDroppable !== prevDroppable) {
      if (prevDroppable) prevDroppable.classList.remove('worker_droppable');

      if (curDroppable.matches('.worker')) {
        curDroppable.classList.add('worker_droppable');
      }
    }

    if (!curDroppable.matches('.worker') || draggedElement === currentElement) return;

    if (curDroppable === draggedElementPrevList) {
      if (!currentElement.matches('.task')) return;

      const nextElement =
        currentElement === draggedElement.nextElementSibling ? currentElement.nextElementSibling : currentElement;

      curDroppable.querySelector('.worker__tasks-list').insertBefore(draggedElement, nextElement);

      return;
    }

    if (currentElement.matches('.task')) {
      curDroppable.querySelector('.worker__tasks-list').insertBefore(draggedElement, currentElement);

      return;
    }

    if (!curDroppable.querySelector('.worker__tasks-list').children.length) {
      curDroppable.querySelector('.worker__tasks-list').appendChild(draggedElement);
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
        console.log('added to model');
        const newWorker = {
          id: workerId,
          name: event.target.value,
        };
        console.log('created local');

        setWorkers(workers => [...workers, { ...newWorker }]);
        // newWorker.render()
        console.log(res);
      } catch (error) {
        console.error(JSON.stringify(error));
      }
    }
    event.target.style.display = 'none';
    event.target.value = '';

    document.querySelector('.worker-adder__btn').style.display = 'inherit';
  };

  // CRUD actions in model
  const addRequest = ({ workerId, id, dateStart, dateEnd, equipmentData }) => {
    setWorkers(prevState => {
      return prevState.map(worker => {
        if (worker.id === workerId) {
          console.log('HERE in setWorkers()');

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
        console.error(error);
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
            <Worker
              key={worker.id + worker.requests.map(request => request.id).join('')}
              id={worker.id}
              name={worker.name}
              requests={worker.requests}
              equipment={equipment}
              onDropRequestIn={onDropRequestIn}
              onEditRequest={onEditRequest}
              onDeleteRequest={onDeleteRequest}
              showModalAndCallback={showModalAndCallback}
            />
          ))}
          <li className='workers-list__item worker-adder'>
            <button type='button' className='worker-adder__btn'>
              &#10010; Добавить работника
            </button>
            <input type='text' placeholder='Новый работник' className='worker-adder__input' />
          </li>
        </ul>
      </main>

      <dialog className='app-modal' id='myModal'>
        <h3>Введите запрос</h3>
        <form method='dialog'>
          <div className='form-group'>
            <label htmlFor='startDate'>Start Date:</label>
            <input type='date' className='form-control' id='startDate' required />
          </div>
          <div className='form-group'>
            <label htmlFor='endDate'>End Date:</label>
            <input type='date' className='form-control' id='endDate' required />
          </div>
          <div className='form-group'>
            <label htmlFor='equipmentId'>Select Equipment:</label>
            <select className='form-control' id='equipmentId'></select>
          </div>
          <button type='submit'>Создать</button>
        </form>
      </dialog>
    </>
  );
}

export default App;

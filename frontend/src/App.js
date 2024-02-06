import { useEffect, useState } from 'react';
import AppModel from './model/AppModel';
import Worker from './components/Worker';
import worker from './components/Worker';

function App() {
  const [workers, setWorkers] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const onEscapeKeydown = event => {
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

  const showModalAndCallback = callback => {
    const modal = document.getElementById('myModal');
    modal.showModal();

    modal.addEventListener('submit', callback, { once: true });
    modal.querySelector('form').reset();
  };
  const onEditRequest = async ({ reqId }) => {
    let Worker_request = null;
    for (let worker of workers) {
      Worker_request = worker.getRequestById({ reqId });
      if (Worker_request) break;
    }

    const curTaskText = Worker_request.equipment.title;
    const newTaskText = prompt('Введите новое описание задачи');

    if (!newTaskText || newTaskText === curTaskText) return;
    try {
      const res = await AppModel.updateRequest({
        id: reqId,
        text: newTaskText,
      });

      Worker_request.taskText = newTaskText;

      document.querySelector(`[id="${reqId}"] span.task__text`).innerHTML = newTaskText;
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  // TODO run reorderTasks on task adding
  // TODO add to model inside of App.js
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
    document.addEventListener('keydown', onEscapeKeydown);

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
        <h1 className='app-header__app-name'>Custom task header</h1>
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
          {workers.map(worker => (
            <>
              <Worker
                key={worker.id}
                id={worker.id}
                name={worker.name}
                requests={worker.requests}
                equipment={equipment}
                onDropRequestIn={onDropRequestIn}
                onEditRequest={onEditRequest}
                onDeleteRequest={onDeleteRequest}
                showModalAndCallback={showModalAndCallback}
              />
            </>
          ))}
          <li className='workers-list__item worker-adder'>
            <button type='button' className='worker-adder__btn'>
              &#10010; Добавить работника
            </button>
            <input type='text' placeholder='Новый список' className='worker-adder__input' />
          </li>
        </ul>

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
      </main>
    </>
  );
}

export default App;
// TODO move the Equipment off the components/

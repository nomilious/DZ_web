export default class Worker {
  #id;
  #fio;
  #tasks;
  constructor(id, fio, tasks) {
    this.#id = id;
    this.#fio = fio;
    this.#tasks = tasks;
  }

  push(request) {
    this.#tasks.push(request)
  }
  // remove(request) {
  //   // this.#tasks.
  // }
  get id() {
    return this.#id;
  }
  get dateStart() {
    return this.#dateStart;
  }
  get dateEnd() {
    return this.#dateEnd;
  }
  get equipment() {
    return this.#equipment;
  }
}

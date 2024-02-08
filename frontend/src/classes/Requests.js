export default class Requests {
  #id;
  #dateStart;
  #dateEnd;
  #equipment;
  constructor(id, dateStart, dateEnd, equipment) {
    this.#id = id;
    this.#dateStart = dateStart;
    this.#dateEnd = dateEnd;
    this.#equipment = equipment;
  }
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

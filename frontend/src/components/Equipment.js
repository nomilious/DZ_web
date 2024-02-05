export default class Equipment {
  #id;
  #title;
  #available;

  constructor({id, title, available}) {
    this.#id = id;
    this.#title = title;
    this.#available = available;
  }
  get title() {
    return this.#title
  }
  get available() {
    return this.#available
  }
  get id() {
    return this.#id
  }
}
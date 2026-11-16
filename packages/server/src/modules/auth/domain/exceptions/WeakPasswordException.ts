export class WeakPasswordException extends Error {
  constructor() {
    super("WEAK_PASSWORD");
    this.name = new.target.name;
  }
}

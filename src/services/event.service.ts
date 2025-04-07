export enum AppEvent {
  REDIRECT = 'redirect',
}

export class EventService {
  notification = (msg: string) => {};

  notify(msg: string) {
    this.notification(msg);
  }
}

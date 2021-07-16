
const { EventEmitter } = require("events");
const testEventEmitter = new EventEmitter();
const oldEmit = testEventEmitter.emit;
testEventEmitter.emit = function emit2() {
  console.log("emitting", arguments);
  return oldEmit.apply(this, arguments)
}
global.testEventEmitter = testEventEmitter;


class EventAwaitter {

  constructor(args) {
    console.log("EventAwaitter()", args);
    var { eventEmitter, event, timeout } = args;
    timeout = timeout || 3000;
    this.eventEmitter = eventEmitter;
    this.event = event;
    this.timeout = timeout;
  }

  startTimeout() {
    console.log("EventAwaitter.startTimeout()");
    const timeout = this.timeout;
    this.timeoutId = setTimeout(() => {
      console.log("timeout reached");
      this.cleanup();
      return this.reject(new Error("Timeout exceeded " + timeout))
    }, timeout)
  }

  cleanup() {
    console.log("EventAwaitter.cleanup()");
    //this.eventEmitter.off(this._handleEvent.bind(this))
    if (this.timeoutId) {
      console.log("clearTimeout()");
      const r = clearTimeout(this.timeoutId);
      console.log("r", r)
    }
  }

  listen() {
    console.log("EventAwaitter.listen()");
    //var promiseResolve, promiseReject, timeoutId;
    const _this = this;
    this.promise = new Promise(function(resolve, reject) {
      _this.resolve = resolve;
      _this.reject = reject;
    })
    console.log(this._handleEvent);
    console.log(this._handleEvent.bind(this));
    this.eventEmitter.once(this.event, this._handleEvent.bind(this));
    //this.timeoutId = this.startTimeout()
  }

  _handleEvent(data) {
    console.log("EventAwaitter._handleEvent()", data);
    this.cleanup();
    return this.resolve(data);
  }

  async get() {
    console.log("EventAwaitter.get()");
    this.startTimeout()
    return this.promise;
  }

}

module.exports = EventAwaitter;


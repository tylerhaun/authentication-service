require("@babel/register")({extensions: ['.js', '.ts']})
require("@babel/polyfill");
const axios = require("axios");
const childProcess = require("child_process");
const dotenv = require("dotenv");

dotenv.config();

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
    console.log(this);
    console.log(this._handleEvent);
    //this.eventEmitter.off(this._handleEvent.bind(this))
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
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
    console.log("got event", data);
    this.cleanup();
    return this.resolve(data);
  }

  async get() {
    console.log("EventAwaitter.get()");
    this.startTimeout()
    return this.promise;
  }

}

function awaitEvent(args) {
  var { eventEmitter, event, timeout } = args;
  timeout = timeout || 3000;

  var promiseResolve, promiseReject, timeoutId;
  const promise = new Promise(function(resolve, reject) {
    promiseResolve = resolve;
  })

  function cleanup() {
    eventEmitter.off(handleEvent)
    clearTimeout(timeoutId);
  }

  function handleEvent(data) {
    console.log("got event", data);
    cleanup();
    return promiseResolve(data);
  }
  eventEmitter.on(event, handleEvent);

  timeoutId = setTimeout(() => {
    cleanup();
    return promiseReject(new Error("Timeout exceeded " + timeout))
  }, timeout)

  return promise;
}



//var smsBuffer;
//var emailBuffer;
//
//class TestServer {
//
//  async start() {
//
//    return new Promise(function(resolve, reject) {
//
//      const scriptPath = "./src/index.js";
//      var server = childProcess.fork(scriptPath, [], {silent: true});
//
//      server.on('spawn', function (err) {
//        console.log("spawned", err);
//      });
//      server.on('error', function (err) {
//        console.error("error", err);
//      });
//
//      server.on('exit', function (code, signal) {
//        console.log("server exited", code, signal);
//      });
//      server.on('close', function (code, signal) {
//        console.log("server exited", code, signal);
//      });
//
//
//      server.stdout.on('data', function(data) {
//        console.log("server stdout", data.toString()); 
//      });
//      server.stderr.on('data', function(data) {
//        console.log("server stderr");
//        console.error(data.toString()); 
//      });
//
//      console.log("waiting for server to start...");
//      server.on("message", (m) => {
//        console.log("received message", m);
//        if (m == "server.started") {
//          return resolve(server);
//        }
//      })
//
//      server.on("message", (m) => {
//        console.log("received message", m);
//        try {
//          var data = JSON.parse(m);
//          console.log(data);
//          if (data.event == "sms.sent") {
//            smsBuffer = data.message;
//            console.log("smsBuffer", smsBuffer);
//          }
//          if (data.event == "email.sent") {
//            emailBuffer = data.message;
//            console.log("emailBuffer", emailBuffer);
//          }
//        }
//        catch(e) {}
//      })
//
//    })
//  
//  }
//
//}






var request;
var server;
before(async function() {  
  this.timeout(5000);
  console.log("before");
  const appPromise = require('../../src/server')
  const app = await appPromise;
  server = app.server;
  request = require('supertest')(server);
  //const testServer = new TestServer();
  //console.log("starting test server...");
  //await testServer.start();
  //console.log("server started");
})

after(async () => {
  server.close();
});

describe('loading express', function() {
  it("should ping", async function() {
    this.timeout(5000);
    const response = await request.get("/ping")
      .expect(200)
    console.log("response.body", response.body);
  });
  it("should 404", async function() {
    const response = await request.get('/')
      .expect(404);
  });
});



//const axiosConfig = {
//  baseURL: `http://localhost:${process.env.PORT}/`,
//};
//const apiRequest = axios.create(axiosConfig);
//
//describe("Test test server", () => {
//  it("should ping", async () => {
//    const response = await apiRequest.get("ping");
//    console.log("response.data", response.data);
//  })
//})
//
//
const username = "test";
const email = "test@test.com"
const password = "password1";

var userId; // TODO hacky; fix
describe("API", () => {

  describe("User", () => {

    describe("Create", () => {

      //it("should successfully create a new user", async function() {
      //  this.timeout(5000);
      //  const userData = {
      //    username,
      //    email: "test@test.com",
      //    phoneNumber: "716-555-5555",
      //    password,
      //  };
      //  //const result = await apiRequest.post("users", userData);
      //  const response = await request.post("/users").send(userData).expect(200);
      //  console.log(response.status)
      //  console.log("response.body", response.body);
      //})


      it("should successfully create a new user with email verification", async function() {
        this.timeout(5000);

        var emailPromiseResolve;
        const emailPromise = new Promise(function(resolve, reject) {
          emailPromiseResolve = resolve;
        })
        testEventEmitter.once("email.sent", function(data) { // TODO cleanup listener after event received
          console.log("got event", data);
          return emailPromiseResolve(data);
        })

        //const email = "test@test.com"
        const userData = {
          username: email,
          email,
          phoneNumber: "716-555-5555",
          password,
        };
        //const result = await apiRequest.post("users", userData);
        const response = await request.post("/users").send(userData).expect(200);
        console.log(response.status)
        console.log("response", response.body);
        const sentEmail = await emailPromise;
        console.log("sentEmail", sentEmail);
        const code = sentEmail.text.split("/").pop();
        console.log("code", code);

        const response2 = await request.post("/email-verification-requests/approve").send({code}).expect(200);
        console.log(response2.status)
        console.log("response2", response2.body);

        //console.log("emailBuffer", emailBuffer);
        //const result = await apiRequest.post("users", userData);
      })
    })

    describe("Login", () => {
      it("should successfully login", async function() {
        this.timeout(10000);
        const userData = {
          username: email,
          challenges: ["password", "sms"]
        };
        const response = await request.post("/login").send(userData).expect(200);
        console.log(response.status)
        console.log("response.body", response.body);
        const challenge = response.body.challenge;
        console.log("challenge", challenge);


        console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 1\n\n\n\n\n\n\n\n")

        const eventAwaitterArgs = {
          eventEmitter: testEventEmitter,
          event: "sms.sent"
        };
        //const sentSms = await awaitEvent({eventEmitter: testEventEmitter, event: "sms.sent"});
        const eventAwaitter = new EventAwaitter(eventAwaitterArgs);
        eventAwaitter.listen();


        const challengeData = {
          code: password,
        };
        const response2 = await request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(200);
        console.log("response2.body", response2.body)
        const challenge2 = response2.body.challenge;
        console.log("challenge2", challenge2);


        console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 2\n\n\n\n\n\n\n\n")
        //console.log("sleeping for code...");
        //await new Promise(function(resolve, reject) {setTimeout(() => resolve(), 1000)})

        //var smsPromiseResolve;
        //const smsPromise = new Promise(function(resolve, reject) {
        //  smsPromiseResolve = resolve;
        //})
        //testEventEmitter.on("sms.sent", function(data) { // TODO cleanup listener after event received
        //  console.log("got event", data);
        //  return smsPromiseResolve(data);
        //})
        //const sentSms = await emailPromise;
        const sentSms = await eventAwaitter.get();
        console.log("sentSms", sentSms);
        const code = sentSms.message.split(" ")[3];
        console.log("code", code);
        const challengeData2 = {
          code,
        };
        const response3 = await request.post(`/login-challenges/${challenge2.id}/complete`).send(challengeData2).expect(200);
        console.log("response3.body", response3.body)


      })
    })
  })
})



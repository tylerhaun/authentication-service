require("@babel/register")({extensions: ['.js', '.ts']})
require("@babel/polyfill");
const axios = require("axios");
const childProcess = require("child_process");
const dotenv = require("dotenv");

const EventAwaitter = require("../EventAwaitter");

dotenv.config();


//function awaitEvent(args) {
//  var { eventEmitter, event, timeout } = args;
//  timeout = timeout || 3000;
//
//  var promiseResolve, promiseReject, timeoutId;
//  const promise = new Promise(function(resolve, reject) {
//    promiseResolve = resolve;
//  })
//
//  function cleanup() {
//    eventEmitter.off(handleEvent)
//    clearTimeout(timeoutId);
//  }
//
//  function handleEvent(data) {
//    console.log("got event", data);
//    cleanup();
//    return promiseResolve(data);
//  }
//  eventEmitter.on(event, handleEvent);
//
//  timeoutId = setTimeout(() => {
//    cleanup();
//    return promiseReject(new Error("Timeout exceeded " + timeout))
//  }, timeout)
//
//  return promise;
//}



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

const ip = "192.168.1.1"
const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Safari/537.36";
const globals = {
  username: "test",
  email: "test@test.com",
  password: "password1",
  token: "",
  userId: "",
}

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
          username: globals.email,
          email: globals.email,
          phoneNumber: "716-555-5555",
          password: globals.password,
          userAgent: ua,
          ipAddress: ip,
        };
        //const result = await apiRequest.post("users", userData);
        const response = await request.post("/users").set("user-agent", ua).send(userData).expect(200);
        console.log(response.status)
        console.log("response", response.body);
        const userId = response.body.id;
        globals.userId = userId;
        console.log({globals});
        const sentEmail = await emailPromise;
        console.log("sentEmail", sentEmail);
        const code = sentEmail.text.split("/").pop();
        console.log("code", code);

        const response2 = await request.post("/users/verifyEmail").send({code, userId}).expect(200);
        console.log(response2.status)
        console.log("response2", response2.body);

      })
    })

    describe("Login", () => {
      it("should successfully login", async function() {
        this.timeout(10000);
        const userData = {
          username: globals.email,
          challenges: ["password", "sms"],
          ipAddress: ip,
          userAgent: ua,
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
        const eventAwaitter = new EventAwaitter(eventAwaitterArgs);
        eventAwaitter.listen();


        const challengeData = {
          code: globals.password,
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
        const token = response3.body.token;
        globals.token = token;
        const userId = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).user.id;
        console.log("userId", userId)
        globals.userId = userId;


      })

      it("should fail login from ip address", async function() {
        this.timeout(10000);
        const wrongIp = "192.168.1.2";
        const userData = {
          username: globals.email,
          challenges: ["password"],
          ipAddress: wrongIp,
          userAgent: ua,
        };
        const response = await request.post("/login").send(userData).expect(200);
        console.log(response.status)
        console.log("response.body", response.body);
        const challenge = response.body.challenge;
        console.log("challenge", challenge);


        console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 1\n\n\n\n\n\n\n\n")


        const challengeData = {
          code: globals.password,
        };
        const response2 = await request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(401);
        console.log("response2.body", response2.body)
        const challenge2 = response2.body.challenge;
        console.log("challenge2", challenge2);

      })

      it("should fail login from device", async function() {
        this.timeout(10000);
        const wrongUa = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3"
        const userData = {
          username: globals.email,
          challenges: ["password"],
          ipAddress: ip,
          userAgent: wrongUa,
        };
        const response = await request.post("/login").send(userData).expect(200);
        console.log(response.status)
        console.log("response.body", response.body);
        const challenge = response.body.challenge;
        console.log("challenge", challenge);


        console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 1\n\n\n\n\n\n\n\n")

        const challengeData = {
          code: globals.password,
        };
        const response2 = await request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(401);
        console.log("response2.body", response2.body)
        const challenge2 = response2.body.challenge;
        console.log("challenge2", challenge2);

      })

    })

    describe("Email", function() {
      it("should create and verify a second email address", async function() {

        const emailAddressData = {
          userId: globals.userId,
          emailAddress: "test2@test.com",
          isPrimary: true,
        };
        console.log("emailAddressData", emailAddressData);
        const response = await request.post(`/email-addresses`).send(emailAddressData).expect(200);
        console.log("response.body", response.body)
        const emailId = response.body.id;


        const eventAwaitterArgs = {
          eventEmitter: testEventEmitter,
          event: "email.sent"
        };
        const eventAwaitter = new EventAwaitter(eventAwaitterArgs);
        eventAwaitter.listen();


        const response2 = await request.post(`/email-addresses/${emailId}/startVerification`).expect(200);
        console.log("response2.body", response2.body)


        const sentEmail = await eventAwaitter.get();
        console.log("sentEmail", sentEmail);
        const code = sentEmail.text.split("/").pop();
        const verifyData = {
          code,
          userId: globals.userId,
        };
        const response3 = await request.post(`/email-addresses/${emailId}/verify`).send(verifyData).expect(200);
        console.log("response3.body", response3.body)

      })
    })

    describe("PhoneNumber", function() {
      it("should create and verify a second phone number", async function() {

        const phoneNumberData = {
          userId: globals.userId,
          phoneNumber: "680-555-5555",
          isPrimary: true,
        };
        console.log("phoneNumberData", phoneNumberData);
        const response = await request.post(`/phone-numbers`).send(phoneNumberData).expect(200);
        console.log("response.body", response.body)
        const phoneNumberId = response.body.id;


        const eventAwaitterArgs = {
          eventEmitter: testEventEmitter,
          event: "sms.sent"
        };
        const eventAwaitter = new EventAwaitter(eventAwaitterArgs);
        eventAwaitter.listen();


        const response2 = await request.post(`/phone-numbers/${phoneNumberId}/startVerification`).expect(200);
        console.log("response2.body", response2.body)


        const sentSms = await eventAwaitter.get();
        console.log("sentSms", sentSms);
        const code = sentSms.message.split(" ")[3];
        const verifyData = {
          code,
          userId: globals.userId,
        };
        const response3 = await request.post(`/phone-numbers/${phoneNumberId}/verify`).send(verifyData).expect(200);
        console.log("response3.body", response3.body)


        
      })
    })

    describe("Access Token", function() {
      it("should create an access token", async function() {
        const accessTokenData = {
          userId: globals.userId,
          maxUses: 0,
          expiresAt: "2021-07-16",
        };
        const response = await request.post(`/access-tokens`).send(accessTokenData).expect(200);
        console.log("response.body", response.body)
        globals.accessToken = response.body.code;
      
      })
      it("should login with access token", async function() {

        const loginData = {
          username: globals.email,
          challenges: ["password"],
          accessToken: globals.accessToken,
          ipAddress: ip,
          userAgent: ua,
        };
        const response = await request.post("/login").send(loginData).expect(200);
        console.log("response.body", response.body)
        console.log("token", response.body.token);
      
      })
    })

    describe("One time password", function() {
      it("should create a one time password", async function() {
        const otpData = {
          userId: globals.userId,
          maxUses: 0,
        };
        const response = await request.post(`/one-time-passwords`).send(otpData).expect(200);
        console.log("response.body", response.body)
        globals.otp = response.body.code;
        
      })
      it("should login with one time password", async function() {

        const loginData = {
          username: globals.email,
          challenges: ["password"],
          accessToken: globals.otp,
          ipAddress: ip,
          userAgent: ua,
        };
        const response = await request.post("/login").send(loginData).expect(200);
        console.log("response.body", response.body)
        console.log("token", response.body.token);
        
      })
      it("should fail login second time with one time password", async function() {

        const loginData = {
          username: globals.email,
          challenges: ["password"],
          accessToken: globals.otp,
          ipAddress: ip,
          userAgent: ua,
        };
        const response = await request.post("/login").send(loginData).expect(401);
        console.log("response.body", response.body)
        console.log("token", response.body.token);
        
      })
    })

  })
})



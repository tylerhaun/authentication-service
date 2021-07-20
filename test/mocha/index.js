require("@babel/register")({extensions: ['.js', '.ts']})
require("@babel/polyfill");
const axios = require("axios");
const childProcess = require("child_process");
const dotenv = require("dotenv");

const EventAwaitter = require("../EventAwaitter");
const context = require("./context");

dotenv.config();



var request;
var server;
before(async function() {  
  this.timeout(5000);
  console.log("before");
  const appPromise = require('../../src/server')
  const app = await appPromise;
  server = app.server;
  request = require('supertest')(server);
  context.request = request;
})

after(async () => {
  server.close();
});

//describe('loading express', function() {
//  it("should ping", async function() {
//    this.timeout(5000);
//    const response = await request.get("/ping")
//      .expect(200)
//    console.log("response.body", response.body);
//  });
//  it("should 404", async function() {
//    const response = await request.get('/')
//      .expect(404);
//  });
//});


require("./express");
require("./api/user/create");
require("./api/user/login");
require("./api/email-address");
require("./api/phone-number");
require("./api/access-token");
require("./api/one-time-password");


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

//const globals = require("./globals");
//const ip = "192.168.1.1"
//const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Safari/537.36";
//const globals = {
//  username: "test",
//  email: "test@test.com",
//  password: "password1",
//  token: "",
//  userId: "",
//}

var userId; // TODO hacky; fix
describe("API", () => {

  describe("User", () => {

    //describe("Create", () => {

    //  //it("should successfully create a new user", async function() {
    //  //  this.timeout(5000);
    //  //  const userData = {
    //  //    username,
    //  //    email: "test@test.com",
    //  //    phoneNumber: "716-555-5555",
    //  //    password,
    //  //  };
    //  //  //const result = await apiRequest.post("users", userData);
    //  //  const response = await request.post("/users").send(userData).expect(200);
    //  //  console.log(response.status)
    //  //  console.log("response.body", response.body);
    //  //})


    //  it("should successfully create a new user with email verification", async function() {
    //    this.timeout(5000);

    //    var emailPromiseResolve;
    //    const emailPromise = new Promise(function(resolve, reject) {
    //      emailPromiseResolve = resolve;
    //    })
    //    testEventEmitter.once("email.sent", function(data) { // TODO cleanup listener after event received
    //      console.log("got event", data);
    //      return emailPromiseResolve(data);
    //    })

    //    //const email = "test@test.com"
    //    const userData = {
    //      username: globals.email,
    //      email: globals.email,
    //      phoneNumber: "716-555-5555",
    //      password: globals.password,
    //      userAgent: ua,
    //      ipAddress: ip,
    //    };
    //    //const result = await apiRequest.post("users", userData);
    //    const response = await request.post("/users").set("user-agent", ua).send(userData).expect(200);
    //    console.log(response.status)
    //    console.log("response", response.body);
    //    const userId = response.body.id;
    //    globals.userId = userId;
    //    console.log({globals});
    //    const sentEmail = await emailPromise;
    //    console.log("sentEmail", sentEmail);
    //    const code = sentEmail.text.split("/").pop();
    //    console.log("code", code);

    //    const response2 = await request.post("/users/verifyEmail").send({code, userId}).expect(200);
    //    console.log(response2.status)
    //    console.log("response2", response2.body);

    //  })
    //})

    //describe("Login", () => {
    //  it("should successfully login", async function() {
    //    this.timeout(10000);
    //    const userData = {
    //      username: context.email,
    //      challenges: ["password", "sms"],
    //      ipAddress: context.ip,
    //      userAgent: context.ua,
    //    };
    //    const response = await request.post("/login").send(userData).expect(200);
    //    console.log(response.status)
    //    console.log("response.body", response.body);
    //    const challenge = response.body.challenge;
    //    console.log("challenge", challenge);


    //    console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 1\n\n\n\n\n\n\n\n")

    //    const eventAwaitterArgs = {
    //      eventEmitter: testEventEmitter,
    //      event: "sms.sent"
    //    };
    //    const eventAwaitter = new EventAwaitter(eventAwaitterArgs);
    //    eventAwaitter.listen();


    //    const challengeData = {
    //      code: context.password,
    //    };
    //    const response2 = await request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(200);
    //    console.log("response2.body", response2.body)
    //    const challenge2 = response2.body.challenge;
    //    console.log("challenge2", challenge2);


    //    console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 2\n\n\n\n\n\n\n\n")
    //    //console.log("sleeping for code...");
    //    //await new Promise(function(resolve, reject) {setTimeout(() => resolve(), 1000)})

    //    //var smsPromiseResolve;
    //    //const smsPromise = new Promise(function(resolve, reject) {
    //    //  smsPromiseResolve = resolve;
    //    //})
    //    //testEventEmitter.on("sms.sent", function(data) { // TODO cleanup listener after event received
    //    //  console.log("got event", data);
    //    //  return smsPromiseResolve(data);
    //    //})
    //    //const sentSms = await emailPromise;
    //    const sentSms = await eventAwaitter.get();
    //    console.log("sentSms", sentSms);
    //    const code = sentSms.message.split(" ")[3];
    //    console.log("code", code);
    //    const challengeData2 = {
    //      code,
    //    };
    //    const response3 = await request.post(`/login-challenges/${challenge2.id}/complete`).send(challengeData2).expect(200);
    //    console.log("response3.body", response3.body)
    //    const token = response3.body.token;
    //    context.token = token;
    //    const userId = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).user.id;
    //    console.log("userId", userId)
    //    context.userId = userId;


    //  })

    //  it("should fail login from ip address", async function() {
    //    this.timeout(10000);
    //    const wrongIp = "192.168.1.2";
    //    const userData = {
    //      username: context.email,
    //      challenges: ["password", "ipAddress"],
    //      ipAddress: wrongIp,
    //      userAgent: context.ua,
    //    };
    //    const response = await request.post("/login").send(userData).expect(200);
    //    console.log(response.status)
    //    console.log("response.body", response.body);
    //    const challenge = response.body.challenge;
    //    console.log("challenge", challenge);


    //    console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 1\n\n\n\n\n\n\n\n")


    //    const challengeData = {
    //      code: context.password,
    //    };
    //    const response2 = await request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(401);
    //    console.log("response2.body", response2.body)
    //    const challenge2 = response2.body.challenge;
    //    console.log("challenge2", challenge2);

    //  })

    //  it("should fail login from device", async function() {
    //    this.timeout(10000);
    //    const wrongUa = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3"
    //    const userData = {
    //      username: context.email,
    //      challenges: ["password", "device"],
    //      ipAddress: context.ip,
    //      userAgent: wrongUa,
    //    };
    //    const response = await request.post("/login").send(userData).expect(200);
    //    console.log(response.status)
    //    console.log("response.body", response.body);
    //    const challenge = response.body.challenge;
    //    console.log("challenge", challenge);


    //    console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 1\n\n\n\n\n\n\n\n")

    //    const challengeData = {
    //      code: context.password,
    //    };
    //    const response2 = await request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(401);
    //    console.log("response2.body", response2.body)
    //    const challenge2 = response2.body.challenge;
    //    console.log("challenge2", challenge2);

    //  })

    //})

      //describe("Email", function() {
      //deit("should create and verify a second email address", async function() {

      //de  const emailAddressData = {
      //de    userId: context.userId,
      //de    emailAddress: "test2@test.com",
      //de    isPrimary: true,
      //de  };
      //de  console.log("emailAddressData", emailAddressData);
      //de  const response = await request.post(`/email-addresses`).send(emailAddressData).expect(200);
      //de  console.log("response.body", response.body)
      //de  const emailId = response.body.id;


      //de  const eventAwaitterArgs = {
      //de    eventEmitter: testEventEmitter,
      //de    event: "email.sent"
      //de  };
      //de  const eventAwaitter = new EventAwaitter(eventAwaitterArgs);
      //de  eventAwaitter.listen();


      //de  const response2 = await request.post(`/email-addresses/${emailId}/startVerification`).expect(200);
      //de  console.log("response2.body", response2.body)


      //de  const sentEmail = await eventAwaitter.get();
      //de  console.log("sentEmail", sentEmail);
      //de  const code = sentEmail.text.split("/").pop();
      //de  const verifyData = {
      //de    code,
      //de    userId: context.userId,
      //de  };
      //de  const response3 = await request.post(`/email-addresses/${emailId}/verify`).send(verifyData).expect(200);
      //de  console.log("response3.body", response3.body)

      //de})
    //})//de

    //describe("PhoneNumber", function() {
    //  it("should create and verify a second phone number", async function() {

    //    const phoneNumberData = {
    //      userId: context.userId,
    //      phoneNumber: "680-555-5555",
    //      isPrimary: true,
    //    };
    //    console.log("phoneNumberData", phoneNumberData);
    //    const response = await request.post(`/phone-numbers`).send(phoneNumberData).expect(200);
    //    console.log("response.body", response.body)
    //    const phoneNumberId = response.body.id;


    //    const eventAwaitterArgs = {
    //      eventEmitter: testEventEmitter,
    //      event: "sms.sent"
    //    };
    //    const eventAwaitter = new EventAwaitter(eventAwaitterArgs);
    //    eventAwaitter.listen();


    //    const response2 = await request.post(`/phone-numbers/${phoneNumberId}/startVerification`).expect(200);
    //    console.log("response2.body", response2.body)


    //    const sentSms = await eventAwaitter.get();
    //    console.log("sentSms", sentSms);
    //    const code = sentSms.message.split(" ")[3];
    //    const verifyData = {
    //      code,
    //      userId: context.userId,
    //    };
    //    const response3 = await request.post(`/phone-numbers/${phoneNumberId}/verify`).send(verifyData).expect(200);
    //    console.log("response3.body", response3.body)


    //    
    //  })
    //})

    //describe("Access Token", function() {
    //  it("should create an access token", async function() {
    //    const expiresAt = new Date((new Date()).getTime() + 1000 * 60 * 60 * 24).toISOString().slice(0,10);
    //    //const expiresAt = new Date((new Date()).getTime() + 86400000).toISOString().slice(0,10);
    //    const accessTokenData = {
    //      userId: context.userId,
    //      maxUses: 0,
    //      expiresAt,
    //    };
    //    const response = await request.post(`/access-tokens`).send(accessTokenData).expect(200);
    //    console.log("response.body", response.body)
    //    context.accessToken = response.body.code;
    //  
    //  })
    //  it("should login with access token", async function() {

    //    const loginData = {
    //      username: context.email,
    //      //challenges: ["accessToken"],
    //      accessToken: context.accessToken,
    //      ipAddress: context.ip,
    //      userAgent: context.ua,
    //    };
    //    const response = await request.post("/loginWithAccessToken").send(loginData).expect(200);
    //    console.log("response.body", response.body)
    //    console.log("token", response.body.token);
    //  
    //  })
    //})

    //describe("One time password", function() {
    //  it("should create a one time password", async function() {
    //    const otpData = {
    //      userId: context.userId,
    //      maxUses: 0,
    //    };
    //    const response = await request.post(`/one-time-passwords`).send(otpData).expect(200);
    //    console.log("response.body", response.body)
    //    context.otp = response.body.code;
    //    
    //  })
    //  it("should login with one time password", async function() {

    //    const loginData = {
    //      username: context.email,
    //      //challenges: ["accessToken"],
    //      accessToken: context.otp,
    //      ipAddress: context.ip,
    //      userAgent: context.ua,
    //    };
    //    const response = await request.post("/loginWithAccessToken").send(loginData).expect(200);
    //    console.log("response.body", response.body)
    //    console.log("token", response.body.token);
    //    
    //  })
    //  it("should fail login second time with one time password", async function() {

    //    const loginData = {
    //      username: context.email,
    //      //challenges: ["accessToken"],
    //      accessToken: context.otp,
    //      ipAddress: context.ip,
    //      userAgent: context.ua,
    //    };
    //    console.log("loginData", loginData);
    //    const response = await request.post("/loginWithAccessToken").send(loginData).expect(401);
    //    console.log("response.body", response.body)
    //    console.log("token", response.body.token);
    //    
    //  })
    //})

  })
})



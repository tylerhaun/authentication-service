const EventAwaitter = require("../../../../EventAwaitter");
const context = require("../../../context");
const describeFromFs = require("../../../describeFromFs");


describeFromFs(__dirname, () => {
  it("should successfully login", async function() {
    this.timeout(10000);
    const userData = {
      username: context.email,
      challenges: ["password", "sms"],
      ipAddress: context.ip,
      userAgent: context.ua,
    };
    const response = await context.request.post("/login").send(userData).expect(200);
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
      code: context.password,
    };
    const response2 = await context.request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(200);
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
    const response3 = await context.request.post(`/login-challenges/${challenge2.id}/complete`).send(challengeData2).expect(200);
    console.log("response3.body", response3.body)
    const token = response3.body.token;
    context.token = token;
    const userId = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).user.id;
    console.log("userId", userId)
    context.userId = userId;


  })

  it("should fail login from ip address", async function() {
    this.timeout(10000);
    const wrongIp = "192.168.1.2";
    const userData = {
      username: context.email,
      challenges: ["password", "ipAddress"],
      ipAddress: wrongIp,
      userAgent: context.ua,
    };
    const response = await context.request.post("/login").send(userData).expect(200);
    console.log(response.status)
    console.log("response.body", response.body);
    const challenge = response.body.challenge;
    console.log("challenge", challenge);


    console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 1\n\n\n\n\n\n\n\n")


    const challengeData = {
      code: context.password,
    };
    const response2 = await context.request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(401);
    console.log("response2.body", response2.body)
    const challenge2 = response2.body.challenge;
    console.log("challenge2", challenge2);

  })

  it("should fail login from device", async function() {
    this.timeout(10000);
    const wrongUa = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3"
    const userData = {
      username: context.email,
      challenges: ["password", "device"],
      ipAddress: context.ip,
      userAgent: wrongUa,
    };
    const response = await context.request.post("/login").send(userData).expect(200);
    console.log(response.status)
    console.log("response.body", response.body);
    const challenge = response.body.challenge;
    console.log("challenge", challenge);


    console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 1\n\n\n\n\n\n\n\n")

    const challengeData = {
      code: context.password,
    };
    const response2 = await context.request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(401);
    console.log("response2.body", response2.body)
    const challenge2 = response2.body.challenge;
    console.log("challenge2", challenge2);

  })

})


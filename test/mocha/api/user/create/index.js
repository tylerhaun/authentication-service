const EventAwaitter = require("../../../../EventAwaitter");
const context = require("../../../context");
const describeFromFs = require("../../../describeFromFs");


//console.log("dirname", __dirname);
//console.log("process.cwd()", process.cwd());
//
//const path = require("path");
//function describeFromFsRecursive(describeLabels, cb) {
//  console.log("describeFromFsRecursive()", describeLabels);
//
//  const label = describeLabels.shift();
//  describe(label, function() {
//    if (describeLabels.length > 0) {
//      return describeFromFsRecursive(describeLabels, cb)
//    }
//    else {
//      return cb();
//    }
//  })
//
//}
//function describeFromFs(cb) {
//  const basePath = path.join(process.cwd(), "/test/mocha");
//  const relativePath = path.relative(basePath, __dirname)
//  const describeLabels = relativePath.split("/");
//  console.log({basePath, relativePath});
//  return describeFromFsRecursive(describeLabels, cb);
//
//}



//describe("API", () => {
//
//  describe("User", () => {
//
//    describe("Create", () => {

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


describeFromFs(__dirname, () => {
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
      username: context.email,
      email: context.email,
      phoneNumber: "716-555-5555",
      password: context.password,
      userAgent: context.ua,
      ipAddress: context.ip,
    };
    //const result = await apiRequest.post("users", userData);
    console.log("userData", userData);
    const response = await context.request.post("/users").set("user-agent", context.ua).send(userData).expect(200);
    console.log(response.status)
    console.log("response", response.body);
    const userId = response.body.id;
    context.userId = userId;
    const sentEmail = await emailPromise;
    console.log("sentEmail", sentEmail);
    const code = sentEmail.text.split("/").pop();
    console.log("code", code);

    const response2 = await context.request.post("/users/verifyEmail").send({code, userId}).expect(200);
    console.log(response2.status)
    console.log("response2", response2.body);

  })
})
  //    })
  //  })
  //})




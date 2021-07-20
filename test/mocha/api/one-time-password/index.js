const EventAwaitter = require("../../../EventAwaitter");
const context = require("../../context");
const describeFromFs = require("../../describeFromFs");


describeFromFs(__dirname, () => {
  it("should create a one time password", async function() {
    const otpData = {
      userId: context.userId,
      maxUses: 0,
    };
    const response = await context.request.post(`/one-time-passwords`).send(otpData).expect(200);
    console.log("response.body", response.body)
    context.otp = response.body.code;

  })
  it("should login with one time password", async function() {

    const loginData = {
      username: context.email,
      //challenges: ["accessToken"],
      accessToken: context.otp,
      ipAddress: context.ip,
      userAgent: context.ua,
    };
    const response = await context.request.post("/loginWithAccessToken").send(loginData).expect(200);
    console.log("response.body", response.body)
    console.log("token", response.body.token);

  })
  it("should fail login second time with one time password", async function() {

    const loginData = {
      username: context.email,
      //challenges: ["accessToken"],
      accessToken: context.otp,
      ipAddress: context.ip,
      userAgent: context.ua,
    };
    console.log("loginData", loginData);
    const response = await context.request.post("/loginWithAccessToken").send(loginData).expect(401);
    console.log("response.body", response.body)
    console.log("token", response.body.token);

  })
})

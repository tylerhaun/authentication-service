const EventAwaitter = require("../../../EventAwaitter");
const context = require("../../context");
const describeFromFs = require("../../describeFromFs");


describeFromFs(__dirname, () => {
  it("should create an access token", async function() {
    const expiresAt = new Date((new Date()).getTime() + 1000 * 60 * 60 * 24).toISOString().slice(0,10);
    //const expiresAt = new Date((new Date()).getTime() + 86400000).toISOString().slice(0,10);
    const accessTokenData = {
      userId: context.userId,
      maxUses: 0,
      expiresAt,
    };
    const response = await context.request.post(`/access-tokens`).send(accessTokenData).expect(200);
    console.log("response.body", response.body)
    context.accessToken = response.body.code;

  })
  it("should login with access token", async function() {

    const loginData = {
      username: context.email,
      //challenges: ["accessToken"],
      accessToken: context.accessToken,
      ipAddress: context.ip,
      userAgent: context.ua,
    };
    const response = await context.request.post("/loginWithAccessToken").send(loginData).expect(200);
    console.log("response.body", response.body)
    console.log("token", response.body.token);

  })
})


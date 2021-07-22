const readline = require("readline");

const EventAwaitter = require("../../../EventAwaitter");
const context = require("../../context");
const describeFromFs = require("../../describeFromFs");


async function awaitUserInput() {

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const code = await new Promise(function(resolve, reject) {
      rl.question("Enter code", (answer) => {
        console.log({answer})
        resolve(answer);
        rl.close();
        return;
      });
    })

  return code;

}


describeFromFs(__dirname, () => {
  it("should successfully create a new totp", async function() {
    this.timeout(30000);

    const totpData = {
      userId: context.userId,
    };
    console.log("totpData", totpData);
    const response = await context.request.post(`/totps`).send(totpData).expect(200);
    console.log("response.body", response.body)
    const totpId = response.body.id;


    const response2 = await context.request.post(`/totps/${totpId}/startVerification`).send({userId: context.userId}).expect(200);
    console.log("response2.body", response2.body)


    const code = await awaitUserInput();
    console.log("code", code);
    const verifyData = {
      code,
      userId: context.userId,
    };
    const response3 = await context.request.post(`/totps/${totpId}/verify`).send(verifyData).expect(200);
    console.log("response3.body", response3.body)

  })

  it("should login with tpa", async function() {
    this.timeout(30000);

    const loginData = {
      username: context.email,
      challenges: ["tpa"],
      ipAddress: context.ip,
      userAgent: context.ua,
    };
    const response = await context.request.post("/login").send(loginData).expect(200);
    console.log("response.body", response.body)
    const challenge = response.body.challenge;

    const code = await awaitUserInput();
    console.log("code", code);

    const challengeData = {
      code,
    };
    const response2 = await context.request.post(`/login-challenges/${challenge.id}/complete`).send(challengeData).expect(200);
    console.log("response2.body", response2.body)
    const token = response2.body.token;
    console.log("token", token);

  })
})

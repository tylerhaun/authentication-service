const EventAwaitter = require("../../../EventAwaitter");
const context = require("../../context");
const describeFromFs = require("../../describeFromFs");


describeFromFs(__dirname, () => {
  it("should create and verify a second email address", async function() {

    const emailAddressData = {
      userId: context.userId,
      emailAddress: "test2@test.com",
      isPrimary: true,
    };
    console.log("emailAddressData", emailAddressData);
    const response = await context.request.post(`/email-addresses`).send(emailAddressData).expect(200);
    console.log("response.body", response.body)
    const emailId = response.body.id;


    const eventAwaitterArgs = {
      eventEmitter: testEventEmitter,
      event: "email.sent"
    };
    const eventAwaitter = new EventAwaitter(eventAwaitterArgs);
    eventAwaitter.listen();


    const response2 = await context.request.post(`/email-addresses/${emailId}/startVerification`).expect(200);
    console.log("response2.body", response2.body)


    const sentEmail = await eventAwaitter.get();
    console.log("sentEmail", sentEmail);
    const code = sentEmail.text.split("/").pop();
    const verifyData = {
      code,
      userId: context.userId,
    };
    const response3 = await context.request.post(`/email-addresses/${emailId}/verify`).send(verifyData).expect(200);
    console.log("response3.body", response3.body)

  })
})


const EventAwaitter = require("../../../EventAwaitter");
const context = require("../../context");
const describeFromFs = require("../../describeFromFs");


describeFromFs(__dirname, () => {
  it("should create and verify a second phone number", async function() {

    const phoneNumberData = {
      userId: context.userId,
      phoneNumber: "680-555-5555",
      isPrimary: true,
    };
    console.log("phoneNumberData", phoneNumberData);
    const response = await context.request.post(`/phone-numbers`).send(phoneNumberData).expect(200);
    console.log("response.body", response.body)
    const phoneNumberId = response.body.id;

    const eventAwaitterArgs = {
      eventEmitter: testEventEmitter,
      event: "sms.sent"
    };
    const eventAwaitter = new EventAwaitter(eventAwaitterArgs);
    eventAwaitter.listen();

    const response2 = await context.request.post(`/phone-numbers/${phoneNumberId}/startVerification`).expect(200);
    console.log("response2.body", response2.body)

    const sentSms = await eventAwaitter.get();
    console.log("sentSms", sentSms);
    const code = sentSms.message.split(" ")[3];
    const verifyData = {
      code,
      userId: context.userId,
    };
    const response3 = await context.request.post(`/phone-numbers/${phoneNumberId}/verify`).send(verifyData).expect(200);
    console.log("response3.body", response3.body)

  })
})


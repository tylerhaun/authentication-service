const twilio = require('twilio');


//class SmsProvider {
//
//  async send(args) {
//    const { phoneNumber, message } = args;
//    throw new Error("");
//    return {
//      messageId
//    }
//  }
//
//}


class SmsProviderFactory {

  get(type) {
    console.log("SmsProviderFactory.get()", type);
    switch(type) {
      case "test":
        return new TestSmsProvider();
      case "twilio":
        return new TwilioSmsProvider();
      default:
        throw new Error("Invalid sms provider type: " + type);
    }
  }

}

module.exports.SmsProviderFactory = SmsProviderFactory;




class TwilioSmsProvider {

  async send(args) {
    console.log("TwilioSmsProvider.send()")
    const { to, message } = args;

    var accountSid = process.env.TWILIO_ACCOUNT_SID;
    var authToken = process.env.TWILIO_AUTH_TOKEN;

    var client = new twilio(accountSid, authToken);

    const createArgs = {
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    };
    const response = await client.messages.create(createArgs);
    console.log("response", response);
    return {
      messageId: response.sid
    };

  }

}


class TestSmsProvider {

  async send(args) {
    console.log("TestSmsProvider.send()", args);
  
    const event = "sms.sent";
    //const message = {
    //  event: "sms.sent",
    //  ...args,
    //};
    //process.send(JSON.stringify(message));
    try {
      console.log("global.testEventEmitter", global.testEventEmitter);
      const result = global.testEventEmitter.emit(event, args);
      console.log("result", result);
    }
    catch(e) {console.error(e)}
    

    return {
      messageId: 0
    }
  }

}


//const twilioSmsProvider = new TwilioSmsProvider();
//twilioSmsProvider.send()
//  .catch(error => {
//    console.error(error);
//  })

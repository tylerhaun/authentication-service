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

  getSmsProvider(type) {
    switch(type) {
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
    const { phoneNumber, message } = args;

    var accountSid = process.env.TWILIO_ACCOUNT_SID;
    var authToken = process.env.TWILIO_AUTH_TOKEN;

    var client = new twilio(accountSid, authToken);

    const createArgs = {
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    };
    const response = await client.messages.create(createArgs);
    console.log("response", response);
    return {
      messageId: response.sid
    };

  }

}


//const twilioSmsProvider = new TwilioSmsProvider();
//twilioSmsProvider.send()
//  .catch(error => {
//    console.error(error);
//  })

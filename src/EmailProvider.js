const Joi = require("joi");
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


class EmailProviderFactory {

  get(type) {
    switch(type) {
      case "test":
        return new TestEmailProvider();
        //case "sendgrid":
        //careturn new SendgridEmailProvider();
      case "nodemailer":
        return new NodemailerEmailProvider();
      default:
        throw new Error("Invalid sms provider type: " + type);
    }
  }

}

module.exports.EmailProviderFactory = EmailProviderFactory;




//class SendGridEmailProvider {
//
//  async send(args) {
//    console.log("TwilioSmsProvider.send()")
//    const { phoneNumber, message } = args;
//
//    console.log("response", response);
//    return {
//      messageId: response.sid
//    };
//
//  }
//
//}


class TestEmailProvider {

  async send(args) {
    console.log("TestEmailProvider.send", args);
  
    const event = "email.sent";
    const message = {
      event,
      ...args,
    };
    //try {
    //  process.send(JSON.stringify(message));
    //}
    //catch(e) {console.error(e)}
    try {
      const result = global.testEventEmitter.emit(event, args);
      console.log("result", result);
    }
    catch(e) {console.error(e)}

    return {
      messageId: 0
    }
  }

}


var nodemailer = require('nodemailer');
class NodemailerEmailProvider {

  constructor() {

    const transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_TRANSPORT_SERVICE,
      auth: {
        user: process.env.NODEMAILER_TRANSPORT_USER,
        pass: process.env.NODEMAILER_TRANSPORT_PASS,
      }
    });
    this.transporter = transporter;
    console.log("transporter", transporter);

  }

  async send(args) {
    console.log("NodemailerEmailProvider.send()", args);

    const schema = Joi.object({
      to: Joi.string().required(),
      subject: Joi.string(),
      text: Joi.string().required(),
    });
    const validated = Joi.attempt(args, schema);
    console.log("validated", validated);

    const transporter = this.transporter;
    const mailOptions = {
      from: process.env.NODEMAILER_FROM_EMAIL,
      ...validated,
    };
    const result = await new Promise(function(resolve, reject) {
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return reject(error);
        }
        console.log("response", info)
        console.log('Email sent: ' + info.response);
        return resolve(info);
      });
    })


    return {
      messageId: 0
    }
  }

}


const Joi = require("joi");
const db = require("../models")
const AbstractController = require("./AbstractController");

const { SmsProviderFactory } = require("../SmsProvider");



function generateManualVerificationCode() {

  const length = 6;
  var result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;

}


const smsProviderType = "twilio"; // TODO put it env

class PasswordController extends AbstractController {

  _getModel() {
    return db.SmsVerificationRequest;
  }

  async create(data) {

    const schema = Joi.object({
      phoneNumber: Joi.string().required(),
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const code = generateManualVerificationCode();

    const smsProviderFactory = new SmsProviderFactory()
    const smsProvider = smsProviderFactory.getSmsProvider(smsProviderType);
    const sendSmsArgs = {
      phoneNumber: validated.phoneNumber,
      message: `Your code is ${code}`,
    };
    const result = await smsProvider.send(sendSmsArgs);
    console.log("result", result);

    const svrCreateArgs = {
      ...validated,
      code,
      provider: smsProviderType,
      externalId: result.messageId,
    };
    console.log("svrCreateArgs", svrCreateArgs);
    const createdSvr = await this.model.create(svrCreateArgs);
    console.log("createdSvr", createdSvr);

    return createdSvr;


  }

}

module.exports = PasswordController;



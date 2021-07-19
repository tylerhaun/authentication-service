const Joi = require("joi");
const moment = require("moment-timezone");
const handlebars = require("handlebars");

const utils = require("../utils");
const db = require("../models")

import VerificationRequestController from "./VerificationRequestController";

const { EmailProviderFactory } = require("../EmailProvider");


const emailProviderType = "test"; //TODO put in env


class EmailVerificationRequestController extends VerificationRequestController {

  //_getModel() {
  //  return db.EmailVerificationRequest;
  //}

  get _providerType() {
    return emailProviderType;
  }

  async _send(data) {

    const schema = Joi.object({
      user: Joi.object().required(),
      code: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);


    const emailProviderFactory = new EmailProviderFactory()
    const emailProvider = emailProviderFactory.get(emailProviderType);
    const subject = validated.subject || "Please verify your email";
    const verifyUrl = "http://localhost:3000/{{code}}" //TODO put in env
    const template = validated.text || `Click this link to verify your email: ${verifyUrl}`;
    const text = handlebars.compile(template)(validated)

    const sendEmailArgs = {
      to: validated.user.email,
      subject,
      text,
    };
    const result = await emailProvider.send(sendEmailArgs);
    console.log("result", result);
    return result;

  
  }

}


export default EmailVerificationRequestController;


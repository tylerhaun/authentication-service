const Joi = require("joi");
const moment = require("moment-timezone");
const handlebars = require("handlebars");

const utils = require("../utils");
const db = require("../models")

import VerificationRequestController from "./VerificationRequestController";
import EmailAddressController from "./EmailAddressController";

const { EmailProviderFactory } = require("../EmailProvider");


const emailProviderType = "test"; //TODO put in env


class EmailVerificationRequestController extends VerificationRequestController {

  get _providerType() {
    return emailProviderType;
  }

  async _send(data) {
    this.logger.log({method: "_send()", data});

    const schema = Joi.object({
      user: Joi.object().required(),
      code: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const emailAddressController = new EmailAddressController();
    const primaryEmail = await emailAddressController.findOne({userId: validated.user.id, isPrimary: true});
    this.logger.log({primaryEmail});

    const subject = validated.subject || "Please verify your email";
    const verifyUrl = "http://localhost:3000/{{code}}" //TODO put in env
    const template = validated.text || `Click this link to verify your email: ${verifyUrl}`;
    const text = handlebars.compile(template)(validated)

    const emailProviderFactory = new EmailProviderFactory()
    const emailProvider = emailProviderFactory.get(emailProviderType);
    const sendEmailArgs = {
      to: primaryEmail.emailAddress,
      subject,
      text,
    };
    const result = await emailProvider.send(sendEmailArgs);
    this.logger.log({result});
    return result;

  }

}


export default EmailVerificationRequestController;


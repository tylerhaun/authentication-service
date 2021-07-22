const Joi = require("joi");
const moment = require("moment");
const handlebars = require("handlebars");

const utils = require("../utils");
const db = require("../models")

import VerificationRequestController from "./VerificationRequestController";
import PhoneNumberController from "./PhoneNumberController";

import { SmsProviderFactory } from "../SmsProvider";


const smsProviderType = "test"; // TODO put it env

class SmsVerificationRequestController extends VerificationRequestController {

  get _provderType() {
    return smsProviderType;
  }

  async _send(data) {
    this.logger.log({method: "_send()", data});

    const schema = Joi.object({
      user: Joi.object().required(),
      code: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const phoneNumberController = new PhoneNumberController();
    const primaryPhone = await phoneNumberController.findOne({userId: validated.user.id, isPrimary: true});
    this.logger.log({primaryPhone});

    const template = "Your code is {{code}}";
    const message = handlebars.compile(template)(validated)

    const smsProviderFactory = new SmsProviderFactory()
    const smsProvider = smsProviderFactory.get(smsProviderType);
    const sendSmsArgs = {
      to: primaryPhone.phoneNumber,
      message,
    };
    this.logger.log({sendSmsArgs});
    const result = await smsProvider.send(sendSmsArgs);
    this.logger.log({result});

    return result;
  }

}

export default SmsVerificationRequestController;



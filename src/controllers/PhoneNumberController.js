const _ = require("lodash");
const Joi = require("joi");
const phone = require("phone");
const moment = require("moment");

const db = require("../models")
const utils = require("../utils");

import AbstractController from "./AbstractController";
import PasswordController from "./PasswordController";
import SmsVerificationRequestController from "./SmsVerificationRequestController";
//import VerifiableController from "./VerifiableController";


class PhoneNumberController extends AbstractController {

  constructor() {
    super(arguments);
  }

  _getModel() {
    return db.PhoneNumber;
  }

  async startVerification(query) {

    console.log(`${this.constructor.name}.startVerification()`, query);

    const schema = Joi.object({
      id: Joi.string().required(),
      //email: Joi.string().required(),
      //userId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const phoneNumber = await this.findOne({id: validated.id});
    console.log("phoneNumber", phoneNumber);

    const code = utils.randomString(6)
    console.log("code", code);

    const svrCreateArgs = {
      userId: phoneNumber.userId,
      phoneNumberId: phoneNumber.id,
      //provider: "",
      //subject: "",
      //text: "",
      code,
      //expiration: "",
      //loginChallengeId: "",
    };
    console.log("svrCreateArgs", svrCreateArgs);
    const smsVerificationRequestController = new SmsVerificationRequestController();
    const createdSvr = await smsVerificationRequestController.create(svrCreateArgs);
    console.log("createdSvr", createdSvr);
    return createdSvr;

  }


  /*
   *  runs validations like expiration,
   *  updates emailAddress.verified field,
   *  calls evr.approve()
   *  TODO improve validation logic
   *
   */
  async verify(query, data) {
    console.log(`${this.constructor.name}.verify()`, data);

    const schema = Joi.object({
      query: Joi.object({
        id: Joi.string().required()
      }),
      data: Joi.object({
        code: Joi.string().required(),
        userId: Joi.string().required(),
      }),
    });
    const validated = Joi.attempt({query, data}, schema);

    // The code used for email verifications is big and unlikely to happen twice, so simple logic can be used here.
    // If the code is expired, none will be found and user gets an error to retry
    const expiry = "1m"
    const expiryMoment = moment().subtract(utils.formatDuration(expiry));
    const smsVerificationRequestController = new SmsVerificationRequestController();
    const svrFindArgs = {
      code: validated.data.code,
      createdAt: {
        [Symbol.for("gt")]: expiryMoment,
      }
    };
    if (validated.data.userId) {
      Object.assign(svrFindArgs, {userId: validated.data.userId});
    }
    console.log("svrFindArgs", svrFindArgs);
    const svr = await smsVerificationRequestController.findOne(svrFindArgs);
    console.log("svr", svr);
    if (!svr) {
      throw new Error("No code found");
    }

    await smsVerificationRequestController.approve({id: svr.id, userId: validated.data.userId});

    const updateResult = await this.update({
      id: svr.phoneNumberId
    }, {
      verified: true,
    });
    console.log("updateResult", updateResult);

    const updatedPhoneNumber = await this.findOne({id: svr.phoneNumberId});
    return updatedPhoneNumber;
  
  }


}

export default PhoneNumberController;


const _ = require("lodash");
const Joi = require("joi");
const moment = require("moment");

const db = require("../models")
const utils = require("../utils");

//import AbstractController from "./AbstractController";
import SmsVerificationRequestController from "./SmsVerificationRequestController";
import VerifiableController from "./VerifiableController";


class PhoneNumberController extends VerifiableController {

  _getModel() {
    return db.PhoneNumber;
  }

  get _verificationRequestController() {
    return SmsVerificationRequestController;
  }

  //async startVerification(query) {
  //  this.logger.log({method: "startVerification", query});

  //  const schema = Joi.object({
  //    id: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(query, schema);

  //  const phoneNumber = await this.findOne({id: validated.id});
  //  this.logger.log({phoneNumber});

  //  const code = utils.randomString(6)
  //  this.logger.log({code});

  //  const svrCreateArgs = {
  //    userId: phoneNumber.userId,
  //    phoneNumberId: phoneNumber.id,
  //    //provider: "",
  //    //subject: "",
  //    //text: "",
  //    code,
  //    //expiration: "",
  //    //loginChallengeId: "",
  //  };
  //  this.logger.log({svrCreateArgs});
  //  const smsVerificationRequestController = new SmsVerificationRequestController();
  //  const createdSvr = await smsVerificationRequestController.create(svrCreateArgs);
  //  this.logger.log({createdSvr});
  //  return createdSvr;

  //}

  //async _createVerificationRequest(data) {
  //  this.logger.log({method: "_createVerificationRequest", data});
  //  const schema = Joi.object({
  //    userId: Joi.string().required(),
  //    emailAddressId: Joi.string(),
  //    phoneNumberId: Joi.string().required(),
  //    code: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(query, schema);

  //  //const svrCreateArgs = {
  //  //  userId: validated.userId,
  //  //  phoneNumberId: validated.phoneNumberId,
  //  //  code,
  //  //};
  //  const svrCreateArgs = _.pick(validated, ["userId", "phoneNumberId", "code"]);
  //  this.logger.log({svrCreateArgs});
  //  const smsVerificationRequestController = new SmsVerificationRequestController();
  //  const createdSvr = await smsVerificationRequestController.create(svrCreateArgs);
  //  this.logger.log({createdSvr});
  //  return createdSvr;
  //
  //}


  /*
   *  runs validations like expiration,
   *  updates emailAddress.verified field,
   *  calls evr.approve()
   *  TODO improve validation logic
   *
   */
  //async verify(query, data) {
  //  this.logger.log({method: "verify", data});

  //  const schema = Joi.object({
  //    query: Joi.object({
  //      id: Joi.string().required()
  //    }),
  //    data: Joi.object({
  //      code: Joi.string().required(),
  //      userId: Joi.string().required(),
  //    }),
  //  });
  //  const validated = Joi.attempt({query, data}, schema);

  //  // The code used for email verifications is big and unlikely to happen twice, so simple logic can be used here.
  //  // If the code is expired, none will be found and user gets an error to retry
  //  const expiry = "1m"
  //  const expiryMoment = moment().subtract(utils.formatDuration(expiry));
  //  const smsVerificationRequestController = new SmsVerificationRequestController();
  //  const svrFindArgs = {
  //    code: validated.data.code,
  //    createdAt: {
  //      [Symbol.for("gt")]: expiryMoment,
  //    }
  //  };
  //  if (validated.data.userId) {
  //    Object.assign(svrFindArgs, {userId: validated.data.userId});
  //  }
  //  this.logger.log({svrFindArgs});
  //  const svr = await smsVerificationRequestController.findOne(svrFindArgs);
  //  this.logger.log({svr});
  //  if (!svr) {
  //    throw new Error("No code found");
  //  }

  //  await smsVerificationRequestController.approve({id: svr.id, userId: validated.data.userId});

  //  const updateResult = await this.update({
  //    id: svr.phoneNumberId
  //  }, {
  //    verified: true,
  //  });
  //  this.logger.log({updateResult});

  //  const updatedPhoneNumber = await this.findOne({id: svr.phoneNumberId});
  //  return updatedPhoneNumber;
  //
  //}


}

export default PhoneNumberController;


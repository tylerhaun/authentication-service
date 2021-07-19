const _ = require("lodash");
const Joi = require("joi");
const moment = require("moment");

const db = require("../models")
const utils = require("../utils");

//import AbstractController from "./AbstractController";
import VerifiableController from "./VerifiableController";
import EmailVerificationRequestController from "./EmailVerificationRequestController";


class EmailAddressController extends VerifiableController {

  _getModel() {
    return db.EmailAddress;
  }

  get _verificationRequestController() {
    return EmailVerificationRequestController;
  }

  //async startVerification(query) {
  //  this.logger.log({method: "startVerification", query});

  //  const schema = Joi.object({
  //    id: Joi.string().required(),
  //    //email: Joi.string().required(),
  //    //userId: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(query, schema);

  //  const emailAddress = await this.findOne({id: validated.id});
  //  this.logger.log({emailAddress});

  //  const code = utils.randomString(60)
  //  this.logger.log({code});

  //  const evrCreateArgs = {
  //    userId: emailAddress.userId,
  //    emailAddressId: emailAddress.id,
  //    //provider: "",
  //    //subject: "",
  //    //text: "",
  //    code,
  //    //expiration: "",
  //    //loginChallengeId: "",
  //  };
  //  this.logger.log({evrCreateArgs});
  //  const emailVerificationRequestController = new EmailVerificationRequestController();
  //  const createdEvr = await emailVerificationRequestController.create(evrCreateArgs);
  //  this.logger.log({createdEvr});
  //  return createdEvr;

  //}

  //async _createVerificationRequest(data) {
  //  this.logger.log({method: "_createVerificationRequest", data});
  //  const schema = Joi.object({
  //    userId: Joi.string().required(),
  //    emailAddressId: Joi.string().required(),
  //    phoneNumberId: Joi.string(),
  //    code: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(data, schema);

  //  //const evrCreateArgs = {
  //  //  userId: validated.userId,
  //  //  emailAddressId: validated.emailAddressId,
  //  //  code,
  //  //};
  //  const evrCreateArgs = _.pick(validated, ["userId", "emailAddressId", "code"]);
  //  //this.logger.log({evrCreateArgs});
  //  const emailVerificationRequestController = new EmailVerificationRequestController();
  //  const createdEvr = await emailVerificationRequestController.create();
  //  this.logger.log({createdEvr});
  //  return createdEvr;
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
  //  const emailVerificationRequestController = new EmailVerificationRequestController();
  //  const evrFindArgs = {
  //    code: validated.data.code,
  //    createdAt: {
  //      [Symbol.for("gt")]: expiryMoment,
  //    }
  //  };
  //  if (validated.data.userId) {
  //    Object.assign(evrFindArgs, {userId: validated.data.userId});
  //  }
  //  this.logger.log({evrFindArgs});
  //  const evr = await emailVerificationRequestController.findOne(evrFindArgs);
  //  this.logger.log({evr});
  //  if (!evr) {
  //    throw new Error("No code found");
  //  }

  //  await emailVerificationRequestController.approve({id: evr.id, userId: validated.data.userId});

  //  const updateResult = await this.update({
  //    id: evr.emailAddressId,
  //  }, {
  //    verified: true,
  //  });
  //  this.logger.log({updateResult});

  //  const updatedEmailAddress = await this.findOne({id: evr.emailAddressId});
  //  return updatedEmailAddress;
  //
  //}
  
}


export default EmailAddressController;


console.log("In EmailVerificationRequestController");
const Joi = require("joi");
const moment = require("moment-timezone");
const handlebars = require("handlebars");

const utils = require("../utils");
const db = require("../models")
//const AbstractController = require("./AbstractController");
//import AbstractController from "./AbstractController";
import VerificationRequestController from "./VerificationRequestController";

//const UserController = require("./UserController");
import UserController from "./UserController";

//const { SmsProviderFactory } = require("../SmsProvider");
const { EmailProviderFactory } = require("../EmailProvider");


const emailProviderType = "test"; //TODO put in env


//class EmailVerificationRequestController extends AbstractController {
class EmailVerificationRequestController extends VerificationRequestController {

  _getModel() {
    return db.EmailVerificationRequest;
  }

  get _providerType() {
    return emailProviderType;
  }

  async _send(data) {

    const schema = Joi.object({
      //userId: Joi.string().required(),
      user: Joi.object().required(),
      code: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);


    const emailProviderFactory = new EmailProviderFactory()
    const emailProvider = emailProviderFactory.get(emailProviderType);
    //const smsProvider = smsProviderFactory.getSmsProvider("test");
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

  //async assertRecentLimit(query, limit) {
  //  limit = limit || 2;

  //  const schema = Joi.object({
  //    userId: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(query, schema);

  //  const recentEvrs = await this.find({
  //    userId: validated.userId,
  //    createdAt: {
  //      [Symbol.for("gt")]: moment().subtract(1, "minute")
  //    }
  //  })
  //  console.log("recentEvrs", recentEvrs);
  //  if (recentEvrs.length > limit) {
  //    throw new Error("Too many requests.  Please try again later");
  //  }
  //
  //}


  //async create(data) {
  //  console.log("EmailVerificationRequestController.create()", data);

  //  const schema = Joi.object({
  //    //email: Joi.string().required(),
  //    userId: Joi.string().required(),
  //    subject: Joi.string(),
  //    text: Joi.string(),
  //    code: Joi.string(),
  //    expiration: Joi.string(),
  //    loginChallengeId: Joi.string(),
  //  });
  //  const validated = Joi.attempt(data, schema);


  //  this.assertRecentLimit({userId: validated.userId}, 2);


  //  const userController = new UserController();
  //  const user = await userController.findOne({
  //    id: validated.userId,
  //  });
  //  console.log("user", user);


  //  const code = validated.code || utils.randomString(6);


  //  const emailProviderFactory = new EmailProviderFactory()
  //  const emailProvider = emailProviderFactory.get(emailProviderType);
  //  //const smsProvider = smsProviderFactory.getSmsProvider("test");
  //  const subject = validated.subject || "Please verify your email";
  //  const verifyUrl = "http://localhost:3000/{{code}}" //TODO put in env
  //  const template = validated.text || `Click this link to verify your email: ${verifyUrl}`;
  //  const text = handlebars.compile(template)({code, user})

  //  const sendEmailArgs = {
  //    to: user.email,
  //    subject,
  //    text,
  //  };
  //  const result = await emailProvider.send(sendEmailArgs);
  //  console.log("result", result);


  //  const expiration = validated.expiration ? moment(validated.expiration) : moment().add(1, "minute");
  //  const evrCreateArgs = {
  //    ...validated,
  //    code,
  //    provider: emailProviderType,
  //    externalId: result.messageId,
  //    expiration,
  //  };
  //  console.log("evrCreateArgs", evrCreateArgs);
  //  const createdEvr = await super.create(evrCreateArgs);
  //  console.log("createdEvr", createdEvr);

  //  return createdEvr;

  //}


  //async approve(data) {
  //  console.log(`${this.constructor.name}.approve()`, data);

  //  const schema = Joi.object({
  //    code: Joi.string(),
  //  });
  //  const validated = Joi.attempt(data, schema);

  //  const evrFindArgs = {
  //    code: validated.code,
  //    approvedAt: null,
  //    //createdAt: {
  //    //  [Symbol.for("lt")]: moment().subtract(5, "minutes")
  //    //},
  //    
  //    //userId: validated.userId,
  //    //expiration: {
  //    //  [Symbol.for("gt")]: moment()
  //    //}
  //  };
  //  console.log("evrFindArgs", evrFindArgs);
  //  const evrs = await this.find(evrFindArgs)
  //  console.log("evrs", evrs);
  //  if (evrs.length == 0) {
  //    throw new Error("Invalid code");
  //  }
  //  const activeEvrs = evrs.filter(evr => moment(evr.createdAt) > moment().subtract(1, "minute"))
  //  //const activeEvrs = evrs.filter(evr => {
  //  //  console.log("evr.createdAt", evr.createdAt);
  //  //  const createdAt = moment(evr.createdAt);
  //  //  console.log({createdAt});
  //  //  const expiration = moment().subtract(1, "minute");
  //  //  console.log({createdAt, expiration});
  //  //  const ret = createdAt > expiration;
  //  //  console.log({createdAt, expiration, ret});
  //  //  return ret;
  //  //})
  //  console.log("activeEvrs", activeEvrs);
  //  //if (evr.createdAt > moment.subtract(5, "minutes")) {
  //  //  throw new Error("Email verification has expired");
  //  //}
  //  //const evrs = await smsVerificationRequestController.findOne(svrFindArgs)
  //  if (activeEvrs.length == 0 && evrs.length > 0) {
  //    throw new Error("Email verification has expired");
  //  }
  //  const evr = activeEvrs[0];
  //  console.log("evr", evr);

  //  const updateEvrQuery = {
  //    id: evr.id
  //  };
  //  const updateEvrData = {
  //    approvedAt: moment(),
  //  };
  //  console.log({updateEvrQuery, updateEvrData});
  //  const updateResult = await this.update(updateEvrQuery, updateEvrData)
  //  console.log("updateResult", updateResult);
  //  const updatedEvr = await this.find(updateEvrQuery);
  //  console.log("updatedEvr", updatedEvr);
  //  return updatedEvr;

  //  //const smsVerificationCreateArgs = {
  //  //  userId: validated.userId,
  //  //  smsVerificationRequestId: svr.id,
  //  //};
  //  //console.log("smsVerificationCreateArgs", smsVerificationCreateArgs);
  //  //const createdSmsVerification = await this.model.create(smsVerificationCreateArgs);
  //  //console.log("createdSmsVerification", createdSmsVerification);

  //  //return createdSmsVerification;
  //
  //}

}

//module.exports = EmailVerificationRequestController;
export default EmailVerificationRequestController;



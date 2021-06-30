console.log("In VerificationRequestController");
const Joi = require("joi");
const moment = require("moment");

const utils = require("../utils");
const db = require("../models")
//const AbstractController = require("./AbstractController");
import AbstractController from "./AbstractController";
//import UserController from "./UserController";

//const { SmsProviderFactory } = require("../SmsProvider");



//function generateManualVerificationCode(length) {
//
//  length = length || 6;
//  var result = '';
//  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//  for (var i = 0; i < length; i++) {
//    result += characters.charAt(Math.floor(Math.random() * characters.length));
//  }
//  return result;
//
//}


//const smsProviderType = "twilio"; // TODO put it env

class VerificationRequestController extends AbstractController {

  //_getModel() {
  //  return db.SmsVerificationRequest;
  //}

  // async create(data) {

  //   const schema = Joi.object({
  //     to: Joi.string().required(),
  //     userId: Joi.string().required(),
  //     code: Joi.string(),
  //     //expiration: Joi.string(),
  //     type: Joi.string()
  //     loginChallengeId: Joi.string(),
  //   });
  //   const validated = Joi.attempt(data, schema);

  //   
  //   const recentSvrs = await this.find({
  //     userId: validated.userId,
  //     createdAt: {
  //       [Symbol.for("gt")]: moment().subtract(1, "minute")
  //     }
  //   })
  //   console.log("recentSvrs", recentSvrs);
  //   if (recentSvrs.length > 2) {
  //     throw new Error("Too many requests.  Please try again later");
  //   }

  //   const code = validated.code || utils.randomString(6);

  //   const smsProviderFactory = new SmsProviderFactory()
  //   //const smsProvider = smsProviderFactory.getSmsProvider(smsProviderType);
  //   const smsProvider = smsProviderFactory.getSmsProvider("test");
  //   const sendSmsArgs = {
  //     phoneNumber: validated.phoneNumber,
  //     message: `Your code is ${code}`,
  //   };
  //   const result = await smsProvider.send(sendSmsArgs);
  //   console.log("result", result);

  //   const expiration = validated.expiration ? moment(validated.expiration) : moment().add(1, "minute");
  //   const svrCreateArgs = {
  //     ...validated,
  //     code,
  //     provider: smsProviderType,
  //     externalId: result.messageId,
  //     expiration,
  //   };
  //   console.log("svrCreateArgs", svrCreateArgs);
  //   const createdSvr = await this.model.create(svrCreateArgs);
  //   console.log("createdSvr", createdSvr);

  //   return createdSvr;

  // }

  //async approve(data) {

  //  const schema = Joi.object({
  //    userId: Joi.string().required(),
  //    code: Joi.string(),
  //  });
  //  const validated = Joi.attempt(data, schema);

  //  const svrFindArgs = {
  //    //code: validated.code,
  //    userId: validated.userId,
  //    expiration: {
  //      [Symbol.for("gt")]: moment()
  //    }
  //  };
  //  console.log("svrFindArgs", svrFindArgs);
  //  const svrs = await this.find(svrFindArgs)
  //  //const svrs = await smsVerificationRequestController.findOne(svrFindArgs)
  //  const svr = svrs[0];
  //  console.log("svrs", svrs);
  //  if (!svr) {
  //    throw new Error("");
  //  }

  //  const smsVerificationCreateArgs = {
  //    userId: validated.userId,
  //    smsVerificationRequestId: svr.id,
  //  };
  //  console.log("smsVerificationCreateArgs", smsVerificationCreateArgs);
  //  const createdSmsVerification = await this.model.create(smsVerificationCreateArgs);
  //  console.log("createdSmsVerification", createdSmsVerification);

  //  return createdSmsVerification;
  //
  //}


  //get _providerType() {
  //  throw new Error("Must override");
  //}

  //async _send(data) {

  //  const schema = Joi.object({
  //    user: Joi.object().required(),
  //    code: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(data, schema);
  //  throw new Error("Must override");
  //  return {
  //    messageId: ""
  //  };
  //}

  async create(data) {
    console.log(`${this.constructor.name}.VerificationRequestController.create()`, data);

    const schema = Joi.object({
      //email: Joi.string().required(),
      userId: Joi.string().required(),
      subject: Joi.string(),
      text: Joi.string(),
      code: Joi.string(),
      expiration: Joi.string(),
      loginChallengeId: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    this._assertRecentLimit({userId: validated.userId}, 2);

    const UserController = require("./UserController").default; // hack for circular dependency
    console.log("UserController", UserController);
    const userController = new UserController();
    const user = await userController.findOne({
      id: validated.userId,
    });
    console.log("user", user);

    const code = validated.code || utils.randomString(6);

    const sendArgs = {code, user};
    const sendResult = await this._send(sendArgs);
    console.log("sendResult", sendResult);
    //const sendResult = this._send({code, userId: validated.userId});

    //const emailProviderFactory = new EmailProviderFactory()
    //const emailProvider = emailProviderFactory.get(emailProviderType);
    ////const smsProvider = smsProviderFactory.getSmsProvider("test");
    //const subject = validated.subject || "Please verify your email";
    //const verifyUrl = "http://localhost:3000/{{code}}" //TODO put in env
    //const template = validated.text || `Click this link to verify your email: ${verifyUrl}`;
    //const text = handlebars.compile(template)({code, user})

    //const sendEmailArgs = {
    //  to: user.email,
    //  subject,
    //  text,
    //};
    //const result = await emailProvider.send(sendEmailArgs);
    //console.log("result", result);


    const expiration = validated.expiration ? moment(validated.expiration) : moment().add(1, "minute");
    const svrCreateArgs = {
      ...validated,
      code,
      provider: this._providerType,
      externalId: sendResult.messageId,
      expiration,
    };
    console.log("svrCreateArgs", svrCreateArgs);
    const createdEvr = await super.create(svrCreateArgs);
    console.log("createdEvr", createdEvr);

    return createdEvr;

  }

  async _assertRecentLimit(query, limit) {
    console.log(`${this.constructor.name}._assertRecentLimit()`, {query, limit});
    limit = limit || 2;

    const schema = Joi.object({
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const recentEvrs = await this.find({
      userId: validated.userId,
      createdAt: {
        [Symbol.for("gt")]: moment().subtract(1, "minute")
      }
    })
    console.log("recentEvrs", recentEvrs);
    if (recentEvrs.length > limit) {
      throw new Error("Too many requests.  Please try again later");
    }
  
  }


  async approve(data) {
    console.log(`${this.constructor.name}.approve()`, data);

    const schema = Joi.object({
      code: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    const evrFindArgs = {
      code: validated.code,
      approvedAt: null,
      //createdAt: {
      //  [Symbol.for("lt")]: moment().subtract(5, "minutes")
      //},
      
      //userId: validated.userId,
      //expiration: {
      //  [Symbol.for("gt")]: moment()
      //}
    };
    console.log("evrFindArgs", evrFindArgs);
    const evrs = await this.find(evrFindArgs)
    console.log("evrs", evrs);
    if (evrs.length == 0) {
      throw new Error("Invalid code");
    }
    const activeEvrs = evrs.filter(evr => moment(evr.createdAt) > moment().subtract(1, "minute"))
    //const activeEvrs = evrs.filter(evr => {
    //  console.log("evr.createdAt", evr.createdAt);
    //  const createdAt = moment(evr.createdAt);
    //  console.log({createdAt});
    //  const expiration = moment().subtract(1, "minute");
    //  console.log({createdAt, expiration});
    //  const ret = createdAt > expiration;
    //  console.log({createdAt, expiration, ret});
    //  return ret;
    //})
    console.log("activeEvrs", activeEvrs);
    //if (evr.createdAt > moment.subtract(5, "minutes")) {
    //  throw new Error("Email verification has expired");
    //}
    //const evrs = await smsVerificationRequestController.findOne(svrFindArgs)
    if (activeEvrs.length == 0 && evrs.length > 0) {
      throw new Error("Email verification has expired");
    }
    const evr = activeEvrs[0];
    console.log("evr", evr);

    const updateEvrQuery = {
      id: evr.id
    };
    const updateEvrData = {
      approvedAt: moment(),
    };
    console.log({updateEvrQuery, updateEvrData});
    const updateResult = await this.update(updateEvrQuery, updateEvrData)
    console.log("updateResult", updateResult);
    const updatedEvr = await this.find(updateEvrQuery);
    console.log("updatedEvr", updatedEvr);
    return updatedEvr;

    //const smsVerificationCreateArgs = {
    //  userId: validated.userId,
    //  smsVerificationRequestId: svr.id,
    //};
    //console.log("smsVerificationCreateArgs", smsVerificationCreateArgs);
    //const createdSmsVerification = await this.model.create(smsVerificationCreateArgs);
    //console.log("createdSmsVerification", createdSmsVerification);

    //return createdSmsVerification;
  
  }

}

//module.exports = EmailVerificationRequestController;
export default VerificationRequestController;



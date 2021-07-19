const Joi = require("joi");
const moment = require("moment");

const utils = require("../utils");
const db = require("../models")
//const AbstractController = require("./AbstractController");
import AbstractController from "./AbstractController";
console.log("AbstractController", AbstractController);
import VerificationRequestController from "./VerificationRequestController";
console.log("VerificationRequestController", VerificationRequestController);

console.log("VerificationRequestController", require("./VerificationRequestController"));

import { SmsProviderFactory } from "../SmsProvider";



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


const smsProviderType = "test"; // TODO put it env

//class SmsVerificationRequestController extends AbstractController {
class SmsVerificationRequestController extends VerificationRequestController {

  _getModel() {
    return db.SmsVerificationRequest;
  }

  get _provderType() {
    return smsProviderType;
  }

  async _send(data) {
    console.log(`${this.constructor.name}._send()`, data);

    const schema = Joi.object({
      //userId: Joi.string().required(),
      user: Joi.object().required(),
      code: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const smsProviderFactory = new SmsProviderFactory()
    //const smsProvider = smsProviderFactory.getSmsProvider(smsProviderType);
    const smsProvider = smsProviderFactory.get(smsProviderType);
    console.log("smsProveder", smsProvider);
    const sendSmsArgs = {
      to: validated.user.phoneNumber,
      message: `Your code is ${validated.code}`,
    };
    console.log("sendSmsArgs", sendSmsArgs);
    const result = await smsProvider.send(sendSmsArgs);
    console.log("result", result);

    return result;
  }

  //async create(data) {

  //  const schema = Joi.object({
  //    phoneNumber: Joi.string().required(),
  //    userId: Joi.string().required(),
  //    code: Joi.string(),
  //    expiration: Joi.string(),
  //    loginChallengeId: Joi.string(),
  //  });
  //  const validated = Joi.attempt(data, schema);

  //  
  //  const recentSvrs = await this.find({
  //    userId: validated.userId,
  //    createdAt: {
  //      [Symbol.for("gt")]: moment().subtract(1, "minute")
  //    }
  //  })
  //  console.log("recentSvrs", recentSvrs);
  //  if (recentSvrs.length > 2) {
  //    throw new Error("Too many requests.  Please try again later");
  //  }

  //  const code = validated.code || utils.randomString(6);

  ////  const smsProviderFactory = new SmsProviderFactory()
  ////  //const smsProvider = smsProviderFactory.getSmsProvider(smsProviderType);
  ////  const smsProvider = smsProviderFactory.getSmsProvider("test");
  ////  const sendSmsArgs = {
  ////    phoneNumber: validated.phoneNumber,
  ////    message: `Your code is ${code}`,
  ////  };
  ////  const result = await smsProvider.send(sendSmsArgs);
  ////  console.log("result", result);

  //  const expiration = validated.expiration ? moment(validated.expiration) : moment().add(1, "minute");
  //  const svrCreateArgs = {
  //    ...validated,
  //    code,
  //    provider: smsProviderType,
  //    externalId: result.messageId,
  //    expiration,
  //  };
  //  console.log("svrCreateArgs", svrCreateArgs);
  //  const createdSvr = await this.model.create(svrCreateArgs);
  //  console.log("createdSvr", createdSvr);

  //  return createdSvr;

  //}

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
  //  //const smsVerificationRequestController = new SmsVerificationRequestController();
  //  //const svrs = await smsVerificationRequestController.find(svrFindArgs)
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

}

//module.exports = SmsVerificationRequestController;
export default SmsVerificationRequestController;



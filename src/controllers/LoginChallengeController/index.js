const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const utils = require("../../utils");
const db = require("../../models")

import AbstractController from "../AbstractController";
import LoginController from "../LoginController";
import { LoginChallengeStrategyFactory } from "./strategies";
import HttpError from "../../http-errors";

const { SmsProviderFactory } = require("../../SmsProvider");


const secret = "test";
export const challengeTypes = ["password", "sms", "email", "ipAddress", "device", "accessToken"];

class LoginChallengeController extends AbstractController {

  _getModel() {
    return db.LoginChallenge;
  }

  async createFromArray(data) {
    console.log(`${this.constructor.name}.createFromArray()`, data);

    const schema = Joi.object({
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes)),
      userId: Joi.string().required(),
      loginId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const challengesData = validated.challenges.map((challenge, index) => {
      return {
        userId: validated.userId,
        loginId: validated.loginId,
        type: challenge,
        index,
      };
    })
    const createdChallenges = await super.create(challengesData);
    return createdChallenges;

  }

  /*
   * called from api to complete a challenge
   * returns either next challenge or jwt
   */
  async complete(query, data) {
    console.log(`${this.constructor.name}.complete()`, {query, data});

    const schema = Joi.object({
      query: Joi.object({
        id: Joi.string().required(),
      }),
      data: Joi.object({
        code: Joi.string().required(),
      }),
    });
    const validated = Joi.attempt({query, data}, schema);

    const challenge = await this.findOne({id: validated.query.id});
    console.log("challenge", challenge);
    //const nextChallenge = await this.getNextChallenge({loginId: challenge.loginId});
    //if (challenge.id != nextChallenge.id) {
    //  throw new Error("Challenge out of order");
    //}

    await this._completeChallenge(challenge, validated.data.code);
    //const runResult = this.run({loginId: challenge.loginId})
    const runResult = await this.run({loginId: challenge.loginId})
    console.log("runResult", runResult);

    return runResult;
    //////////////////////////////////////////////
    //const result = await this.completeChallenge(challenge, validated.data.code)

    //if (result == false) {
    //  throw new HttpError({message: "Challenge failed", status: 401});
    //}

    ////const nextChallenge = await this.getNextChallenge({loginId: loginChallenge.loginId})

    //if (!nextChallenge) {
    //  const token = jwt.sign({user: {id: loginChallenge.userId}}, secret, {expiresIn: "1h"})
    //  console.log("token", token);

    //  return {token};
    //}

    //const startResult = await this.startChallenge({challengeId: nextChallenge.id});

    //if (startResult.userInput == false) {
    //  
    //}
    //if (startResult.userInput == true) {
    //  return {nextChallenge};
    //}

    ////if (nextChallenge) {
    ////  return {
    ////    challenge: await this.startChallenge({challengeId: nextChallenge.id})
    ////  };
    ////}
    ////else {
    ////  const token = jwt.sign({user: {id: loginChallenge.userId}}, secret, {expiresIn: "1h"})
    ////  console.log("token", token);

    ////  return {token};
    ////}

  }

  //async runChallengesRecursive() {

  //  const schema = Joi.object({
  //    loginId: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(query, schema);

  //  const nextChallenge = await this.getNextChallenge({loginId: loginChallenge.loginId})

  //  //const nextChallenge = await this.getNextChallenge({loginId: loginChallenge.loginId})

  //  const startResult = await this.startChallenge({challengeId: nextChallenge.id});

  //  if (startResult.userInput == false) {
  //    
  //  }
  //  if (startResult.userInput == true) {
  //    return {nextChallenge};
  //  }

  //  const nextChallenge = await this.getNextChallenge({loginId: loginChallenge.loginId})

  //  return this.runChallengesRecursive()
  //
  //}


  /*
   * iterate through any non user input challenges and return first challenge that requires user input
   */
  async run(data) {
    console.log(`${this.constructor.name}.run()`, data);

    const schema = Joi.object({
      loginId: Joi.string().required(),
      //challengeId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    //const challenge = await this.findOne({id: validated.challengeId});
    //console.log("challenge", challenge);

    const challenges = await this.find({
      loginId: validated.loginId,
      completedAt: null,
    })
    //console.log("challenges", challenges);
    var nextChallenge;
    while (challenges.length > 0) {
      console.log("challenges.length", challenges.length);
      nextChallenge = this._getNextChallenge(challenges);
      console.log("nextChallenge", nextChallenge);
      const startResult = await this._startChallenge(nextChallenge);
      console.log("startResult", startResult);
      if (startResult.userInput == true) {
        console.log("challenge requires user input");
        return {challenge: nextChallenge};
      }
      console.log("challenge does not require user input");

      const completeResult = await this._completeChallenge(nextChallenge);
      console.log("completeResult", completeResult);
      if (completeResult.success != true) {
        // try challenge resolution
        // if ip address / device fails, give user option to add a new authorized one with mobile phone / email
        throw new HttpError({message: `${nextChallenge.type} challenge failed`, status: 401});
      }

      const arrayIndex = _.findIndex(challenges, {id: nextChallenge.id})
      console.log("arrayIndex");
      challenges.splice(arrayIndex, 1);
    }

    // no more challenges
    const loginController = new LoginController();
    return loginController.succeedLogin({loginId: validated.loginId});
    //const token = await utils.signJwtToken({user: {id: nextChallenge.userId}});
    //return {token};
  }

  //async runAndGetNextUserInputChallenge(challenges) {

  //  const nextChallenge = this._getNextChallenge(challenges);
  //  await this.startChallenge(nextChallenge);

  //}

  async getNextChallenge(query) {
    console.log(`${this.constructor.name}.getNextChallenge()`, query);

    const schema = Joi.object({
      loginId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const challenges = await this.find({
      loginId: query.loginId,
      completedAt: null,
    })
    console.log("challenges", challenges);

    return this._getNextChallenge(challenges);

    //const nextIndex = loginChallenge.index + 1;
    //const indices = loginChallenges.map(challenge => challenge.index)
    //const nextIndex = Math.min.apply(null, indices);
    //const nextChallenge = _.find(loginChallenges, {index: nextIndex})
    //console.log("nextChallenge", nextChallenge);

    //return nextChallenge;

  }

  _getNextChallenge(challenges) {
    console.log(`${this.constructor.name}._getNextChallenge()`);

    const indices = challenges.map(challenge => challenge.index)
    const nextIndex = Math.min.apply(null, indices);
    const nextChallenge = _.find(challenges, {index: nextIndex})
    return nextChallenge;

  }

  async startChallenge(data) {
    console.log(`${this.constructor.name}.startChallenge()`, data);

    const schema = Joi.object({
      challengeId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const challenge = await this.findOne({id: validated.challengeId})
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    return this._startChallenge(challenge);

  }

  async _startChallenge(challenge) {

    const loginChallengeStrategyFactory = new LoginChallengeStrategyFactory();
    const challengeStrategy = loginChallengeStrategyFactory.get(challenge.type);
    const result = await challengeStrategy.start(challenge);
    return result;
  
  }

  async completeChallenge(data) {
    console.log(`${this.constructor.name}.completeChallenge()`, data);

    const schema = Joi.object({
      challengeId: Joi.string().required(),
      code: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    const challenge = await this.findOne({id: validated.challengeId})
    return this._completeChallenge(challenge, validated.code);

  }

  async _completeChallenge(challenge, code) {
    console.log(`${this.constructor.name}._completeChallenge()`, {challenge, code});

    const loginChallengeStrategyFactory = new LoginChallengeStrategyFactory();
    const loginChallengeStrategy = loginChallengeStrategyFactory.get(challenge.type)

    const result = await loginChallengeStrategy.complete({
      challenge,
      code,
    })
    this.logger.log({result})

    if (result.success == true) {
      await this._markComplete(challenge.id);
    }

    return result;
  
  }

  async _markComplete(id) {

    return  await this.update({
      id,
    }, {
      completedAt: moment()
    });

  }


}


//class LoginChallengeStrategyFactory {
//  get(type) {
//    switch(type) {
//      case "password":
//        return new PasswordChallengeStrategy();
//      case "sms":
//        return new SmsChallengeStrategy();
//      case "email":
//        return new EmailChallengeStrategy();
//      default:
//        throw new Error("Invalid login challenge strategy type: " + type)
//    }
//
//
//  }
//}
//
//
//class LoginChallengeStrategy {
//
//  async start(challenge) {
//    return challenge;
//  }
//
//  async complete(data) {
//    const schema = Joi.object({
//      challenge: Joi.object(),
//      code: Joi.string(),
//    });
//    return Boolean()
//  }
//}
//
//
//class PasswordChallengeStrategy extends LoginChallengeStrategy {
//
//  async complete(data) {
//    console.log("PasswordChallenge.complete()");
//
//    const schema = Joi.object({
//      challenge: Joi.object(),
//      code: Joi.string(),
//    });
//    const validated = Joi.attempt(data, schema);
//
//    const userId = validated.challenge.userId;
//    
//    const passwordController = new PasswordController();
//    const password = await passwordController.findCurrent({userId: validated.challenge.userId})
//    console.log({password});
//
//    const result = await utils.comparePassword(validated.code, password.hash);
//    //const result = await utils.comparePassword("bad", password.hash);
//    console.log({result})
//
//    return result;
//
//  }
//}
//
//
////const SmsVerificationRequestController = require("./SmsVerificationRequestController");
//import  SmsVerificationRequestController from "./SmsVerificationRequestController";
//class SmsChallengeStrategy extends LoginChallengeStrategy {
//
//  async start(challenge) {
//    console.log("SmsChallengeStrategy.start()");
//
//    const userController = new UserController();
//    const user = await userController.findOne({id: challenge.userId});
//    console.log("user", user);
//
//    const svrCreateArgs = {
//      userId: challenge.userId,
//      //code: Joi.string(),
//
//      //to: user.phoneNumber,
//      //userId: user.id,
//      //loginChallengeId: challenge.id,
//    };
//    console.log("svrCreateArgs", svrCreateArgs);
//    const smsVerificationRequestController = new SmsVerificationRequestController();
//    const createdSvr = await smsVerificationRequestController.create(svrCreateArgs);
//    console.log("createdSvr", createdSvr);
//
//    const loginChallengeController = new LoginChallengeController();
//    const updateResult = await loginChallengeController.update({id: challenge.id}, {smsVerificationRequestId: createdSvr.id});
//    console.log("updateResult", updateResult);
//
//    return challenge;
//
//  }
//
//  async complete(data) {
//    console.log("SmsChallengeStrategy.complete()", data);
//
//    const schema = Joi.object({
//      challenge: Joi.object(),
//      code: Joi.string(),
//    });
//    const validated = Joi.attempt(data, schema);
//
//    const smsVerificationRequestController = new SmsVerificationRequestController();
//    const svr = await smsVerificationRequestController.findOne({id: validated.challenge.smsVerificationRequestId});
//    console.log("svr", svr);
//
//    console.log(validated.code, svr.code);
//    return validated.code == svr.code;
//  
//  }
//}
//
//class EmailChallengeStrategy extends LoginChallengeStrategy {
//  async start() {
//  
//  }
//
//  async complete() {
//  
//  }
//}


//module.exports = LoginChallengeController;
export default LoginChallengeController;


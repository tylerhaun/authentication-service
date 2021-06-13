const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const utils = require("../utils");
const db = require("../models")
const AbstractController = require("./AbstractController");

const UserController = require("./UserController");
const PasswordController = require("./PasswordController");

const { SmsProviderFactory } = require("../SmsProvider");


const secret = "test";

class LoginChallengeController extends AbstractController {

  _getModel() {
    return db.LoginChallenge;
  }

  async complete(query, data) {

    console.log("LoginChallengeController.complete()", query, data);
    const loginChallenge = await this.model.findOne({where: {id: query.id}});
    console.log("loginChallege", loginChallenge);
    if (!loginChallenge) {
      throw new Error("No login challenge found");
    }

    const userId = loginChallenge.userId;

    const result = await this.completeChallenge(loginChallenge, data.code)
    //const loginChallengeStrategyFactory = new LoginChallengeStrategyFactory();
    //const loginChallengeStrategy = loginChallengeStrategyFactory.get(loginChallenge.type)

    //const result = await loginChallengeStrategy.complete({challenge: _.pick(loginChallenge, ["id", "userId"]), code: data.code})
    //console.log("result", result);

    if (result == false) {
      throw new Error("Challenge failed");
    }

    const loginChallenges = await this.find({
      userId,
      loginId: loginChallenge.loginId,
    })
    console.log("loginChallenges", loginChallenges);

    const nextIndex = loginChallenge.index + 1;
    const nextChallenge = _.find(loginChallenges, {index: nextIndex})
    console.log("nextChallenge", nextChallenge);

    if (nextChallenge) {
      return {
        challenge: await this.startChallenge(nextChallenge)
      };
      //const nextChallengeStrategy = loginChallengeStrategyFactory.get(nextChallenge.type);
      //await nextChallengeStrategy.start();
      //return nextChallenge;
    }

    const token = jwt.sign({user: {id: userId}}, secret, {expiresIn: "1h"})
    console.log("token", token);

    return {token};

  }

  async startChallenge(challenge) {

    const loginChallengeStrategyFactory = new LoginChallengeStrategyFactory();
    const challengeStrategy = loginChallengeStrategyFactory.get(challenge.type);
    const result = await challengeStrategy.start(challenge);
    return result;

  }

  async completeChallenge(challenge, code) {

    const loginChallengeStrategyFactory = new LoginChallengeStrategyFactory();
    const loginChallengeStrategy = loginChallengeStrategyFactory.get(challenge.type)

    const result = await loginChallengeStrategy.complete({
      challenge,
      code,
    })
    return result;

  }


}


class LoginChallengeStrategyFactory {
  get(type) {
    switch(type) {
      case "password":
        return new PasswordChallengeStrategy();
      case "sms":
        return new SmsChallengeStrategy();
      case "email":
        return new EmailChallengeStrategy();
      default:
        throw new Error("Invalid login challenge strategy type: " + type)
    }


  }
}


class LoginChallengeStrategy {

  async start(challenge) {
    return challenge;
  }

  async complete(data) {
    const schema = Joi.object({
      challenge: Joi.object(),
      code: Joi.string(),
    });
    return Boolean()
  }
}


class PasswordChallengeStrategy extends LoginChallengeStrategy {

  async complete(data) {
    console.log("PasswordChallenge.complete()");

    const schema = Joi.object({
      challenge: Joi.object(),
      code: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    const userId = validated.challenge.userId;
    
    const passwordController = new PasswordController();
    const password = await passwordController.findCurrent({userId: validated.challenge.userId})
    console.log({password});

    const result = await utils.comparePassword(validated.code, password.hash);
    //const result = await utils.comparePassword("bad", password.hash);
    console.log({result})

    return result;

  }
}


const SmsVerificationRequestController = require("./SmsVerificationRequestController");
class SmsChallengeStrategy extends LoginChallengeStrategy {

  async start(challenge) {
    console.log("SmsChallengeStrategy.start()");

    const userController = new UserController();
    const user = await userController.model.findOne({where: {id: challenge.userId}});
    console.log("user", user);

    const svrCreateArgs = {
      phoneNumber: user.phoneNumber,
      userId: user.id,
      loginChallengeId: challenge.id,
    };
    console.log("svrCreateArgs", svrCreateArgs);
    const smsVerificationRequestController = new SmsVerificationRequestController();
    const createdSvr = await smsVerificationRequestController.create(svrCreateArgs);
    console.log("createdSvr", createdSvr);
    return challenge;

  }

  async complete(data) {
    console.log("SmsChallengeStrategy.complete()");

    const schema = Joi.object({
      challenge: Joi.object(),
      code: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    const smsVerificationRequestController = new SmsVerificationRequestController();
    const svr = await smsVerificationRequestController.model.findOne({where: {loginChallengeId: validated.challenge.id}});
    console.log("svr", svr);

    console.log(validated.code, svr.code);
    return validated.code == svr.code;
  
  }
}
class EmailChallengeStrategy extends LoginChallengeStrategy {
  async start() {
  
  }

  async complete() {
  
  }
}




module.exports = LoginChallengeController;


const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const utils = require("../utils");
const db = require("../models")

//const AbstractController = require("./AbstractController");
import AbstractController from "./AbstractController";

//const UserController = require("./UserController");
//const PasswordController = require("./PasswordController");
import UserController from "./UserController";
import PasswordController from "./PasswordController";

const { SmsProviderFactory } = require("../SmsProvider");


const secret = "test";
export const challengeTypes = ["password", "sms", "email"];

class LoginChallengeController extends AbstractController {

  _getModel() {
    return db.LoginChallenge;
  }

  async createFromArray(data) {

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

  async complete(query, data) {
    console.log("LoginChallengeController.complete()", query, data);
    const schema = Joi.object({
      query: Joi.object({
        id: Joi.string().required(),
      }),
      data: Joi.object({
        code: Joi.string().required(),
      }),
    });
    const validated = Joi.attempt({query, data}, schema);

    const loginChallenge = await this.model.findOne({where: {id: validated.query.id}});
    console.log("loginChallege", loginChallenge);
    if (!loginChallenge) {
      throw new Error("No login challenge found");
    }

    const result = await this.completeChallenge(loginChallenge, validated.data.code)
    //const loginChallengeStrategyFactory = new LoginChallengeStrategyFactory();
    //const loginChallengeStrategy = loginChallengeStrategyFactory.get(loginChallenge.type)

    //const result = await loginChallengeStrategy.complete({challenge: _.pick(loginChallenge, ["id", "userId"]), code: data.code})
    //console.log("result", result);

    if (result == false) {
      throw new Error("Challenge failed");
    }

    const loginChallenges = await this.find({
      userId: loginChallenge.userId,
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
    else {
      const token = jwt.sign({user: {id: loginChallenge.userId}}, secret, {expiresIn: "1h"})
      console.log("token", token);

      return {token};
    }

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


//const SmsVerificationRequestController = require("./SmsVerificationRequestController");
import  SmsVerificationRequestController from "./SmsVerificationRequestController";
class SmsChallengeStrategy extends LoginChallengeStrategy {

  async start(challenge) {
    console.log("SmsChallengeStrategy.start()");

    const userController = new UserController();
    const user = await userController.findOne({id: challenge.userId});
    console.log("user", user);

    const svrCreateArgs = {
      userId: challenge.userId,
      //code: Joi.string(),

      //to: user.phoneNumber,
      //userId: user.id,
      //loginChallengeId: challenge.id,
    };
    console.log("svrCreateArgs", svrCreateArgs);
    const smsVerificationRequestController = new SmsVerificationRequestController();
    const createdSvr = await smsVerificationRequestController.create(svrCreateArgs);
    console.log("createdSvr", createdSvr);

    const loginChallengeController = new LoginChallengeController();
    const updateResult = await loginChallengeController.update({id: challenge.id}, {smsVerificationRequestId: createdSvr.id});
    console.log("updateResult", updateResult);

    return challenge;

  }

  async complete(data) {
    console.log("SmsChallengeStrategy.complete()", data);

    const schema = Joi.object({
      challenge: Joi.object(),
      code: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    const smsVerificationRequestController = new SmsVerificationRequestController();
    const svr = await smsVerificationRequestController.findOne({id: validated.challenge.smsVerificationRequestId});
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




//module.exports = LoginChallengeController;
export default LoginChallengeController;


const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const utils = require("../utils");
const db = require("../models")

import AbstractController from "./AbstractController";
import AccessTokenController from "./AccessTokenController";
import UserController from "./UserController";
import PasswordController from "./PasswordController";
import {default as LoginChallengeController, challengeTypes}  from "./LoginChallengeController";
import HttpError from "../http-errors";

const { SmsProviderFactory } = require("../SmsProvider");

console.log("challengeTypes", challengeTypes);


class LoginController extends AbstractController {

  _getModel() {
    return db.Login;
  }

  async create(data) {
    console.log(`${this.constructor.name}.create()`, data);

    const schema = Joi.object({
      username: Joi.string().required(),
      //accessToken: Joi.string(),
      ipAddress: Joi.string().required(),
      userAgent: Joi.string().required(),
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes)).default(["password"]),
    });
    const validated = Joi.attempt(data, schema);
    console.log("validated", validated);


    validated.challenges.push("ipAddress");
    validated.challenges.push("device");


    const userController = new UserController();
    const user = await userController.model.findOne({
      where: {
        username: validated.username,
      }
    })
    console.log("user", user);
    if (!user) {
      throw new HttpError({message: "User does not exist", status: 400});
    }
    if (process.env.REQUIRE_EMAIL_VERIFIED_ON_LOGIN) {
      if (user.emailVerified != true) {
        throw new HttpError({message: "Email is not verified", status: 400});
      }
    }

    const createLoginArgs = {
      userId: user.id,
      ipAddress: validated.ipAddress,
      userAgent: validated.userAgent,
    };
    console.log("createLoginArgs", createLoginArgs);
    const createdLogin = await super.create(createLoginArgs);

    //if (validated.accessToken) {
    //  const accessTokenController = new AccessTokenController();
    //  const result = await accessTokenController.redeem({userId: user.id, code: validated.accessToken})
    //  const token = await utils.signJwtToken({user: {id: user.id}});
    //  return {token};
    //}


    const loginChallengeController = new LoginChallengeController();

    const createChallengesArgs = {
      challenges: validated.challenges,
      userId: user.id,
      loginId: createdLogin.id,
    };
    const createdChallenges = await loginChallengeController.createFromArray(createChallengesArgs)
    console.log("createdChallenges", createdChallenges);
    //const nextChallenge = createdChallenges[0];
    //console.log("nextChallenge", nextChallenge);
    //await loginChallengeController.startChallenge({challengeId: nextChallenge.id});
    //const nextChallenge = await loginChallengeController.run({challengeId: createdChallenges[0].id});
    const runResult = await loginChallengeController.run({loginId: createdLogin.id});

    return runResult;

  }


  async loginWithPassword(data) {
    console.log(`${this.constructor.name}.loginWithPassword()`, data);

    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      ipAddress: Joi.string(),
      device: Joi.string(),
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes)).default(["password"]),
    });
    const validated = Joi.attempt(data, schema);
    console.log("validated", validated);
  
    const loginResult = await this.create({
      username: validated.username,
      ipAddress: validated.ipAddress,
      userAgent: validated.userAgent,
      challenges: ["password"],
    })
    console.log("loginResult", loginResult);

    const challenge = loginResult.challenge;
    const loginChallengeController = new LoginChallengeController();
    const challengeResult = await loginChallengeController.completeChallenge({challengeId: challenge.id, code: validated.password});

    console.log("challengeResult", challengeResult);
    return challengeResult;

  }

  async loginWithAccessToken(data) {
    //console.log(`${this.constructor.name}.loginWithPassword()`, data);
    logger.log({method: "loginWithAccessToken", data})

    const schema = Joi.object({
      username: Joi.string().required(),
      accessToken: Joi.string().required(),
      ipAddress: Joi.string(),
      userAgent: Joi.string(),
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes)).default(["password"]),
    });
    const validated = Joi.attempt(data, schema);
    console.log("validated", validated);
  
    const loginResult = await this.create({
      username: validated.username,
      ipAddress: validated.ipAddress,
      userAgent: validated.userAgent,
      challenges: ["accessToken"],
    })
    console.log("loginResult", loginResult);

    const challenge = loginResult.challenge;
    const loginChallengeController = new LoginChallengeController();
    const challengeResult = await loginChallengeController.completeChallenge({challengeId: challenge.id, code: validated.accessToken});

    //const runResult = await loginChallengeController.run({loginId: createdLogin.id});

    console.log("challenegResult", challengeResult);
    return challengeResult;

  }
  
  
  async succeedLogin(query) {
    this.logger.log({method: "succeedLogin", query})

    const schema = Joi.object({
      loginId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const loginChallengeController = new LoginChallengeController();
    const loginChallenges = await loginChallengeController.find({loginId: validated.loginId})
    loginChallenges.forEach(lc => {
      if(lc.completedAt == null) {
        throw new HttpError({message: `challenge ${lc.id} has not been completed yet`, status: 401});
      }
    })

    const updateResult = await this.update({id: validated.loginId}, {succeededAt: moment()})

    const updatedLogin = await this.findOne({id: validated.loginId});

    const token = await utils.signJwtToken({user: {id: updatedLogin.userId}});
    return {token};
  
  }


  //async checkIpAddress(data) {
  //  console.log(`${this.constructor.name}.checkIpAddress()`, data);
  //  const schema = Joi.object({
  //    username: Joi.string().required(),
  //    password: Joi.string().required(),
  //    ipAddress: Joi.string(),
  //    device: Joi.string(),
  //    challenges: Joi.array().items(Joi.string().valid(...challengeTypes)).default(["password"]),
  //  });
  //  const validated = Joi.attempt(data, schema);
  //  console.log("validated", validated);

  //  // TODO
  //  // check if ip address is in list of valid login ip addresses
  //  // need to create table for whitelisted login ip addresses
  //  // create row when user is created.
  //  // If a login doesn't match, prompt 2fa (sms, email) to whitelist the current ip address
  //  
  //}



}

//module.exports = LoginController;
export default LoginController;




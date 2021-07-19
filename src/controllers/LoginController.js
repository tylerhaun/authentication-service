const Joi = require("joi");
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
//const logger = require("../Logger").child({class: "LoginController"});


class LoginController extends AbstractController {

  _getModel() {
    return db.Login;
  }

  async create(data) {
    this.logger.log({method: "create", data})

    const schema = Joi.object({
      username: Joi.string().required(),
      ipAddress: Joi.string().required(),
      userAgent: Joi.string().required(),
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes)).default(["password"]),
    });
    const validated = Joi.attempt(data, schema);
    this.logger.log({validated});

    validated.challenges.push("ipAddress");
    validated.challenges.push("device");


    const userController = new UserController();
    const user = await userController.model.findOne({
      where: {
        username: validated.username,
      }
    })
    this.logger.log({user});
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
    this.logger.log({createLoginArgs});
    const createdLogin = await super.create(createLoginArgs);

    const loginChallengeController = new LoginChallengeController();

    const createChallengesArgs = {
      challenges: validated.challenges,
      userId: user.id,
      loginId: createdLogin.id,
    };
    const createdChallenges = await loginChallengeController.createFromArray(createChallengesArgs)
    this.logger.log({createdChallenges});
    const runResult = await loginChallengeController.run({loginId: createdLogin.id});

    return runResult;

  }


  async loginWithPassword(data) {
    this.logger.log({method: "loginWithPassword", data})

    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      ipAddress: Joi.string(),
      userAgent: Joi.string(),
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes)).default(["password"]),
    });
    const validated = Joi.attempt(data, schema);
  
    const loginResult = await this.create({
      username: validated.username,
      ipAddress: validated.ipAddress,
      userAgent: validated.userAgent,
      challenges: ["password"],
    })
    this.logger.log({loginResult});

    const challenge = loginResult.challenge;
    const loginChallengeController = new LoginChallengeController();
    const challengeResult = await loginChallengeController.completeChallenge({challengeId: challenge.id, code: validated.password});

    this.logger.log({challengeResult});
    return challengeResult;

  }

  async loginWithAccessToken(data) {
    this.logger.log({method: "loginWithAccessToken", data})

    const schema = Joi.object({
      username: Joi.string().required(),
      accessToken: Joi.string().required(),
      ipAddress: Joi.string(),
      userAgent: Joi.string(),
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes)).default(["password"]),
    });
    const validated = Joi.attempt(data, schema);
  
    const loginResult = await this.create({
      username: validated.username,
      ipAddress: validated.ipAddress,
      userAgent: validated.userAgent,
      challenges: ["accessToken"],
    })
    this.logger.log({loginResult});

    const challenge = loginResult.challenge;
    const loginChallengeController = new LoginChallengeController();
    const challengeResult = await loginChallengeController.completeChallenge({challengeId: challenge.id, code: validated.accessToken});

    this.logger.log({challengeResult});
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


}


export default LoginController;


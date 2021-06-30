const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const utils = require("../utils");
const db = require("../models")

//const AbstractController = require("./AbstractController");
import AbstractController from "./AbstractController";

//const UserController = require("./UserController");
//const PasswordController = require("./PasswordController");
//const LoginChallengeController = require("./LoginChallengeController");
import UserController from "./UserController";
import PasswordController from "./PasswordController";
import {default as LoginChallengeController, challengeTypes}  from "./LoginChallengeController";

const { SmsProviderFactory } = require("../SmsProvider");

console.log("challengeTypes", challengeTypes);

const secret = "test";

class LoginController extends AbstractController {

  _getModel() {
    return db.Login;
  }

  async create(data) {
    console.log(`${this.constructor.name}.create()`, data);

    const schema = Joi.object({
      username: Joi.string().required(),
      ipAddress: Joi.string(),
      device: Joi.string(),
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes)).default(["password"]),
    });
    const validated = Joi.attempt(data, schema);
    console.log("validated", validated);


    const userController = new UserController();
    const user = await userController.model.findOne({
      where: {
        username: validated.username,
      }
    })
    console.log("user", user);
    if (!user) {
      throw new Error("User does not exist");
    }

    const createLoginArgs = {
      userId: user.id,
      ipAddress: validated.ipAddress,
      device: validated.device,
    };
    console.log("createLoginArgs", createLoginArgs);
    const createdLogin = await super.create(createLoginArgs);


    const loginChallengeController = new LoginChallengeController();
    //const challengesData = validated.challenges.map((challenge, index) => {
    //  return {
    //    userId: user.id,
    //    loginId: createdLogin.id,
    //    type: challenge,
    //    index,
    //  };
    //})
    //console.log("challengesData", challengesData);
    //const createdChallenges = await loginChallengeController.model.bulkCreate(challengesData);
    //console.log("createdChallenges", createdChallenges);

    const createChallengesArgs = {
      challenges: validated.challenges,
      userId: user.id,
      loginId: createdLogin.id,
    };
    const createdChallenges = await loginChallengeController.createFromArray(createChallengesArgs)
    console.log("createdChallenges", createdChallenges);
    const nextChallenge = createdChallenges[0];
    console.log("nextChallenge", nextChallenge);
    //await nextChallenge.start();

    return {challenge: nextChallenge};

  }


  //async create(data) {
  //  console.log("LogincController.create()", data); // TODO DELETE

  //  //return this.create2(data);

  //  const schema = Joi.object({
  //    username: Joi.string().required(),
  //    //password: Joi.string().required(),
  //    ipAddress: Joi.string(),
  //    device: Joi.string(),
  //    challenges: Joi.array().items(Joi.string().valid(...challengeTypes))
  //  });
  //  const validated = Joi.attempt(data, schema);

  //  const userController = new UserController();
  //  const user = await userController.model.findOne({
  //    where: {
  //      username: validated.username,
  //    }
  //  })
  //  console.log("user", user);
  //  if (!user) {
  //    throw new Error("User does not exist");
  //  }

  //  const passwordController = new PasswordController();
  //  const password = await passwordController.model.findOne({
  //    where: {
  //      userId: user.id,
  //    }
  //  });
  //  console.log("password", password);

  //  const result = await utils.comparePassword(validated.password, password.hash);
  //  console.log("compare result", result);

  //  const success = Boolean(result);

  //  const createLoginArgs = {
  //    userId: validated.userId,
  //    success,
  //    ipAddress: validated.ipAddress,
  //    device: validated.device,
  //  };
  //  console.log("createLoginArgs", createLoginArgs);
  //  const createdLogin = await this.model.create(createLoginArgs);

  //  if (!success) {
  //    throw new Error("Unsuccessful login"); // TODO better error messages
  //  }

  //  // return a login challenge

  //  var token = jwt.sign({userId: validated.userId}, secret, {expiresIn: "1h"})
  //  //var result = jwt.verify(token, secret);

  //  return token;

  //}


  async loginWithPassword(data) {

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
      device: validated.device,
      challenges: ["password"],
    })
    console.log("loginResult", loginResult);

    const challenge = loginResult.challenge;
    const loginChallengeController = new LoginChallengeController();
    const challengeResult = loginChallengeController.complete({challenge, code: validated.password});

    console.log("challengeResult", challengeResult);
    return challengeResult;

  }


  async checkIpAddress(data) {
    console.log("checkIpAddress()");
    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      ipAddress: Joi.string(),
      device: Joi.string(),
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes)).default(["password"]),
    });
    const validated = Joi.attempt(data, schema);
    console.log("validated", validated);

    // TODO
    // check if ip address is in list of valid login ip addresses
    // need to create table for whitelisted login ip addresses
    // create row when user is created.
    // If a login doesn't match, prompt 2fa (sms, email) to whitelist the current ip address
    
  }


  //async signToken(data) {

  //  const schema = Joi.object({
  //    data: Joi.object().defaut({}),
  //    options: Joi.object().default({}),
  //  });
  //  const validated = Joi.attempt(data, schema);

  //  var token = jwt.sign(validated.data, secret, validated.options)
  //  var token = jwt.sign({userId: validated.userId}, secret, {expiresIn: "1h"})
  //  return token;
  //
  //}

  //async verify(data) {

  //  const schema = Joi.object({
  //    token: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(data, schema);
  //
  //  var result = jwt.verify(validated.token, secret);
  //  return result;
  //
  //}


  async login2() {
    //for (challenge in args.challenges) 
    //  challengeController.create(challenge)
    //return challenges[0] ie. "password"
    //
    //*frontend displays password form*
    //
    //challengeController.complete({challengeId}, {password})
    //perform logic...
    //challenge.update(id, {complete: true})
    //return next challenge
    //
    //sms example
    //post login(challengeType: "sms")
    //return smsChallenge
    //*frontend displays sms form,user enters code*
    //challengeController.complete({id}, {code})
  }


}

//module.exports = LoginController;
export default LoginController;




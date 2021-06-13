const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const utils = require("../utils");
const db = require("../models")
const AbstractController = require("./AbstractController");

const UserController = require("./UserController");
const PasswordController = require("./PasswordController");
const LoginChallengeController = require("./LoginChallengeController");

const { SmsProviderFactory } = require("../SmsProvider");


const secret = "test";
const challengeTypes = ["password", "sms", "email"];

class LoginController extends AbstractController {

  _getModel() {
    return db.Login;
  }

  async create2(data) {
    console.log("create2()", data);
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
      userId: validated.userId,
      ipAddress: validated.ipAddress,
      device: validated.device,
    };
    console.log("createLoginArgs", createLoginArgs);
    const createdLogin = await this.model.create(createLoginArgs);


    const loginChallengeController = new LoginChallengeController();
    const challengesData = validated.challenges.map((challenge, index) => {
      return {
        userId: user.id,
        loginId: createdLogin.id,
        type: challenge,
        index,
      };
    })
    console.log("challengesData", challengesData);
    const createdChallenges = await loginChallengeController.model.bulkCreate(challengesData);
    console.log("createdChallenges", createdChallenges);

    const nextChallenge = createdChallenges[0];
    //await nextChallenge.start();

    return {challenge: nextChallenge};

  }


  async create(data) {
    console.log("LogincController.create()", data); // TODO DELETE

    return this.create2(data);

    const schema = Joi.object({
      username: Joi.string().required(),
      //password: Joi.string().required(),
      ipAddress: Joi.string(),
      device: Joi.string(),
      challenges: Joi.array().items(Joi.string().valid(...challengeTypes))
    });
    const validated = Joi.attempt(data, schema);

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

    const passwordController = new PasswordController();
    const password = await passwordController.model.findOne({
      where: {
        userId: user.id,
      }
    });
    console.log("password", password);

    const result = await utils.comparePassword(validated.password, password.hash);
    console.log("compare result", result);

    const success = Boolean(result);

    const createLoginArgs = {
      userId: validated.userId,
      success,
      ipAddress: validated.ipAddress,
      device: validated.device,
    };
    console.log("createLoginArgs", createLoginArgs);
    const createdLogin = await this.model.create(createLoginArgs);

    if (!success) {
      throw new Error("Unsuccessful login"); // TODO better error messages
    }

    // return a login challenge

    var token = jwt.sign({userId: validated.userId}, secret, {expiresIn: "1h"})
    //var result = jwt.verify(token, secret);

    return token;

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

module.exports = LoginController;




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
    this.logger.log({method: "createFromArray", data})

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
    this.logger.log({method: "complete", query, data});

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
    this.logger.log({challenge});

    await this._completeChallenge(challenge, validated.data.code);
    const runResult = await this.run({loginId: challenge.loginId})
    this.logger.log({runResult});

    return runResult;

  }

  /*
   * iterate through any non user input challenges and return first challenge that requires user input
   */
  async run(data) {
    this.logger.log({method: "run", data});

    const schema = Joi.object({
      loginId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const challenges = await this.find({
      loginId: validated.loginId,
      completedAt: null,
    })
    var nextChallenge;
    while (challenges.length > 0) {
      this.logger.log({"challenges.length": challenges.length});
      nextChallenge = this._getNextChallenge(challenges);
      this.logger.log({nextChallenge});
      const startResult = await this._startChallenge(nextChallenge);
      this.logger.log({startResult});
      if (startResult.userInput == true) {
        this.logger.log({message: "challenge requires user input"});
        return {challenge: nextChallenge};
      }
      this.logger.log({message: "challenge does not require user input"});

      const completeResult = await this._completeChallenge(nextChallenge);
      this.logger.log({completeResult});
      if (completeResult.success != true) {
        // try challenge resolution
        // if ip address / device fails, give user option to add a new authorized one with mobile phone / email
        throw new HttpError({message: `${nextChallenge.type} challenge failed`, status: 401});
      }

      const arrayIndex = _.findIndex(challenges, {id: nextChallenge.id})
      this.logger.log({arrayIndex});
      challenges.splice(arrayIndex, 1);
    }

    // no more challenges
    const loginController = new LoginController();
    return loginController.succeedLogin({loginId: validated.loginId});

  }

  async getNextChallenge(query) {
    this.logger.log({method: "getNextChallenge", query});

    const schema = Joi.object({
      loginId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const challenges = await this.find({
      loginId: query.loginId,
      completedAt: null,
    })
    this.logger.log({challenges});

    return this._getNextChallenge(challenges);

  }

  _getNextChallenge(challenges) {
    this.logger.log({method: "_getNextChallenge"});

    const indices = challenges.map(challenge => challenge.index)
    const nextIndex = Math.min.apply(null, indices);
    const nextChallenge = _.find(challenges, {index: nextIndex})
    return nextChallenge;

  }

  async startChallenge(data) {
    this.logger.log({method: "startChallenge", data});

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
    this.logger.log({method: "_startChallenge"});

    const loginChallengeStrategyFactory = new LoginChallengeStrategyFactory();
    const challengeStrategy = loginChallengeStrategyFactory.get(challenge.type);
    const result = await challengeStrategy.start(challenge);
    return result;
  
  }

  async completeChallenge(data) {
    this.logger.log({method: "completeChallenge", data});

    const schema = Joi.object({
      challengeId: Joi.string().required(),
      code: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    const challenge = await this.findOne({id: validated.challengeId})
    return this._completeChallenge(challenge, validated.code);

  }

  async _completeChallenge(challenge, code) {
    this.logger.log({method: "_completeChallenge", challenge, code})

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
    this.logger.log({method: "_markComplete"});

    return await this.update({
      id,
    }, {
      completedAt: moment()
    });

  }


}


export default LoginChallengeController;


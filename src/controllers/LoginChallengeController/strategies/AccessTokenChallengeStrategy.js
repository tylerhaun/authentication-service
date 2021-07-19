import { LoginChallengeStrategy } from "./LoginChallengeStrategy"
import AccessTokenController from "../../AccessTokenController";

const Joi = require("joi");
const utils = require("../../../utils");


export default class AccessTokenChallengeStrategy extends LoginChallengeStrategy {

  async start(challenge) {
    console.log(`${this.constructor.name}.start()`, challenge);
    return {userInput: true, challenge};
  }

  async complete(data) {
    console.log(`${this.constructor.name}.complete()`, data);

    const schema = Joi.object({
      challenge: Joi.object(),
      code: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const userId = validated.challenge.userId;

    const accessTokenController = new AccessTokenController();
    //const accessTokenQuery = {
    //  userId,
    //  code: validated.code,
    //};
    //console.log("accesTokenQuery", accessTokenQuery);
    //const accessToken = await accessTokenController.findOne(accessTokenQuery);
    //console.log("accessToken", accessToken);
    const result = await accessTokenController.redeem({userId, code: validated.code});

    console.log({result})
    const success = !!result;
    return {success};

  }
}



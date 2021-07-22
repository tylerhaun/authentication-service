import { LoginChallengeStrategy } from "./LoginChallengeStrategy"
import AccessTokenController from "../../AccessTokenController";
import LoginChallengeController from "../../LoginChallengeController";

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
    const accessToken = await accessTokenController.redeem({userId, code: validated.code});
    console.log({accessToken})

    const loginChallengeController = new LoginChallengeController();
    const updateResult = await loginChallengeController.update({id: validated.challenge.id}, {accessTokenId: accessToken.id});
    console.log({updateResult});

    const success = !!accessToken;
    return {success};

  }
}



import { LoginChallengeStrategy } from "./LoginChallengeStrategy"
import PasswordController from "../../PasswordController";

const Joi = require("joi");
const utils = require("../../../utils");


export default class PasswordChallengeStrategy extends LoginChallengeStrategy {

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

    const passwordController = new PasswordController();
    const password = await passwordController.findCurrent({userId: validated.challenge.userId})
    console.log({password});

    const result = await utils.comparePassword(validated.code, password.hash);
    //const result = await utils.comparePassword("bad", password.hash);
    console.log({result})

    return result;

  }
}



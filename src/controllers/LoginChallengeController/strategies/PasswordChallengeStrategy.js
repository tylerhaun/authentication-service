import { LoginChallengeStrategy } from "./LoginChallengeStrategy"
import PasswordController from "../../PasswordController";
import LoginChallengeController from "../../LoginChallengeController";

const Joi = require("joi");
const utils = require("../../../utils");


export default class PasswordChallengeStrategy extends LoginChallengeStrategy {

  async start(challenge) {
    console.log(`${this.constructor.name}.start()`, challenge);

    const passwordController = new PasswordController();
    const password = await passwordController.findCurrent({userId: challenge.userId})
    console.log({password});

    const loginChallengeController = new LoginChallengeController();
    const updateResult = await loginChallengeController.update({id: challenge.id}, {passwordId: password.id});
    console.log({updateResult});

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
    const password = await passwordController.findOne({id: validated.challenge.passwordId})
    //const password = await passwordController.findCurrent({userId: validated.challenge.userId})
    console.log({password});

    const result = await utils.comparePassword(validated.code, password.hash);
    //const result = await utils.comparePassword("bad", password.hash);
    console.log({result})

    //const loginChallengeController = new LoginChallengeController();
    //const updateResult = await loginChallengeController.update({id: validated.challenge.id}, {passwordId: password.id});
    //console.log({updateResult});

    const success = result;
    return {success};

  }
}



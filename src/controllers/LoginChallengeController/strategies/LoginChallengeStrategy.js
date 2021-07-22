const logger = require("../../../Logger");

export class LoginChallengeStrategy {

  constructor() {
    this.logger = logger.child({class: this.constructor.name})
  }

  async start(challenge) {
    return {userInput: true, challenge};
  }

  async complete(data) {
    const schema = Joi.object({
      challenge: Joi.object(),
      code: Joi.string(),
    });
    return {success: Boolean(), challenge: {}};
  }

  async resolve() {
    return {challenge};
  }

}


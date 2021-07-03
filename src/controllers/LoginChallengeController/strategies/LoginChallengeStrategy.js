export class LoginChallengeStrategy {

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


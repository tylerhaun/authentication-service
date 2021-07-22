import { LoginChallengeStrategy } from "./LoginChallengeStrategy"
import TotpController from "../../TotpController";
import LoginChallengeController from "../../LoginChallengeController";

const speakeasy = require("speakeasy");
const QRCode = require('qrcode')
const Joi = require("joi");
const utils = require("../../../utils");


export default class ThirdPartyAuthenticatorChallengeStrategy extends LoginChallengeStrategy {

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
    console.log("validated", validated);

    const totpController = new TotpController();
    const totp = await totpController.findOne({
      userId: validated.challenge.userId,
      verifiedAt: {
        [Symbol.for("ne")]: null
      }
    });
    console.log("totp", totp);
    //const result = speakeasy.totp.verify({secret: secret.base32, encoding: "base32", token: "123456"})
    const result = speakeasy.totp.verify({secret: totp.code, token: validated.code})
    console.log("result", result);

    const loginChallengeController = new LoginChallengeController();
    const updateResult = await loginChallengeController.update({id: validated.challenge.id}, {totpId: totp.id});
    console.log({updateResult});

    const success = result;
    return {success};

  }
}



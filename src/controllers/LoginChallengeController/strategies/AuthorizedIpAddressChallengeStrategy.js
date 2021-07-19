import { LoginChallengeStrategy } from "./LoginChallengeStrategy"
import AuthorizedIpAddressController from "../../AuthorizedIpAddressController";
import LoginController from "../../LoginController";

const Joi = require("joi");
const _ = require("lodash");


export default class AuthorizedIpAddressChallengeStrategy extends LoginChallengeStrategy {

  async start(challenge) {
    console.log(`${this.constructor.name}.start()`, challenge);
    return {userInput: false, challenge};
  }

  async complete(data) {
    console.log(`${this.constructor.name}.complete()`, data);

    const schema = Joi.object({
      challenge: Joi.object().required(),
      code: Joi.string(), // not needed but causes error without it
    });
    const validated = Joi.attempt(data, schema);

    const challenge = validated.challenge;

    const authorizedIpAddressController = new AuthorizedIpAddressController();
    const ipAddresses = await authorizedIpAddressController.find({userId: challenge.userId});
    console.log("ipAddresses", ipAddresses);
    if (ipAddresses.length == 0) {
      // none set up.  Need to figure out how to handle this
      throw new Error("User has no authorized ip addresses");
    }

    const loginController = new LoginController();
    const login = await loginController.findOne({id: challenge.loginId});
    console.log("login", login);
    if (!login.ipAddress) {
      throw new Error("Ip address not stored on login");
    }

    const currentAuthorizedIpAddress = _.find(ipAddresses, {ipAddress: login.ipAddress});
    console.log("currentAuthorizedIpAddress", currentAuthorizedIpAddress);

    const success = !!currentAuthorizedIpAddress;

    return {success};

  }
}


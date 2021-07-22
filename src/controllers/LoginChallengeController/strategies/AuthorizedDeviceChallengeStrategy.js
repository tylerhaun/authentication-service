import { LoginChallengeStrategy } from "./LoginChallengeStrategy"
import AuthorizedDeviceController from "../../AuthorizedDeviceController";
import LoginController from "../../LoginController";
import LoginChallengeController from "../../LoginChallengeController";

const _ = require("lodash");
const Joi = require("joi");


export default class AuthorizedDeviceChallengeStrategy extends LoginChallengeStrategy {

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

    const authorizedDeviceController = new AuthorizedDeviceController();
    const devices = await authorizedDeviceController.find({userId: challenge.userId});
    console.log("devices", devices);

    const loginController = new LoginController();
    const login = await loginController.findOne({id: challenge.loginId});
    console.log("login", login);
    if (!login.userAgent) {
      throw new Error("User agent not stored on login");
    }

    const currentAuthorizedDevice = _.find(devices, {userAgent: login.userAgent});
    console.log("currentAuthorizedDevice", currentAuthorizedDevice);

    const loginChallengeController = new LoginChallengeController();
    if (currentAuthorizedDevice) {
      const updateResult = await loginChallengeController.update({id: validated.challenge.id}, {deviceId: currentAuthorizedDevice.id});
      console.log({updateResult});
    }

    const success = !!currentAuthorizedDevice;

    if (!success) {
      // return a resolution challenge
    }

    return {success};

  }

  async resolve() {
  
  }

}


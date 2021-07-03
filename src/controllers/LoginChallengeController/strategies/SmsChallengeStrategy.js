import { LoginChallengeStrategy } from "./LoginChallengeStrategy"
import UserController from "../../UserController";
import SmsVerificationRequestController from "../../SmsVerificationRequestController";
import LoginChallengeController from "../../LoginChallengeController";

const Joi = require("joi");


export default class SmsChallengeStrategy extends LoginChallengeStrategy {

  async start(challenge) {
    console.log(`${this.constructor.name}.start()`, challenge);

    const userController = new UserController();
    const user = await userController.findOne({id: challenge.userId});
    console.log("user", user);

    const svrCreateArgs = {
      userId: challenge.userId,
      //code: Joi.string(),

      //to: user.phoneNumber,
      //userId: user.id,
      //loginChallengeId: challenge.id,
    };
    console.log("svrCreateArgs", svrCreateArgs);
    const smsVerificationRequestController = new SmsVerificationRequestController();
    const createdSvr = await smsVerificationRequestController.create(svrCreateArgs);
    console.log("createdSvr", createdSvr);

    const loginChallengeController = new LoginChallengeController();
    const updateResult = await loginChallengeController.update({id: challenge.id}, {smsVerificationRequestId: createdSvr.id});
    console.log("updateResult", updateResult);

    return {userInput: true, challenge};

  }

  async complete(data) {
    console.log(`${this.constructor.name}.complete()`, data);

    const schema = Joi.object({
      challenge: Joi.object(),
      code: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const smsVerificationRequestController = new SmsVerificationRequestController();
    const svr = await smsVerificationRequestController.findOne({id: validated.challenge.smsVerificationRequestId});
    console.log("svr", svr);

    console.log(validated.code, svr.code);
    return validated.code == svr.code;
  
  }
}


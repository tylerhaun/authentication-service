const _ = require("lodash");
const Joi = require("joi");
const phone = require("phone");
const moment = require("moment");

const db = require("../models")
const utils = require("../utils");

import AbstractController from "./AbstractController";
import PasswordController from "./PasswordController";
import EmailAddressController from "./EmailAddressController";
import PhoneNumberController from "./PhoneNumberController";
import EmailVerificationRequestController from "./EmailVerificationRequestController";
import AuthorizedDeviceController from "./AuthorizedDeviceController";
import AuthorizedIpAddressController from "./AuthorizedIpAddressController";


class UserController extends AbstractController {

  constructor() {
    super(arguments);
  }

  _getModel() {
    return db.User;
  }


  //async _sendVerificationEmail(args) {
  //  console.log(`${this.constructor.name}._sendVerificationEmail()`, args);

  //  const schema = Joi.object({
  //    userId: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(args, schema);

  //  const code = utils.randomString(60)

  //  const evrCreateArgs = {
  //    userId: validated.userId,
  //    //subject: "",
  //    //text: "",
  //    code,
  //    //expiration: "",
  //    //loginChallengeId: "",
  //  };
  //  console.log("evrCreateArgs", evrCreateArgs);
  //  const emailVerificationRequestController = new EmailVerificationRequestController();
  //  const createdEvr = await emailVerificationRequestController.create(evrCreateArgs);
  //  console.log("createdEvr", createdEvr);
  //  return createdEvr;
  //  
  //}


  //async verifyEmail(data) {
  //  console.log(`${this.constructor.name}.verifyEmail()`, data);

  //  const schema = Joi.object({
  //    code: Joi.string().required(),
  //    userId: Joi.string(), // optional userId to verify
  //  });
  //  const validated = Joi.attempt(data, schema);

  //  // The code used for email verifications is big and unlikely to happen twice, so simple logic can be used here.
  //  // If the code is expired, none will be found and user gets an error to retry
  //  const expiry = "1m"
  //  const expiryMoment = moment().subtract(utils.formatDuration(expiry));
  //  const emailVerificationRequestController = new EmailVerificationRequestController();
  //  const evrFindArgs = {
  //    code: validated.code,
  //    createdAt: {
  //      [Symbol.for("gt")]: expiryMoment,
  //    }
  //  };
  //  if (validated.userId) {
  //    Object.assign(evrFindArgs, {userId: validated.userId});
  //  }
  //  console.log("evrFindArgs", evrFindArgs);
  //  const evr = await emailVerificationRequestController.findOne()
  //  if (!evr) {
  //    throw new Error("No code found");
  //  }

  //  await emailVerificationRequestController.approve({id: evr.id});

  //  const updateResult = await this.update({
  //    id: evr.userId
  //  }, {
  //    emailVerified: true,
  //  });
  //  console.log("updateResult", updateResult);
  //
  //}


  /*
   * Lookup active evr, emailAddress,
   * calls emailAddress.verify()
   *
   */
  async verifyEmail(data) {
    console.log(`${this.constructor.name}.verifyEmail()`, data);

    const schema = Joi.object({
      code: Joi.string().required(),
      //emailAddressId: Joi.string(),
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const emailVerificationRequestController = new EmailVerificationRequestController();
    const evr = await emailVerificationRequestController.findOne({code: validated.code, userId: validated.userId});
    console.log("evr", evr);

    const emailAddressController = new EmailAddressController();
    const emailAddress = await emailAddressController.findOne({id: evr.emailAddressId})
    console.log("emailAddress", emailAddress);

    const verifyEmailData = {
      code: validated.code,
      userId: validated.userId
    };
    await emailAddressController.verify({id: emailAddress.id}, verifyEmailData)

    return evr;

  }


  async create(data) {
    console.log(`${this.constructor.name}.create()`, data);

    const schema = Joi.object({
      username: Joi.string(),
      password: Joi.string().required(),
      email: Joi.string(),
      phoneNumber: Joi.string().custom(utils.joiPhoneValidator),
      requireSmsVerification: Joi.boolean(),
      requireEmailVerification: Joi.boolean(),
      requireQuestion: Joi.boolean(),
      requireTpa: Joi.boolean(),
      //verifyEmail: Joi.boolean(),
      ipAddress: Joi.string().required(),
      userAgent: Joi.string().required(),
    })
    const validated = Joi.attempt(data, schema);
    console.log("validated", validated);

    const userPickFields = ["username", "phoneNumber", "requireEmailVerification", "requireSmsVerification", "requireQuestion", "requireTpa"];
    const userCreateArgs = _.pick(validated, userPickFields);

    console.log("userCreateArgs", userCreateArgs);
    const createdUser = await super.create(userCreateArgs);
    console.log("createdUser", createdUser);


    // create password
    const passwordCreateArgs = {
      password: data.password,
      userId: createdUser.id,
    };
    console.log("passwordCreateArgs", passwordCreateArgs);
    const passwordController = new PasswordController();
    const createdPassword = await passwordController.create(passwordCreateArgs);
    console.log("createdPassword", createdPassword);


    // create emailAddress
    const emailCreateArgs = {
      userId: createdUser.id,
      emailAddress: validated.email,
      isPrimary: true,
    };
    const emailAddressController = new EmailAddressController();
    const emailAddress = await emailAddressController.create(emailCreateArgs);

    const evr = await emailAddressController.startVerification({id: emailAddress.id});


    // create phoneNumber
    // TODO
    const phoneCreateArgs = {
      userId: createdUser.id,
      phoneNumber: validated.phoneNumber,
      isPrimary: true,
    };
    const phoneNumberController = new PhoneNumberController();
    const phoneNumber = await phoneNumberController.create(phoneCreateArgs);
    console.log("phoneNumber", phoneNumber);

    //const svr = await phoneNumberController.startVerification({id: phoneNumber.id});


    if (validated.userAgent) {
      const authorizedDeviceController = new AuthorizedDeviceController();
      const ad = await authorizedDeviceController.create({
        userId: createdUser.id,
        userAgent: validated.userAgent,
      })
      console.log("authorizedDevice", ad);
    }


    if (validated.ipAddress) {
      const authorizedIpAddressController = new AuthorizedIpAddressController();
      const aia = await authorizedIpAddressController.create({
        userId: createdUser.id,
        ipAddress: validated.ipAddress,
      })
      console.log("authorizedIpAddress", aia);
    }

    return {
     ...createdUser,
      emailAddresses: [
        _.pick(emailAddress, ["id", "emailAddress"]),
      ],
      phoneNumbers: [
        _.pick(phoneNumber, ["id", "phoneNumber"]),
      ],
      evr: _.pick(evr, "id"),
    };

  }

}


export default UserController;


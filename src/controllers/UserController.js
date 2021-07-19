const _ = require("lodash");
const Joi = require("joi");
const phone = require("phone");
const moment = require("moment");

const db = require("../models")
const utils = require("../utils");
const logger = require("../Logger").child({class: "UserController"});

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


  /*
   * Lookup active evr, emailAddress,
   * calls emailAddress.verify()
   *
   */
  async verifyEmail(data) {
    //console.log(`${this.constructor.name}.verifyEmail()`, data);
    logger.log({method: "verifyEmail", data});

    const schema = Joi.object({
      code: Joi.string().required(),
      //emailAddressId: Joi.string(),
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const emailVerificationRequestController = new EmailVerificationRequestController();
    const evr = await emailVerificationRequestController.findOne({code: validated.code, userId: validated.userId});
    //console.log("evr", evr);
    logger.log({evr});

    const emailAddressController = new EmailAddressController();
    const emailAddress = await emailAddressController.findOne({id: evr.emailAddressId})
    //console.log("emailAddress", emailAddress);
    logger.log({emailAddress});

    const verifyEmailData = {
      code: validated.code,
      userId: validated.userId
    };
    await emailAddressController.verify({id: emailAddress.id}, verifyEmailData)

    return evr;

  }


  async create(data) {
    //console.log(`${this.constructor.name}.create()`, data);
    logger.log({method: "create", data});

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
    //console.log("validated", validated);
    logger.log({validated});

    const userPickFields = ["username", "phoneNumber", "requireEmailVerification", "requireSmsVerification", "requireQuestion", "requireTpa"];
    const userCreateArgs = _.pick(validated, userPickFields);

    //console.log("userCreateArgs", userCreateArgs);
    logger.log({userCreateArgs});
    const createdUser = await super.create(userCreateArgs);
    //console.log("createdUser", createdUser);
    logger.log({createdUser});


    // create password
    const passwordCreateArgs = {
      password: data.password,
      userId: createdUser.id,
    };
    //console.log("passwordCreateArgs", passwordCreateArgs);
    logger.log({passwordCreateArgs});
    const passwordController = new PasswordController();
    const createdPassword = await passwordController.create(passwordCreateArgs);
    //console.log("createdPassword", createdPassword);
    logger.log({createdPassword});


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
    //console.log("phoneNumber", phoneNumber);
    logger.log({phoneNumber});

    //const svr = await phoneNumberController.startVerification({id: phoneNumber.id});


    if (validated.userAgent) {
      const authorizedDeviceController = new AuthorizedDeviceController();
      const ad = await authorizedDeviceController.create({
        userId: createdUser.id,
        userAgent: validated.userAgent,
      })
      //console.log("authorizedDevice", ad);
      logger.log({message: "authorizedDevice", ad});
    }


    if (validated.ipAddress) {
      const authorizedIpAddressController = new AuthorizedIpAddressController();
      const aia = await authorizedIpAddressController.create({
        userId: createdUser.id,
        ipAddress: validated.ipAddress,
      })
      //console.log("authorizedIpAddress", aia);
      logger.log({message: "authorizedIpAddress", aia});
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


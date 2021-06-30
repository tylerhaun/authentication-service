const _ = require("lodash");
const Joi = require("joi");
const phone = require("phone");

const db = require("../models")
const utils = require("../utils");

//const AbstractController = require("./AbstractController");
import AbstractController from "./AbstractController";

//const PasswordController = require("./PasswordController");
//const SmsVerificationRequestController = require("./SmsVerificationRequestController");
//const EmailVerificationRequestController = require("./EmailVerificationRequestController");
import PasswordController from "./PasswordController";
import VerificationRequestController from "./VerificationRequestController";
console.log("VerificationRequestController", VerificationRequestController);
import EmailVerificationRequestController from "./EmailVerificationRequestController";
console.log("EmailVerificationRequestController", EmailVerificationRequestController);
//import SmsVerificationRequestController from "./SmsVerificationRequestController";
//console.log("SmsVerificationRequestController", SmsVerificationRequestController);


//function joiPhoneValidator(value, helpers) {
//  var phoneData = phone(value)
//  if (phoneData[1] == null) {
//    return helpers.error("any.invalid");
//  }
//  if (phoneData[1] != "USA") {
//    return helpers.message("{{#label}} must be a USA number");
//  }
//  return phoneData[0];
//}


class UserController extends AbstractController {

  constructor() {
    super(arguments);
  }

  _getModel() {
    return db.User;
  }


  async sendVerificationEmail(args) {
    console.log(`${this.constructor.name}.sendVerificationEmail()`, args);

    const schema = Joi.object({
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(args, schema);

    const code = utils.randomString(60)

    const evrCreateArgs = {
      userId: validated.userId,
      //subject: "",
      //text: "",
      code,
      //expiration: "",
      //loginChallengeId: "",
    };
    console.log("evrCreateArgs", evrCreateArgs);
    const emailVerificationRequestController = new EmailVerificationRequestController();
    const createdEvr = await emailVerificationRequestController.create(evrCreateArgs);
    console.log("createdEvr", createdEvr);
    return createdEvr;
    
  }


  async verifyEmail(data) {
    console.log(`${this.constructor.name}.verifyEmail()`, data);

    const schema = Joi.object({
      code: Joi.string().required(),
      //userId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    //const emailVerificationRequestController = new EmailVerificationRequestController();
    //const evrCreateArgs = {
    //  userId: Joi.string().required(),
    //  subject: Joi.string(),
    //  text: Joi.string(),
    //  code: Joi.string(),
    //  expiration: Joi.string(),
    //  loginChallengeId: Joi.string(),
    //};
    //const createdEvr = await EmailVerificationRequestController.create(evrCreateArgs);

    //const user = await this.model.findOne({
    //  where: {
    //    id: validated.userId
    //  }
    //});


    //verificationRequestController.create({
    //  type: "sms|email"
    //  //provider: "default"
    //  to: "phone/email"
    //  code: "optional code; autogens"
    //  expiration: "optional expiration"
    //})
  
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
      verifyEmail: Joi.boolean(),
    })
    const validated = Joi.attempt(data, schema);
    console.log("validated", validated);

    const userPickFields = ["username", "email", "phoneNumber", "requireEmailVerification", "requireSmsVerification", "requireQuestion", "requireTpa"];
    const userCreateArgs = _.pick(validated, userPickFields);

    console.log("userCreateArgs", userCreateArgs);
    const createdUser = await super.create(userCreateArgs);
    console.log("createdUser", createdUser);

    const passwordCreateArgs = {
      password: data.password,
      userId: createdUser.id,
    };
    console.log("passwordCreateArgs", passwordCreateArgs);
    const passwordController = new PasswordController();
    const createdPassword = await passwordController.create(passwordCreateArgs);
    console.log("createdPassword", createdPassword);

    // email verification
    const evr = await this.sendVerificationEmail({
      userId: createdUser.id,
    })

    // sms verification
    //const svrCreateArgs = {
    //  phoneNumber: createdUser.phoneNumber,
    //  userId: createdUser.id,
    //};
    //console.log("svrCreateArgs", svrCreateArgs);
    //const smsVerificationRequestController = new SmsVerificationRequestController();
    //const createdSvr = await smsVerificationRequestController.create(svrCreateArgs);
    //console.log("createdSvr", createdSvr);


    //await new Promise(function(resolve, reject) {setTimeout(() => resolve(), 2000)});

    //const smsVerificationRequestController = new SmsVerificationRequestController();
    //const svrApproval = await smsVerificationRequestController.approve({
    //  userId: createdSvr.userId,
    //  code: createdSvr.code
    //})
    //console.log("svrApproval", svrApproval);

    return {
     ...createdUser,
      evr: _.pick(evr, "id"),
    };

  }

  //async findById(request) {
  //  const id = request.params.id;
  //  return db.User.findOne({where: {id}})
  //}

  //async find(request) {

  //  const schema = Joi.object({
  //    id: Joi.string(),
  //    username: Joi.string(),
  //    email: Joi.string(),
  //    phoneNumber: Joi.string(),
  //  });

  //  const query = Joi.attempt(request.query, schema);

  //  const query = request.query
  //  const findOptions = {
  //    where: 
  //  };
  //  return db.User.findAll({})
  //}

  //async update(request) {
  //  //const schema = Joi.object({
  //  //  email,
  //  //})
  //  //const data = Joi.attempt(request.body, schema);
  //  //const id = request.params.id;
  //  //if (!id
  //  //return db.User.update(data, )
  //}

  //async delete(request) {
  //
  //}

}

//module.exports = UserController;
export default UserController;


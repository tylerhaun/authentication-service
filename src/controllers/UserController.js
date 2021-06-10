const _ = require("lodash");
const Joi = require("joi");
const phone = require("phone");

const db = require("../models")
const AbstractController = require("./AbstractController");

const PasswordController = require("./PasswordController");
const SmsVerificationRequestController = require("./SmsVerificationRequestController");


function phoneValidator(value, helpers) {
  var phoneData = phone(value)
  if (phoneData[1] == null) {
    return helpers.error("any.invalid");
  }
  if (phoneData[1] != "USA") {
    return helpers.message("{{#label}} must be a USA number");
  }
  return phoneData[0];
}


class UserController extends AbstractController {

  constructor() {
    super(arguments);
  }

  _getModel() {
    return db.User;
  }

  async create(data) {
    console.log("UserController.create()", this);

    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string(),
      phoneNumber: Joi.string().custom(phoneValidator),
      smsVerification: Joi.boolean(),
      emailVerification: Joi.boolean(),
    });
    const validated = Joi.attempt(data, schema);
    console.log("validated", validated);


    const userCreateArgs = _.pick(validated, ["username", "email", "phoneNumber"]);

    console.log("userCreateArgs", userCreateArgs);
    const createdUser = await this.model.create(userCreateArgs);
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

    // sms verification
    const svrCreateArgs = {
      phoneNumber: createdUser.phoneNumber,
      userId: createdUser.id,
    };
    console.log("svrCreateArgs", svrCreateArgs);
    const smsVerificationRequestController = new SmsVerificationRequestController();
    const createdSvr = await smsVerificationRequestController.create(svrCreateArgs);
    console.log("createdSvr", createdSvr);

    return createdUser;

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

module.exports = UserController;


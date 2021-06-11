const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const utils = require("../utils");
const db = require("../models")
const AbstractController = require("./AbstractController");

const UserController = require("./UserController");
const PasswordController = require("./PasswordController");

const { SmsProviderFactory } = require("../SmsProvider");


const secret = "test";

class LoginController extends AbstractController {

  _getModel() {
    return db.Login;
  }

  async create(data) {
    console.log("LogincController.create()", data); // TODO DELETE

    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      ipAddress: Joi.string(),
      device: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    const userController = new UserController();
    const user = await userController.model.findOne({
      where: {
        username: validated.username,
      }
    })
    console.log("user", user);
    if (!user) {
      throw new Error("User does not exist");
    }

    const passwordController = new PasswordController();
    const password = await passwordController.model.findOne({
      where: {
        userId: user.id,
      }
    });
    console.log("password", password);

    const result = await utils.comparePassword(validated.password, password.hash);
    console.log("compare result", result);

    const success = Boolean(result);

    const createLoginArgs = {
      userId: validated.userId,
      success,
      ipAddress: validated.ipAddress,
      device: validated.device,
    };
    console.log("createLoginArgs", createLoginArgs);
    const createdLogin = await this.model.create(createLoginArgs);

    if (!success) {
      throw new Error("Unsuccessful login"); // TODO better error messages
    }

    var token = jwt.sign({userId: validated.userId}, secret, {expiresIn: "1h"})
    //var result = jwt.verify(token, secret);

    return token;

  }


}

module.exports = LoginController;




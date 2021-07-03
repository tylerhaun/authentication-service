const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const phone = require("phone");


const secret = "test";
const maxPageSize = 100;

class Utils {

  parsePaginationParams(query) {
    console.log("parsePaginationParams", query);
    query = query || {};
    const page = query.page || 0;
    const pageSize = query.pageSize || 10;

    const offset = Math.max(0, page * pageSize); // 0 < skip
    const limit = Math.min(Math.max(0, pageSize), maxPageSize); // 0 < pageSize < maxPageSize

    const databaseParams = {
      offset,
      limit,
    };
    console.log("databaseParams", databaseParams);
    return databaseParams;
  }

  async hashPassword(plaintext) {

    const saltRounds = 10;
    const hash = await new Promise(function(resolve, reject) {

      //const salt = await bcrypt.genSalt(saltRounds, function(error, salt) {
      //  if (error) {
      //    reject(error);
      //  }
      //  return salt;
      //});
      //return await bcrypt.hash(password, salt);
      
      bcrypt.hash(plaintext, saltRounds, (error, hash) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        return resolve(hash);
      });
    })
    console.log("hash", hash);
    return hash;

  }

  async comparePassword(plaintext, hash) {
    console.log("comparePassword", plaintext, hash);

    return new Promise(function(resolve, reject) {

      bcrypt.compare(plaintext, hash, (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });

    })
  
  }

  middlewareMethodWrapper(method, inputFields) {
    if (!Array.isArray(inputFields)) {
      inputFields = [inputFields];
    }
    return async function middleware(request, response, next) {
      try {
        console.log("calling", method);
        const preArgs = inputFields.map(field => request[field])
        const fullArgs = [...preArgs, request, response, next];
        const data = await method.apply(null, fullArgs);
        return response.json(data);
      }
      catch(error) {
        console.log("middlewareMethodWrapper error");
        console.error(error);
        return next(error);
      }
    }
  }

  restRoutes(routeName, controller /* AbstractController */, app) {

    app.route(`/${routeName}`)
      .post(this.middlewareMethodWrapper(controller.create.bind(controller), "body"))
      .get(this.middlewareMethodWrapper(controller.find.bind(controller), "query"))

    app.route(`/${routeName}/:id`)
      .get(this.middlewareMethodWrapper(controller.findById.bind(controller), "params"))
      .post(this.middlewareMethodWrapper(controller.update.bind(controller), ["params", "body"]))
      .delete(this.middlewareMethodWrapper(controller.delete.bind(controller), "params"))

  }

  joiPhoneValidator(value, helpers) {
    var phoneData = phone(value)
    if (phoneData[1] == null) {
      return helpers.error("any.invalid");
    }
    if (phoneData[1] != "USA") {
      return helpers.message("{{#label}} must be a USA number");
    }
    return phoneData[0];
  }


  randomString(length, characters) {

    length = length || 6;
    characters = characters || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    var result = '';
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;

  }


  async signJwtToken(data, options) {
  
    const schema = Joi.object({
      data: Joi.object(),
      options: Joi.object({
        expiresIn: Joi.string().default("1h")
      }),
    });
    const validated = Joi.attempt({data, options}, schema);

    var token = jwt.sign(validated.data, secret, validated.options)
    //var token = jwt.sign({userId: validated.userId}, secret, {expiresIn: "1h"})
    return token;
  
  }

  async verifyJwtToken(data) {

    const schema = Joi.object({
      token: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);
  
    var result = jwt.verify(validated.token, secret);
    return result;
  
  }

  /*
   * input duratinString
   * eg 1m, 12hours, 10s
   * returns moment.duration() of the formatted time
   */
  formatDuration(durationString) {

    if (!(typeof durationString === 'string' || duratinString instanceof String)) {
      throw new Error("must be a string");
    }

    var r = new RegExp("([0-9]*)([a-zA-Z]*)")
    var result = r.exec(durationString)
    const data = {
      value: result[1],
      unit: result[2],
    }

    const validUnits = ["years", "y", "months", "M", "weeks", "w", "days", "d", "hours", "h", "minutes", "m", "seconds", "s", "milliseconds", "ms"];
    const schema = Joi.object({
      value: Joi.number().integer().required(),
      unit: Joi.string().required().valid(...validUnits),
    });
    const validated = Joi.attempt(data, schema);

    var ret = moment.duration(result[1], result[2]);
    console.log(ret.humanize())
    return ret;
  
  }

};


//class HttpError extends Error {
//  constructor(args) {
//    const { message, status } = args;
//    super(message);
//    this.name = this.constructor.name;
//    this.message = message;
//    this.status = status;
//  }
//}
//
//function ErrorHandlerMiddleware(error, request, response, next) {
//  var httpError;
//  if (error instanceof HttpError) {
//    httpError = error;
//  }
//  else {
//    var message;
//    if (process.env.CONCEAL_ERRORS == true) {
//      message = process.env.CONCEAL_ERRORS_MESSAGE || "Set CONCEAL_ERRORS_MESSAGE for custom message";
//      console.error(error);
//    }
//    else {
//      message = error.message;
//    }
//    const errorArgs = {
//      message,
//      status: "500",
//    };
//    httpError = new HttpError(errorArgs);
//  }
//
//  return response.status(httpError.status).json({error: httpError.message})
//
//}



module.exports = new Utils();


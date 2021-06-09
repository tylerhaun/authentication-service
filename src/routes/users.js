const _ = require("lodash");
const Joi = require('joi');
const utils = require("../utils");

//const db = require("../models")
const UserController = require("../controllers/UserController");

const routeName = "users";


module.exports = function(app) {
  const userController = new UserController();
  console.log("userController", userController);

  app.route(`/${routeName}`)
    .get(utils.middlewareMethodWrapper(userController.find.bind(userController), "query"))
    .post(utils.middlewareMethodWrapper(userController.create.bind(userController), "body"))

  //  .get(async function(request, response, next) {
  //    try {
  //      const users = await db.User.findAll({limit: 10})
  //      return response.json(users);
  //    }
  //    catch(error) {
  //      console.error(error);
  //      return next(error);
  //    }
  //  })

  //  .post(async function(request, response, next) {
  //    try {

  //      //const schema = Joi.object({
  //      //  username: Joi.string().required(),
  //      //  password: Joi.string().required(),
  //      //  email: Joi.string(),
  //      //  phoneNumber: Joi.string(),
  //      //});
  //      //const userCreateArgs = Joi.attempt(request.body, schema);

  //      //const createPasswordArgs = {
  //      //
  //      //};
  //      //const createdPassword = db.Password.create() // need to break of into separate class

  //      //console.log("userCreateArgs", userCreateArgs);
  //      //const createdUser = await db.User.create(userCreateArgs);
  //      //console.log("createdUser", createdUser);
  //      //return response.json(createdUser);
  //    }
  //    catch(error) {
  //      console.error(error);
  //      return next(error);
  //    }
  //  })


  app.route(`/${routeName}/:id`)
    .get(utils.middlewareMethodWrapper(userController.findById.bind(userController), "params"))
    .post(utils.middlewareMethodWrapper(userController.update.bind(userController), ["params", "body"]))
  //.put(middlewareMethodWrapper(userController.update))
    .delete(utils.middlewareMethodWrapper(userController.delete.bind(userController), "params"))

  //  .get(async function(request, response, next) {
  //    const id = request.params.id;
  //    const user = db.User.findOne({id})
  //    return response.json(user);
  //  })
  //  .post(async function(request, response, next) {
  //    return response.json();
  //  })
  //  .put(async function(request, response, next) {
  //    return response.json();
  //  })
  //  .delete(async function(request, response, next) {
  //    return response.json();
  //  })

}

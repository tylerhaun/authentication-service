const _ = require("lodash");
const Joi = require('joi');
const utils = require("../utils");

//const db = require("../models")
//const UserController = require("../controllers/UserController");
import UserController from "../controllers/UserController";

const routeName = "users";


module.exports = function(app) {
  const controller = new UserController();

  //app.route(`/${routeName}`)
  //  .get(utils.middlewareMethodWrapper(userController.find.bind(userController), "query"))
  //  .post(utils.middlewareMethodWrapper(userController.create.bind(userController), "body"))

  //app.route(`/${routeName}/:id`)
  //  .get(utils.middlewareMethodWrapper(userController.findById.bind(userController), "params"))
  //  .post(utils.middlewareMethodWrapper(userController.update.bind(userController), ["params", "body"]))
  //  .delete(utils.middlewareMethodWrapper(userController.delete.bind(userController), "params"))

  app.post(`/${routeName}/verifyEmail`, utils.middlewareMethodWrapper(controller.verifyEmail.bind(controller), "body"))

  utils.restRoutes(routeName, controller, app);


}

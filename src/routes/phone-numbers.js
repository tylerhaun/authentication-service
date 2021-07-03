const utils = require("../utils");
import PhoneNumberController from "../controllers/PhoneNumberController";


const routeName = "phone-numbers"

module.exports = function(app) {

  const controller = new PhoneNumberController();

  app.post(`/${routeName}/:id/startVerification`, utils.middlewareMethodWrapper(controller.startVerification.bind(controller), ["params", "body"]))
  app.post(`/${routeName}/:id/verify`, utils.middlewareMethodWrapper(controller.verify.bind(controller), ["params", "body"]))

  utils.restRoutes(routeName, controller, app);



}

const utils = require("../utils");
import EmailAddressController from "../controllers/EmailAddressController";


const routeName = "email-addresses"

module.exports = function(app) {

  const controller = new EmailAddressController();

  app.post(`/${routeName}/:id/startVerification`, utils.middlewareMethodWrapper(controller.startVerification.bind(controller), ["params", "body"]))
  app.post(`/${routeName}/:id/verify`, utils.middlewareMethodWrapper(controller.verify.bind(controller), ["params", "body"]))

  utils.restRoutes(routeName, controller, app);



}

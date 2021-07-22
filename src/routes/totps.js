const utils = require("../utils");
import TotpController from "../controllers/TotpController";


const routeName = "totps"

module.exports = function(app) {

  const controller = new TotpController();

  app.post(`/${routeName}/:id/startVerification`, utils.middlewareMethodWrapper(controller.startVerification.bind(controller), ["params", "body"]))
  app.post(`/${routeName}/:id/verify`, utils.middlewareMethodWrapper(controller.verify.bind(controller), ["params", "body"]))

  utils.restRoutes(routeName, controller, app);



}

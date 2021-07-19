const utils = require("../utils");
//const LoginController = require("../controllers/LoginController");
import LoginController from "../controllers/LoginController";


const routeName = "login"

module.exports = function(app) {

  const controller = new LoginController();

  app.post(`/loginWithPassword`, utils.middlewareMethodWrapper(controller.loginWithPassword.bind(controller), ["body"]))
  app.post(`/loginWithAccessToken`, utils.middlewareMethodWrapper(controller.loginWithAccessToken.bind(controller), ["body"]))

  utils.restRoutes(routeName, controller, app);


}

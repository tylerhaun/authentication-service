const utils = require("../utils");
//const LoginController = require("../controllers/LoginController");
import LoginController from "../controllers/LoginController";


const routeName = "login"

module.exports = function(app) {

  const controller = new LoginController();
  utils.restRoutes(routeName, controller, app);

}

const utils = require("../utils");
import OneTimePasswordController from "../controllers/OneTimePasswordController";


const routeName = "one-time-passwords"

module.exports = function(app) {

  const controller = new OneTimePasswordController();

  utils.restRoutes(routeName, controller, app);

}

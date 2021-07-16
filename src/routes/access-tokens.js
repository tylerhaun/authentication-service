const utils = require("../utils");
import AccessTokenController from "../controllers/AccessTokenController";


const routeName = "access-tokens"

module.exports = function(app) {

  const controller = new AccessTokenController();

  utils.restRoutes(routeName, controller, app);

}

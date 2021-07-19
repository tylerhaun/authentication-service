import HttpError from "../http-errors";
const utils = require("../utils")
const logger = require("../Logger");


class AbstractController {

  constructor() {
    this.model = this._getModel()
    if (!this.model) {
      throw new Error("_getModel must return a sequelize model");
    }
    //const className = "AbstractController";
    //this.logger = logger.child({class: `${this.constructor.name}.${className}`})
    this.logger = logger.child({class: this.constructor.name})
  }

  _getModel() {
    throw new Error("_getModel() must be overridden");
  }

  async create(data) {
    this.logger.log({class: "AbstractController", parent: this.constructor.name, method: "create"})
    //console.log(this.constructor.name, "AbstractController.create()");
    if (Array.isArray(data)) {
      return this.bulkCreate(data);
    }
    const result = await this.model.create(data);
    return result.get({plain:true});
  }

  async bulkCreate(data) {
    this.logger.log({class: "AbstractController", parent: this.constructor.name, method: "bulkCreate"})
    //console.log(this.constructor.name, "AbstractController.bulkCreate()");
    const result = await this.model.bulkCreate(data);
    return result.map(r => r.get({plain:true}));
  }

  async find(query) {
    this.logger.log({class: "AbstractController", parent: this.constructor.name, method: "find"})
    //console.log(this.constructor.name, "AbstractController.find()");
    const paginationParams = utils.parsePaginationParams(query);
    const options = {
      where: query,
    }
    Object.assign(options, paginationParams);
    const result = await this.model.findAll(options);
    return result.map(r => r.get({plain:true}));
  }

  async findOne(query, options) {
    this.logger.log({class: "AbstractController", parent: this.constructor.name, method: "findOne"})
    //console.log(this.constructor.name, "AbstractController.findOne()");
    options = options || {};
    const sequelizeOptions = {
      where: query,
    }
    const record = await this.model.findOne(sequelizeOptions);
    if (!record && (options.skipError != true)) {
      const modelName = this.model.name.replace(/_/g, " ");
      throw new HttpError({message: `${modelName} not found`, status: 404})
    }
    return record.get({plain:true});
  }

  async findById(query) {
    this.logger.log({class: "AbstractController", parent: this.constructor.name, method: "findById"})
    //console.log(this.constructor.name, "AbstractController.findById()");
    const id = query.id;
    const options = {
      where: {
        id
      },
    };
    return this.model.findOne(options)
  }

  async update(query, data) {
    this.logger.log({class: "AbstractController", parent: this.constructor.name, method: "update"})
    //console.log(this.constructor.name, "AbstractController.update()", query, data);
    const id = query.id;
    const options = {
      where: {
        id,
      },
      //returning: true,
      //plain: true,
    };
    return this.model.update(data, options);
  }

  async delete(query) {
    this.logger.log({class: "AbstractController", parent: this.constructor.name, method: "delete"})
    //console.log(this.constructor.name, "AbstractController.delete()");
    const id = query.id;
    if (!id) {
      throw new Error("Missing id in delete");
    }
    const options = {
      where: {
        id: query.id
      }
    };
    return this.model.destroy(options);
  }

}

//module.exports = AbstractController;
export default AbstractController;


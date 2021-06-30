const utils = require("../utils")


class AbstractController {

  constructor() {
    this.model = this._getModel()
  }

  _getModel() {
    throw new Error("_getModel() must be overridden");
  }

  async create(data) {
    console.log(this.constructor.name, "AbstractController.create()");
    if (Array.isArray(data)) {
      return this.bulkCreate(data);
    }
    const result = await this.model.create(data);
    return result.get({plain:true});
  }

  async bulkCreate(data) {
    console.log(this.constructor.name, "AbstractController.bulkCreate()");
    const result = await this.model.bulkCreate(data);
    return result.map(r => r.get({plain:true}));
  }

  async find(query) {
    console.log(this.constructor.name, "AbstractController.find()");
    const paginationParams = utils.parsePaginationParams(query);
    const options = {
      where: query,
    }
    Object.assign(options, paginationParams);
    console.log("options", options);
    return this.model.findAll(options);
  }

  async findOne(query) {
    console.log(this.constructor.name, "AbstractController.findOne()");
    const options = {
      where: query,
    }
    console.log("options", options);
    return this.model.findOne(options);
  }

  async findById(query) {
    console.log(this.constructor.name, "AbstractController.findById()");
    const id = query.id;
    const options = {
      where: {
        id
      },
    };
    return this.model.findOne(options)
  }

  async update(query, data) {
    console.log(this.constructor.name, "AbstractController.update()", query, data);
    const id = query.id;
    const options = {
      where: {
        id,
      },
      returning: true,
    };
    console.log({data, options})
    return this.model.update(data, options);
  }

  async delete(query) {
    console.log(this.constructor.name, "AbstractController.delete()");
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


const utils = require("../utils")


class AbstractController {

  constructor() {
    this.model = this._getModel()
  }

  _getModel() {
    throw new Error("_getModel() must be overridden");
  }

  async create(data) {
    console.log("AbstractController.create()");
    return this.model.create(data);
  }

  async find(query) {
    console.log("AbstractController.find()");
    const paginationParams = utils.parsePaginationParams(query);
    const options = {
      where: query,
    }
    Object.assign(options, paginationParams);
    console.log("options", options);
    return this.model.findAll(options);
  }

  async findById(query) {
    console.log("AbstractController.findById()");
    const id = query.id;
    const options = {
      where: {
        id
      },
    };
    return this.model.findOne(options)
  }

  async update(query, data) {
    console.log("AbstractController.update()");
    const id = query.id;
    const options = {
      where: {
        id,
      },
      returning: true,
    };
    return this.model.update(data, options);
  }

  async delete(query) {
    console.log("AbstractController.delete()");
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

module.exports = AbstractController;


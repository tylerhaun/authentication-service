const fs = require("fs");
const path = require("path");
const { Sequelize } = require('sequelize');


//const sequelizeConfig = 'sqlite::memory:';
const sequelizeConfig = {dialect: "sqlite", storage: "database.sqlite"};
//const sequelize = new Sequelize(sequelizeConfig, {query:{raw:true}});
const sequelize = new Sequelize(sequelizeConfig);


class Db {

  async init() {
    console.log("db.init()");
    this.loadModels()

    const result = await sequelize.sync();
    console.log("sequelize synced");

  }

  loadModels() {
    console.log("db.loadModels()");

    const files = fs.readdirSync(__dirname)
    const _this = this;
    files
      .filter(file => file.endsWith(".js"))
      .filter(file => file != "index.js")
      .forEach(file => {
        const nameWithoutExt = path.basename(path.basename(file), path.extname(file));
        _this[nameWithoutExt] = require(`./${file}`)(sequelize);
    })
  
  }


}


module.exports = new Db()


console.log("In models");
const fs = require("fs");
const path = require("path");
const { Sequelize } = require('sequelize');
//const { Sequelize, Model, DataTypes } = require('sequelize');
//const sequelize = new Sequelize('sqlite::memory:');


//module.exports.sequelize = sequelize;
//
//(async () => {
//  const result = await sequelize.sync();
//  console.log("sequelize synced", result)
//
//  const User = require("./models/User");
//  const jane = await User.create({
//    username: 'janedoe',
//    birthday: new Date(1980, 6, 20)
//  });
//  console.log(jane.toJSON());
//  console.log(await User.findAll())
//
//})();


const sequelizeConfig = 'sqlite::memory:';
const sequelize = new Sequelize(sequelizeConfig, {query:{raw:true}});


class Db {

  async init() {
    console.log("db.init()");
    this.loadModels()

    const result = await sequelize.sync();
    console.log("sequelize synced");

    //await Promise.all(new Array(10).fill(null).map(n => {
    //  return this.User.create({
    //    username: "test" + Math.round(Math.random() * 10000),
    //    email: `test${Math.round(Math.random()*10000)}@test.com`
    //    phoneNumber: "202-225-4965"
    //  });
    //
    //}))
    //console.log(await this.User.findAll())

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


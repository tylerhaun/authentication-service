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
const sequelize = new Sequelize(sequelizeConfig);

class Db {

  async init() {
    console.log("db.init()");
    this.loadModels()

    const result = await sequelize.sync();
    console.log("sequelize synced");

    await Promise.all(new Array(10).fill(null).map(n => {
      return this.User.create({
        username: "test" + Math.round(Math.random() * 10000),
        email: `test${Math.round(Math.random()*10000)}@test.com`
      });
    
    }))
    //console.log(await this.User.findAll())

  }

  loadModels() {
    console.log("db.loadModels()");
  
    this.User = require("./User")(sequelize);
    this.Password = require("./Password")(sequelize);
  
  }


}


module.exports = new Db()


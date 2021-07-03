const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class User extends Model {}
  User.init({
    id: {
      primaryKey: true,
      type: DataTypes.STRING,
      defaultValue: function() {
        return cuid();
      },
    },
    username: {
      type: DataTypes.STRING,
    },
    requireSmsVerification: {
      type: DataTypes.BOOLEAN,
    },
    requireEmailVerification: {
      type: DataTypes.BOOLEAN,
    },
    requireQuestion: {
      type: DataTypes.BOOLEAN,
    },
    requireTpa: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    sequelize,
    modelName: "user",
    timestamps: true,
    paranoid: true,
  });

  return User;

}


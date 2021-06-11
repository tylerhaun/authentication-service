const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class Login extends Model {}
  Login.init({
    id: {
      primaryKey: true,
      type: DataTypes.STRING,
      defaultValue: function() {
        return cuid();
      },
    },
    userId: {
      type: DataTypes.STRING,
    },
    success: {
      type: DataTypes.BOOLEAN,
    },
    ipAddress: {
      type: DataTypes.STRING,
    },
    device: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: "login",
    timestamps: true,
    paranoid: true,
  });

  return Login;

}


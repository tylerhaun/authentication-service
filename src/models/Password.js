const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class Password extends Model {}
  Password.init({
    id: {
      primaryKey: true,
      type: DataTypes.STRING,
      defaultValue: function() {
        return cuid();
      },
    },
    hash: {
      type: DataTypes.STRING,
    },
    deactivatedAt: {
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: "password",
    timestamps: true,
  })

  return Password;

}


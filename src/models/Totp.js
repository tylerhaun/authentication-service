const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class Totp extends Model {}
  Totp.init({
    id: {
      primaryKey: true,
      type: DataTypes.STRING,
      defaultValue: function() {
        return cuid();
      },
    },
    userId: {
      type: DataTypes.STRING,
      required: true,
    },
    code: {
      type: DataTypes.STRING,
    },
    verifiedAt: {
      type: DataTypes.DATE,
    },

  }, {
    sequelize,
    modelName: "totp",
    timestamps: true,
    paranoid: true,
  });

  return Totp;

}


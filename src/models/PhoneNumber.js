const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class PhoneNumber extends Model {}
  PhoneNumber.init({
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
    phoneNumber: {
      type: DataTypes.STRING,
      required: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    sequelize,
    modelName: "phone_number",
    timestamps: true,
    paranoid: true,
  });

  return PhoneNumber;

}


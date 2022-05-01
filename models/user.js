'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Group,{through:"User_Group"})
      User.belongsToMany(models.User,{through:"Friend",as:"Requester"})
      User.belongsToMany(models.User,{through:"Friend",as:"Responder"})
    }
  }
  User.init({
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
// Requiring bcrypt for password hashing. Using the bcryptjs version as the regular bcrypt module sometimes causes errors on Windows machines
var bcrypt = require("bcryptjs");
// Creating our Admin model
module.exports = function(sequelize, DataTypes) {
  var Admin = sequelize.define("Administrator", {
    // The email cannot be null, and must be a proper email before creation
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    // The password cannot be null
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  // Creating a custom method for our Admin model. This will check if an unhashed password entered by the Admin can be compared to the hashed password stored in our database
  Admin.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };
  // Hooks are automatic methods that run during various phases of the Admin Model lifecycle
  // In this case, before a Admin is created, we will automatically hash their password
  Admin.addHook("beforeCreate", function(admin) {
    admin.password = bcrypt.hashSync(admin.password, bcrypt.genSaltSync(10), null);
  });
  return Admin;
};

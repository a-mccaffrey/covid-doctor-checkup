// Requiring bcrypt for password hashing. Using the bcryptjs version as the regular bcrypt module sometimes causes errors on Windows machines
var bcrypt = require("bcryptjs");
// Creating our Doctor model
module.exports = function(sequelize, DataTypes) {
  var Doctor = sequelize.define("Doctor", {
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
  // Creating a custom method for our Doctor model. This will check if an unhashed password entered by the Doctor can be compared to the hashed password stored in our database
  Doctor.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };
  // Hooks are automatic methods that run during various phases of the Doctor Model lifecycle
  // In this case, before a Doctor is created, we will automatically hash their password
  Doctor.addHook("beforeCreate", function(doctor) {
    doctor.password = bcrypt.hashSync(doctor.password, bcrypt.genSaltSync(10), null);
  });
  return Doctor;
};

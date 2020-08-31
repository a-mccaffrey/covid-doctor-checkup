// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
var moment = require("moment");

let clinicPassword = "12345";

let workingHours = [
  { name: "9am", hour: 9 },
  { name: "10am", hour: 10 },
  { name: "11am", hour: 11 },
  { name: "12am", hour: 12 },
  { name: "2pm", hour: 14 },
  { name: "3pm", hour: 15 },
  { name: "4pm", hour: 16 },
];
let workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    console.log("/api/login");
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    console.log("/api/signup");
    let role = req.body.role;
    let clinicP = req.body.clinicPassword;

    if (role == "doctor" && clinicPassword == clinicP) {
      create();
    } else if (role == "patient") {
      create();
    } else {
      res.status(401).json("Invalid clinic password");
    }

    function create() {
      db.User.create({
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        name: req.body.name,
        gender: req.body.gender,
        province: req.body.province,
        phone: req.body.phone,
      })
        .then(function () {
          res.redirect(307, "/api/login");
        })
        .catch(function (err) {
          console.log(err);
          res.status(401).json(err);
        });
    }
  });

  app.get("/api/getdoctors", function (req, res) {
    console.log("/api/getdoctors");

    if (req.user) {
      db.sequelize
        .query("SELECT * FROM Users WHERE role='doctor'", {
          type: db.Sequelize.QueryTypes.SELECT,
        })
        .then(function (doctors) {
          res.json(doctors);
        })
        .catch(function (err) {
          console.log(err);
        });
    } else {
      res.json({});
    }
  });

  app.get("/api/getPatient", function (req, res) {
    console.log("/api/getPatient");

    if (req.user.role == "admin") {
      let query = "SELECT * FROM Users WHERE role='patient'";
      db.sequelize
        .query(query, {
          type: db.Sequelize.QueryTypes.SELECT,
        })
        .then(function (patients) {
          res.json(patients);
        })
        .catch(function (err) {
          console.log(err);
        });
    } else {
      res.json({});
    }
  });

  app.post("/api/getUserAppointments", function (req, res) {
    console.log("/api/getUserAppointments");

    if (req.user) {
      let clientID = req.body.id;
      let role = req.body.role;
      let currentTime = Math.floor(Date.now() / 1000);
      let obj = {};

      if (role == "patient") {
        db.sequelize
          .query(
            "SELECT * FROM Appointments WHERE client_id=" +
              clientID +
              " AND timestamp > " +
              currentTime,
            { type: db.Sequelize.QueryTypes.SELECT }
          )
          .then(function (appointments) {
            obj = {
              role: role,
              appointments: appointments,
            };
            res.json(obj);
          });
      } else if (role == "doctor" || req.user.role == "admin") {
        db.sequelize
          .query(
            "SELECT * FROM Appointments WHERE doctor_id=" +
              clientID +
              " AND timestamp > " +
              currentTime,
            { type: db.Sequelize.QueryTypes.SELECT }
          )
          .then(function (appointments) {
            obj = {
              role: role,
              appointments: appointments,
            };
            res.json(obj);
          })
          .catch(function (err) {
            console.log(err);
          });
      }
    } else {
      res.json({});
    }
  });

  app.post("/api/getSchedule", function (req, res) {
    console.log("/api/getSchedule");

    if (req.user) {
      let doctorID = req.body.id;
      let year = req.body.year;
      let month = req.body.month;
      let day = req.body.day;
      let dayOfWeek = req.body.dayOfWeek;

      db.sequelize
        .query(
          "SELECT * FROM Appointments WHERE doctor_id=" +
            doctorID +
            " AND year=" +
            year +
            " AND month=" +
            month +
            " AND day=" +
            day,
          {
            type: db.Sequelize.QueryTypes.SELECT,
          }
        )
        .then(function (appointments) {
          db.sequelize
            .query(`SELECT * FROM Users WHERE id=${doctorID}`, {
              type: db.Sequelize.QueryTypes.SELECT,
            })
            .then(function (doctor) {
              let schedule = [];
              if (doctor[0].doctorSchedule) {
                schedule = JSON.parse(doctor[0].doctorSchedule);
              }
              createTimeSlots(schedule, appointments);
            });

          function createTimeSlots(schedule, appointments) {
            let timeSlots = [];

            for (time of workingHours) {
              let show = true;

              for (appointment of appointments) {
                if (time.hour == appointment.hour) {
                  show = false;
                }
              }
              if (show && isHourAvail(schedule, dayOfWeek, time.hour)) {
                timeSlots.push(time);
              }
            }
            res.json(timeSlots);
          }
        });
    } else {
      res.json({});
    }
  });

  app.post("/api/createAppointment", function (req, res) {
    console.log("/api/createAppointment");

    if (req.user) {
      let year = req.body.year;
      let month = req.body.month;
      let day = req.body.day;
      let hour = req.body.hour;
      let doctorName = req.body.doctorName;
      let clientName = req.body.clientName;
      let healthcardNum = req.body.healthcardNum;
      let height = req.body.height;
      let weight = req.body.weight;
      let currentMed = req.body.currentMed;
      let checkup = req.body.checkup;

      let str = month + "/" + day + "/" + year + " " + hour + ":00:00";

      let currentTime = Math.floor(Date.now() / 1000);
      db.sequelize
        .query(
          "SELECT * FROM Appointments WHERE client_id=" +
            req.body.clientID +
            " AND timestamp > " +
            currentTime,
          { type: db.Sequelize.QueryTypes.SELECT }
        )
        .then(function (appointments) {
          if (appointments.length == 0) {
            db.Appointment.create({
              client_id: req.body.clientID,
              doctor_id: req.body.doctorID,
              doctorName: doctorName,
              clientName: clientName,
              year: year,
              month: month,
              day: day,
              hour: hour,
              timestamp: toTimestamp(str),
              healthcardNum: healthcardNum,
              height: height,
              weight: weight,
              currentMed: currentMed,
              checkup: checkup,
            })
              .then(function () {
                res.json("Your appointment was created");
              })
              .catch(function (err) {
                console.log(err);
                res.status(401).json(err);
              });
          } else {
            res.json("You are already booked for an appointment");
          }
        });
    } else {
      res.json({});
    }
  });

  app.get("/logout", function (req, res) {
    console.log("/api/logout");

    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    console.log("/api/user_data");

    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      res.json({
        email: req.user.email,
        id: req.user.id,
        role: req.user.role,
        name: req.user.name,
        doctorSchedule: req.user.doctorSchedule,
      });
    }
  });

  app.post("/api/getDates", function (req, res) {
    console.log("/api/getDates");

    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      let doctorID = req.body.doctorID;

      db.sequelize
        .query(`SELECT * FROM Users WHERE id=${doctorID}`, {
          type: db.Sequelize.QueryTypes.SELECT,
        })
        .then(function (doctor) {
          let schedule = [];
          if (doctor[0].doctorSchedule) {
            schedule = JSON.parse(doctor[0].doctorSchedule);
          }
          createDays(schedule);
        });

      function createDays(schedule) {
        let calender = [];
        for (i = 1; i < 8; i++) {
          moment().format("ll");
          let month = moment().add(i, "d").format("MMMM");
          let day = moment().add(i, "d").format("DD");
          let week = moment().add(i, "d").format("ddd");

          let yearNum = moment().add(i, "d").format("YYYY");
          let monthNum = moment().add(i, "d").format("M");
          let dayNum = moment().add(i, "d").format("D");

          for (dayOfWeek of workingDays) {
            if (week == dayOfWeek) {
              let calenderObject = {
                name: week + " " + month + " " + day,
                year: yearNum,
                month: monthNum,
                day: dayNum,
              };
              if (isDayAvail(schedule, week)) {
                calender.push(calenderObject);
              }
              break;
            }
          }
        }
        res.json(calender);
      }
    }
  });

  app.get("/api/getWorkingData", function (req, res) {
    console.log("/api/getWorkingData");

    if (!req.user) {
      res.json({});
    } else {
      res.json({
        workingDays: workingDays,
        workingHours: workingHours,
      });
    }
  });

  app.post("/api/submitDoctorSchedule", function (req, res) {
    console.log("/api/submitDoctorSchedule");

    if (req.user.role == "doctor" || req.user.role == "admin") {
      let schedule = req.body.schedule;
      let doctorID = req.body.doctorID;

      db.User.update(
        { doctorSchedule: schedule },
        {
          where: {
            id: doctorID,
          },
        }
      )
        .then(function () {
          res.json("New schedule submitted");
        })
        .catch(function (err) {
          console.log(err);
          res.status(401).json(err);
        });
    } else {
      res.json({});
    }
  });

  app.post("/api/getDoctorSchedule", function (req, res) {
    console.log("/api/getSchedule");

    if (req.user.role == "admin") {
      let doctorID = req.body.doctorID;
      db.sequelize
        .query(`SELECT * FROM Users WHERE id=${doctorID}`, {
          type: db.Sequelize.QueryTypes.SELECT,
        })
        .then(function (doctor) {
          let schedule = [];
          if (doctor[0].doctorSchedule) {
            schedule = JSON.parse(doctor[0].doctorSchedule);
          }
          res.json(schedule);
        });
    } else {
      res.json({});
    }
  });

  app.post("/api/deleteUser", function (req, res) {
    console.log("/api/deleteUser");

    if (req.user.role == "admin") {
      let userID = req.body.userID;
      db.User.destroy({
        where: {
          id: userID,
        },
      }).then(function () {
        res.json("User deleted");
      });
    } else {
      res.json({});
    }
  });

  app.post("/api/deleteAppointment", function (req, res) {
    console.log("/api/deleteAppointment");

    if (req.user.role == "admin" || req.user.role == "doctor") {
      let appointmentID = req.body.appointmentID;
      db.Appointment.destroy({
        where: {
          id: appointmentID,
        },
      }).then(function () {
        res.json("Appointment deleted");
      });
    } else {
      res.json({});
    }
  });
};

function toTimestamp(strDate) {
  var datum = Date.parse(strDate);
  return datum / 1000;
}

function isDayAvail(doctorSchedule, day) {
  for (entry of doctorSchedule) {
    if (entry.day == day) {
      for (hour of entry.hours) {
        if (hour.avail == true) {
          return true;
        }
      }
    }
  }
  return false;
}

function isHourAvail(doctorSchedule, day, hour) {
  for (entry of doctorSchedule) {
    if (entry.day == day) {
      for (h of entry.hours) {
        if (h.hour == hour) {
          if (h.avail) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

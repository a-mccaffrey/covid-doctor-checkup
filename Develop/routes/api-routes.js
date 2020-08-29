// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
var moment = require("moment")

let clinicPassword = "12345"
let workingHours = [
  {name: "9am", hour: 9 },
  {name: "10am", hour: 10 },
  {name: "11am", hour: 11 },
  {name: "12am", hour: 12 },
  {name: "2pm", hour: 14 },
  {name: "3pm", hour: 15 },
  {name: "4pm", hour: 16 }
];

module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {

    let role = req.body.role
    let clinicP = req.body.clinicPassword

    if (role == "doctor" && clinicPassword == clinicP) {
      create()
    } else if (role == "patient") {
      create()
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
        phone: req.body.phone
      })
        .then(function () {
          res.redirect(307, "/api/login");
        })
        .catch(function (err) {
          console.log(err)
          res.status(401).json(err);
        });
    }

  });

  app.get("/api/getdoctors", function (req, res) {
    db.sequelize
      .query("SELECT * FROM Users WHERE role='doctor'", { type: db.Sequelize.QueryTypes.SELECT })
      .then(function (doctors) {
        console.log(doctors);
        res.json(doctors);
      });
  });

  app.post("/api/getUserAppointments", function (req, res) {
    let clientID = req.body.id;
    let role = req.body.role
    let currentTime = Math.floor(Date.now() / 1000)
    let obj = {}

    if (role == "patient") {
      db.sequelize
      .query("SELECT * FROM Appointments WHERE client_id=" + clientID + " AND timestamp > " + currentTime, { type: db.Sequelize.QueryTypes.SELECT })
      .then(function (appointments) {
        obj = {
          role: role,
          appointments: appointments
        }
        res.json(obj);
      });
    } else if (role == "doctor") {
      db.sequelize
      .query("SELECT * FROM Appointments WHERE doctor_id=" + clientID + " AND timestamp > " + currentTime, { type: db.Sequelize.QueryTypes.SELECT })
      .then(function (appointments) {
        obj = {
          role: role,
          appointments: appointments
        }
        res.json(obj);
      });
    }
    
  });

  app.post("/api/getSchedule", function (req, res) {
    let doctorID = req.body.id;
    let year = req.body.year;
    let month = req.body.month;
    let day = req.body.day
    db.sequelize
      .query("SELECT * FROM Appointments WHERE doctor_id=" + doctorID + " AND year="+ year + " AND month=" + month+" AND day="+ day, {
        type: db.Sequelize.QueryTypes.SELECT,
      })
      .then(function (appointments) {

        let timeSlots = [];

        for (time of workingHours) {
          let show = true

          for(appointment of appointments) {
            if (time.hour == appointment.hour) {
              show = false
            }
          }
          if (show) {
            timeSlots.push(time)
          }
        }
        res.json(timeSlots);
      });
  });

  app.post("/api/createAppointment", function (req, res) {
    let year = req.body.year
    let month = req.body.month
    let day = req.body.day
    let hour = req.body.hour
    let doctorName = req.body.doctorName
    let clientName = req.body.clientName
    let healthcardNum = req.body.healthcardNum
    let height = req.body.height
    let weight = req.body.weight
    let currentMed = req.body.currentMed
    let checkup = req.body.checkup

    let str = month + "/" + day + "/" + year + " " + hour + ":00:00"


    let currentTime = Math.floor(Date.now() / 1000)
    db.sequelize
      .query("SELECT * FROM Appointments WHERE client_id=" + req.body.clientID + " AND timestamp > " + currentTime, { type: db.Sequelize.QueryTypes.SELECT })
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
            weight:weight,
            currentMed: currentMed,
            checkup:checkup
          })
            .then(function () {
              //res.redirect(307, "/api/login");
              res.json("Your appointment was created");
            })
            .catch(function (err) {
              console.log(err);
              res.status(401).json(err);
            });
        } else {
          res.json("You are already booked for an appointment")
        }

      });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {

      // db.sequelize
      // .query("SELECT * FROM Users WHERE id=" + req.user.id, { type: db.Sequelize.QueryTypes.SELECT })
      // .then(function (user) {
      //   res.json(user);
      // });
      
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id,
        role: req.user.role,
        name: req.user.name
      });
    }
  });


  app.get("/api/getDates", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      let calender = []
      for (i = 1; i < 8; i++) {
        moment().format("ll")
        let month = moment().add(i, "d").format("MMMM");
        let day = moment().add(i, "d").format("DD");
        let week = moment().add(i, "d").format("ddd");
  
        let yearNum = moment().add(i, "d").format("YYYY")
        let monthNum = moment().add(i, "d").format("M")
        let dayNum = moment().add(i, "d").format("D")
  
        let calenderObject = {
          name: week + " " + month + " " + day,
          year: yearNum,
          month: monthNum,
          day: dayNum
        }
        calender.push(calenderObject)
      } 
      res.json(calender)  
    }
  });

};

function toTimestamp(strDate){
  var datum = Date.parse(strDate);
  return datum/1000;
}


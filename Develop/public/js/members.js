let loggedIn = false;
let clientID;
let clientName;
let role;
let doctorID;
let day;
let doctorArray = [];
let daysArray = [];
let timeSlots = [];
let timeSlotID;

$(document).ready(function () {
  const doctorContainer = $("#doctors");
  const timesContainer = $("#times");
  const apptContainer = $("#appointment-form");
  const clientAppointment = $(".header");

  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page

  getUserData();

  function getUserData() {
    $.get("/api/user_data").then(function (data) {
      $(".member-name").text(data.name);
      clientID = data.id;
      clientName = data.name;
      role = data.role;
      getAppointments(data.role);
      getDoctors(data.role);
    });
  }

  function getAppointments(role) {
    $.post("/api/getUserAppointments", {
      id: clientID,
      role: role,
    }).then(function (data) {
      if (data) {
        if (data.role == "patient") {
          for (appointment of data.appointments) {
            clientAppointment.html(
              "<p> Your booked appointment on " +
                appointment.month +
                "/" +
                appointment.day +
                "/" +
                appointment.year +
                " at " +
                appointment.hour +
                ":00" +
                " with " +
                appointment.doctorName +
                "</p>"
            );
          }
        }
        if (data.role == "doctor") {
          console.log(data)
          for (appointment of data.appointments) {
            doctorContainer.append(

              ` 
              <div class="col-lg-6 col-sm-12 ">
              <div class="card border-success h-100 p-2 mt-2">
                <div class="card-body flex-column align-items-center">
              <div><h5> ${appointment.month}/${appointment.day}/${appointment.year} at ${appointment.hour}:00</h5></div>
              <div><p>Appointments with: <h4>${appointment.clientName}</h4></p>
             
              <ul>
                <li>Healthcard Number: ${appointment.healthcardNum}</li>
                <li>Height: ${appointment.height}</li>
                <li>Weight: ${appointment.weight}</li>                
                <li> Medication client taking: ${appointment.currentMed}</li>
                <li>The patient here for: ${appointment.checkup}</li>
              </ul>
              </div></div></div></div>`
            );
          }
        }
      }
    });
  }

  function getDoctors(role) {
    timesContainer.html("");
    if (role == "patient") {
      $.get("/api/getdoctors").then(function (data) {
        doctorArray = data;
        for (doctor of data) {
          doctorContainer.append(
            "<div class='col my-2'><div class='card bg-success h-100'><div id='showdocs' class='card-body text-light'><h5 class='card-title font-weight-bold'>" +
              doctor.name +
              "</h5><p>Gender: " +
              doctor.gender +
              "</p><p>Province: " +
              doctor.province +
              "</p><p>Email: <a class='text-warning' href=mailto:" +
              doctor.email +
              ">" +
              doctor.email +
              "</a></p><p>Phone number: <a class='text-warning' href=tel:" +
              doctor.phone +
              "> " +
              doctor.phone +
              "</a></p><button class='booknow btn btn-outline-light'id=" +
              doctor.name +
              " value=" +
              doctor.id +
              "> Book now</button></div></div></div>"
          );
        }
      });
    }
  }

  function getDays() {
    doctorContainer.html("");
    $.get("/api/getDates").then(function (data) {
      daysArray = data;
      for (index in daysArray) {
        timesContainer.append(
          "<div class='col my-2'><div class='card bg-success h-100'><div class='card-body text-light'><h5 class='card-title font-weight-bold'>" +
          daysArray[index].name +
          "</h5><button class='btn btn-outline-light' value='days' id=" +
            index +
            ">Select this date</button></div></div></div>"
        );
      }
      timesContainer.append("<div class='col my-2'><div class='card bg-primary h-100'><div class='card-body text-light'><h5 class='card-title font-weight-bold'>Select a different doctor</h5><a class='btn btn-outline-light' id='back'>Go Back</a></div></div></div>");
    });
  }

  function getSchedule(doctorID, dayID) {
    timesContainer.html("");
    let doctorName = getDoctorName(doctorID, doctorArray);
    day = daysArray[dayID];
    $.post("/api/getSchedule", {
      id: doctorID,
      year: day.year,
      month: day.month,
      day: day.day,
    }).then(function (data) {
      timesContainer.append("<div class='col my-2'><div class='card bg-white border-0 h-100'><div class='card-body text-success'><h3 id='doctor-name' class='card-title font-weight-bold'>" + doctorName + "'s availability:</h3></div></div></div>");
      timeSlots = data;
      if (timeSlots) {
        for (index in timeSlots) {
          timesContainer.append(
           "<div class='col my-2'><div class='card bg-success h-100'><div class='card-body text-light'><h5 class='card-title font-weight-bold'>" +
              timeSlots[index].name +
              "</h5><button type='submit' class='btn btn-outline-light' value='timeslot' id=" +
              index +
              ">Select this time</button></div></div></div>"
          );
        }
      } else {
        timesContainer.append("<h3 class='font-weight-bold text-center'>The doctor you have chosen is unavailable on this date</h3>");
      }

      timesContainer.append("<div class='col my-2'><div class='card bg-primary h-100'><div class='card-body text-light'><h5 class='card-title font-weight-bold'>Select a different doctor</h5><a class='btn btn-outline-light' id='back'>Go Back</a></div></div></div>");
    });
  }

  function showAppointmentForm() {
    timesContainer.html("");
    apptContainer.append(`<form class="appointment mt-1 text-success font-weight-bold">
      <div class="form-group">
        <label for="heaithcardnumber">Healthcard Number:</label>
        <input type="text" class="form-control" id="heaithcardnumber" aria-describedby="healthcardHelp" placeholder="1234-567-890-XX">
        <small id="questionHelp1" class="form-text text-muted">We'll never share your information with anyone else.</small>
      </div>
      <div class="form-group">
        <label for="height">Height:</label>
        <input type="text" class="form-control" id="height" aria-describedby="medicalQuestion" placeholder="Please enter your height">
        <small id="questionHelp2" class="form-text text-muted">Ex. 5'10</small>
      </div>
      <div class="form-group">
        <input type="text" class="form-control-inline" id="weightUnit" aria-describedby="medicalQuestion" placeholder="Weight in lbs">
       
      </div>
      <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="medicationCheck" onclick="showMedication()">
        <label class="form-check-label" for="medicationCheck"> Are you taking any medication?</label>
      </div>
      <div class="form-group" id="medicationList" style="display:none">
        <label for="medicationList">Please list any current or recent medication:</label>
        <input type="text" class="form-control" id="medicationListInput" aria-describedby="medicalQuestion" placeholder="Painkillers, Antibiotics, etc.">
        <small id="questionHelp4" class="form-text text-muted">Make sure to include everything so doctors can safely make recommendations.</small>
      </div>
      <div class="form-group">
        <label for="checkup">What brought you in today?</label>
        <select class="form-control" id="checkup">
          <option>General Check-Up</option>
          <option>Prescription Renewal</option>
          <option>Acute Pain</option>
          <option>Doctor's Note</option>
          <option>Referral</option>
        </select>
        <small id="questionHelp5" class="form-text text-muted">Check-Up, Prescriptions, etc.</small>
      </div>
      <button type="submit" class="btn btn-primary mb-3">Submit</button>
    </form>`);
    var heaithcardInput = $("#heaithcardnumber");
    var heightInput = $("#height");
    var weightInput = $("#weightUnit");
    var medicationListInput = $("#medicationListInput");
    var checkupInput = $("#checkup");
    var appointmentForm = $(".appointment")

    appointmentForm.on("submit", function (event) {
      event.preventDefault();
      var appointmentFormData = {
        healthcardNum: heaithcardInput.val().trim(),
        height: heightInput.val().trim(),
        weight: weightInput.val().trim(),
        currentMed: medicationListInput.val().trim(),
        checkup: checkupInput.val().trim(),
      }
      console.log(appointmentFormData)
      createAppointment(timeSlotID, appointmentFormData)
    });
  }
  
  function createAppointment(timeID, appointmentForm) {
    $.post("/api/createAppointment", {
      clientID: clientID,
      doctorID: doctorID,
      doctorName: getDoctorName(doctorID, doctorArray),
      clientName: clientName,
      year: day.year,
      month: day.month,
      day: day.day,
      hour: timeSlots[timeID].hour,
      healthcardNum: appointmentForm.healthcardNum,
      height: appointmentForm.height,
      weight: appointmentForm.weight,
      currentMed: appointmentForm.currentMed,
      checkup: appointmentForm.checkup
    }).then(function (data) {
      apptContainer.html("<img src='./assets/sick_teddy_bear.png' alt='A very sick teddy bear' class='img-fluid mb-3'/><h3 class='font-weight-bold text-success text-center'>" + data + "</h3>");
      timesContainer.append("<button id='back' class='btn btn-success'>Back</button>");
    });
  }

  doctorContainer.on("click", (event) => {
    let id = event.target.value;
    doctorID = id;
    getDays();
  });

  timesContainer.on("click", (event) => {
    let id = event.target.id;
    if (event.target.value == "days") {
      getSchedule(doctorID, id);
      return;
    }

    if (event.target.value == "timeslot") {
      timeSlotID = id;
      showAppointmentForm();
      return;
    }

    if (id === "back") {
      getDoctors(role);
      getAppointments(role);
      apptContainer.html("");
      return;
    }
  });
});

function getDoctorName(doctorID, array) {
  for (doctor of array) {
    if (doctor.id == doctorID) {
      return doctor.name;
    }
  }
}

function showMedication() {
  const medicationCheck = document.getElementById("medicationCheck")
  const medicationList = document.getElementById("medicationList")
  
  if (medicationCheck.checked == true){
      medicationList.style.display = "block";
  } else {
      medicationList.style.display = "none";
  }
}
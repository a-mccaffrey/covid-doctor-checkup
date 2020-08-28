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
            "<ul id='showdocs'><li><b>" +
              doctor.name +
              "</b></li><li>Gender: " +
              doctor.gender +
              "</li><li>Province: " +
              doctor.province +
              "</li><li>Email: <a href=mailto:" +
              doctor.email +
              ">" +
              doctor.email +
              "</a></li><li>Phone number: <a href=tel:" +
              doctor.phone +
              "> " +
              doctor.phone +
              "</a></li><button  class='booknow'id=" +
              doctor.name +
              " value=" +
              doctor.id +
              "> Book now</button></ul>"
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
          "<button value='days' id=" +
            index +
            ">" +
            daysArray[index].name +
            "</button>"
        );
      }
      timesContainer.append("<button id='back'>Back</button>");
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
      timesContainer.append("<h3><b>" + doctorName + "</b></h3>");
      timeSlots = data;
      if (timeSlots) {
        for (index in timeSlots) {
          timesContainer.append(
            "<button type='submit' class='btn btn-primary mt-auto time' value='timeslot' id=" +
              index +
              ">" +
              timeSlots[index].name +
              "</button>"
          );
        }
      } else {
        timesContainer.append("Doctor is unavailable on this date");
      }

      timesContainer.append("<button id='back'>Back</button>");
    });
  }

  function showAppointmentForm() {
    timesContainer.html("");
    timesContainer.append(`<form class="appointment">
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
      <button type="submit" class="btn btn-primary">Submit</button>
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
      timesContainer.html(data);
      timesContainer.append("<button id='back'>Back</button>");
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
      getAppointments(role)
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
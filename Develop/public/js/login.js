$(document).ready(function () {
  // Getting references to our form and inputs
  var loginForm = $("form.login");
  var emailInput = $("input#email-input");
  var passwordInput = $("input#password-input");

  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", function (event) {
    event.preventDefault();
    var userData = {
      email: emailInput.val().trim(),
      password: passwordInput.val().trim(),
    };

    if (!userData.email || !userData.password) {
      return;
    }

    // If we have an email and password we run the loginUser function and clear the form
    loginUser(userData.email, userData.password);
    emailInput.val("");
    passwordInput.val("");
  });

  // loginUser("admin@gmail.com", "admin");
  //loginUser("diana.liubarets@gmail.com", "12345")
  //loginUser("pushpi.sardana@gmail.com", "12345")
  //loginUser("Aisling.s.mccaffrey@gmail.com", "12345")
  //loginUser("liam.mackinnon@gmail.com", "12345")
  //loginUser("iqbal.sian@hotmail.com", "12345")
  //loginUser("drhui@drhui.com", "12345")

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(email, password) {
    $.post("/api/login", {
      email: email,
      password: password,
    })
      .then(function () {
        window.location.replace("/members");
        // If there's an error, log the error
      })
      .catch(function (err) {
        console.log(err);
      });
  }
});

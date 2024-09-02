// Function to open the popup
// function openPopup() {
//     var popup = document.getElementById("popup");
//     popup.style.display = "block"; // Show the popup
//   }
  
//   // Function to close the popup
//   function closePopup() {
//     var popup = document.getElementById("popup");
//     popup.style.display = "none"; // Hide the popup
//   }
  
//   // Function to send OTP (For demonstration purposes)
//   function sendOTP() {
//     // Here you would send the OTP to the provided phone number
//     // For demonstration purposes, we'll just display the OTP input field
//     var otpSection = document.getElementById("otpSection");
//     otpSection.style.display = "block"; // Show the OTP input field
//   }
  
//   // Function to verify OTP (For demonstration purposes)
//   function verifyOTP() {
//     // Here you would verify the OTP entered by the user
//     // If OTP is verified successfully, you can proceed to the next page
//     // For demonstration purposes, let's assume OTP is verified successfully
//     alert("OTP verified successfully! Proceeding to the next page...");
//     // Redirect to the next page where you can ask for more details
//     window.location.href = "Login1.html";
//   }
















  
//   // Event listener to open the popup after 5-6 seconds
//   document.addEventListener("DOMContentLoaded", function() {
//     setTimeout(openPopup, 5000); // 5000 milliseconds = 5 seconds
//   });
//   var remainingTries = 3; // Set the maximum number of tries

// function sendOTP() {
//   var phoneNumber = document.getElementById("phoneNumber").value;
//   var phoneNumberPattern = /^[0-9]{10}$/;
//   if (!phoneNumberPattern.test(phoneNumber)) {
//     alert("Please enter a valid 10-digit phone number.");
//     return;
//   }
//   // Your code to send OTP can go here
//   document.getElementById("otpSection").style.display = "block";
// }

// function verifyOTP() {
//   var enteredOTP = document.getElementById("otpInput").value;
//   if (enteredOTP === "204975") {
//     alert("OTP verified successfully!");
//     window.location.href = "Login1.html";
//     // Proceed with your logic after successful OTP verification
//     // For example, redirect to another page or perform some action
//   } else {
//     remainingTries--; // Decrease the remaining tries by 1
//     alert("Invalid OTP. Please try again. Remaining tries: " + remainingTries);
//     document.getElementById("otpInput").value = ""; // Clear the OTP input field
//     // Keep the OTP section displayed if remaining tries are more than 0
//     if (remainingTries > 0) {
//       document.getElementById("otpSection").style.display = "block";
//       document.getElementById("remainingTries").textContent = "Remaining tries: " + remainingTries;
//     } else {
//       alert("You have exhausted all attempts. Please try again later.");
//       // Reset the remaining tries and hide the OTP section
//       remainingTries = 3;
//       document.getElementById("otpSection").style.display = "none";
//       document.getElementById("remainingTries").textContent = "";
//     }
//   }
// }

// function closePopup() {
//   // Your code to close the popup can go here
// }
var remainingTries = 3; // Set the maximum number of tries

// Check if the user has already authenticated using cookies
if (!getCookie("authenticated")) {
  showPopup();
}

function showPopup() {
  var popup = document.getElementById("popup");
  popup.style.display = "block"; // Show the popup
}

function sendOTP() {
  var phoneNumber = document.getElementById("phoneNumber").value;
  var phoneNumberPattern = /^[0-9]{10}$/;
  if (!phoneNumberPattern.test(phoneNumber)) {
    alert("Please enter a valid 10-digit phone number.");
    return;
  }
  // Your code to send OTP can go here
  document.getElementById("otpSection").style.display = "block";
}

function verifyOTP() {
  var enteredOTP = document.getElementById("otpInput").value;
  if (enteredOTP === "204975") {
    alert("OTP verified successfully! Proceeding to the next page...");
    // Set a cookie to indicate authentication
    setCookie("authenticated", "true", 30); // Cookie expires in 30 days
    closePopup();
  } else {
    remainingTries--; // Decrease the remaining tries by 1
    alert("Invalid OTP. Please try again. Remaining tries: " + remainingTries);
    document.getElementById("otpInput").value = ""; // Clear the OTP input field
    // Keep the OTP section displayed if remaining tries are more than 0
    if (remainingTries > 0) {
      document.getElementById("remainingTries").textContent = "Remaining tries: " + remainingTries;
    } else {
      alert("You have exhausted all attempts. Please try again later.");
      remainingTries = 3;
      document.getElementById("otpSection").style.display = "none";
      document.getElementById("remainingTries").textContent = "";
      closePopup();
    }
  }
}

function closePopup() {
  var popup = document.getElementById("popup");
  popup.style.display = "none"; // Hide the popup
}

// Function to set a cookie
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
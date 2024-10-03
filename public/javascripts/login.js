document.addEventListener('DOMContentLoaded', () => {
    fetch('/check_login', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                window.location.href = '/home'; // Redirect to home if already logged in
            }
        })
        .catch(error => console.error('Error checking login status:', error));
});
// spinner design
function showLoading() {
    document.querySelector('.loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.querySelector('.loading-overlay').style.display = 'none';
}

// Handle form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    showLoading(); // Show loading overlay
    // Simulate a login process (you can remove this in production)
    setTimeout(hideLoading, 3000); // Hide after 3 seconds for demonstration
});





// pop 0f forgot password
function openModal() {
    document.getElementById("forgotPasswordModal").style.display = "block";
}

function closeModal() {
    document.getElementById("forgotPasswordModal").style.display = "none";
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById("forgotPasswordModal");
    if (event.target == modal) {
        closeModal();
    }
}
// Function to send OTP to email
async function sendOTP() {
    const email = document.getElementById("resetEmail").value;
    const emailButton = document.querySelector("#emailSection button");
    
    // Show spinner and disable button
    emailButton.disabled = true;
    emailButton.innerHTML = 'Sending OTP... <span class="spinner"></span>';

    try {
        const response = await fetch('/check-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById("message").innerText = result.message;
            document.getElementById("message").classList.remove('error');
            
            // Show OTP section and hide email section
            document.getElementById("emailSection").style.display = 'none';
            document.getElementById("otpSection").style.display = 'block';
        } else {
            document.getElementById("message").innerText = result.error;
            document.getElementById("message").classList.add('error');
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        document.getElementById("message").innerText = 'An error occurred. Please try again.';
        document.getElementById("message").classList.add('error');
    }

    // Hide spinner and enable button
    emailButton.disabled = false;
    emailButton.innerHTML = 'Send OTP';
}

// Function to verify OTP and update password
async function verifyOTP() {
    const email = document.getElementById("resetEmail").value;
    const otp = document.getElementById("otpInput").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const verifyOtpButton = document.querySelector("#otpSection button");

    // Validate new password and confirm password
    if (newPassword !== confirmPassword) {
        document.getElementById("message").innerText = 'Passwords do not match!';
        document.getElementById("message").classList.add('error');
        return;
    }

    if (newPassword.length < 6) {
        document.getElementById("message").innerText = 'Password must be at least 6 characters long!';
        document.getElementById("message").classList.add('error');
        return;
    }

    // Show spinner and disable button
    verifyOtpButton.disabled = true;
    verifyOtpButton.innerHTML = 'Verifying OTP... <span class="spinner"></span>';

    try {
        const response = await fetch('/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp, newPassword })
        });

        const result = await response.json();

        // Hide spinner and enable button
        verifyOtpButton.disabled = false;
        verifyOtpButton.innerHTML = 'Verify OTP';

        if (response.ok) {
            document.getElementById("message").innerText = 'Password updated successfully!';
            document.getElementById("message").classList.remove('error');
            
            // Show success message in a pop-up and close modal after 2 seconds
            setTimeout(() => {
                closeModal();
                alert('Password updated successfully!');
            }, 2000);
            // window.location.href='/login_home';
        } else {
            document.getElementById("message").innerText = result.error;
            document.getElementById("message").classList.add('error');
        }
    } catch (error) {
        console.error('Error verifying OTP or updating password:', error);
        document.getElementById("message").innerText = 'An error occurred. Please try again.';
        document.getElementById("message").classList.add('error');

        // Hide spinner and enable button in case of error
        verifyOtpButton.disabled = false;
        verifyOtpButton.innerHTML = 'Verify OTP';
    }
}


// error meassge show here ok
// Add event listener to the form submission
document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
  
    // Get the form data
    const formData = new FormData(event.target);
  
    try {
      // Send a POST request to the login endpoint
      const response = await fetch('/login', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        // Redirect to the home page
        window.location.href = '/home';
      } else {
        // Get the error message from the response
        const { error } = await response.json();
  
        // Add the error message below the form
        const errorMessage = document.createElement('div');
        errorMessage.textContent = error;
        errorMessage.classList.add('error-message');
        event.target.appendChild(errorMessage);
  
        // Add the red border to the email and password fields
        event.target.querySelector('input[name="email"]').classList.add('error');
        event.target.querySelector('input[name="password"]').classList.add('error');
      }
    } catch (error) {
      console.error(error);
    }
  });

const verifyButtons = document.querySelectorAll('.verify-btn');
const viewButtons = document.querySelectorAll('.view-btn');
const rejectButtons = document.querySelectorAll('.reject-btn');
const viewModal = document.getElementById('viewModal');
const rejectModal = document.getElementById('rejectModal');
const closeModals = document.querySelectorAll('.close');
const rejectForm = document.getElementById('rejectForm');
const spinner = document.querySelector('.spinner');

let currentProfileId;

verifyButtons.forEach(button => {
button.addEventListener('click', function() {
 currentProfileId = this.getAttribute('data-id');

 // Implement verification logic (e.g., send AJAX request to server)
 fetch(`/verify/${currentProfileId}`, {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json',
   },
 })
 .then(response => {
   if (response.ok) {
     alert("Verification successful!");
     window.location.reload(); // Reload the page to update the UI
   } else {
     alert("There was an error verifying the user.");
   }
 })
 .catch(error => {
   console.error('Error:', error);
   alert("There was an error verifying the user.");
 });
});
});

viewButtons.forEach(button => {
button.addEventListener('click', function() {
 currentProfileId = this.getAttribute('data-id');
 fetch(`/user_profile/${currentProfileId}`)
   .then(response => response.json())
   .then(data => {
     const userDetails = document.getElementById('userDetails');
     userDetails.innerHTML = `
       <p><strong>Name:</strong> ${data.name}</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Demat Account Number:</strong> ${data.dematAccountNumber}</p>
       <p><strong>DP ID:</strong> ${data.dpId}</p>
       <p><strong>Depository Participant:</strong> ${data.depositoryParticipant}</p>
       <p><strong>Depository:</strong> ${data.depository}</p>
       <p><strong>Aadhar Number:</strong> ${data.aadharNumber}</p>
       <p><strong>PAN Card:</strong> ${data.pancard}</p>
       <p><strong>Phone Number:</strong> ${data.phoneNumber}</p>
       <p><strong>Bank Name:</strong> ${data.bankName}</p>
       <p><strong>Account Number:</strong> ${data.accountNumber}</p>
       <p><strong>Branch:</strong> ${data.branch}</p>
       <p><strong>Nominees:</strong> ${data.nominees}</p>
       <p><strong>KYC Copy URL:</strong> ${data.kycCopyUrl || 'N/A'}</p>
     `;
     viewModal.style.display = "block";
   })
   .catch(error => {
     console.error('Error:', error);
     alert("Error fetching user details.");
   });
});
});

rejectButtons.forEach(button => {
button.addEventListener('click', function() {
 currentProfileId = this.getAttribute('data-id');
 rejectModal.style.display = "block";
});
});

closeModals.forEach(modal => {
modal.onclick = function() {
 viewModal.style.display = "none";
 rejectModal.style.display = "none";
};
});

window.onclick = function(event) {
if (event.target === viewModal || event.target === rejectModal) {
 viewModal.style.display = "none";
 rejectModal.style.display = "none";
}
};

rejectForm.addEventListener('submit', function(event) {
event.preventDefault();
spinner.style.display = 'inline-block';

const reason = document.getElementById('reason').value;

fetch(`/reject/${currentProfileId}`, {
 method: 'POST',
 headers: {
   'Content-Type': 'application/json',
 },
 body: JSON.stringify({ reason }),
})
.then(response => {
 if (response.ok) {
   alert("User rejected successfully!");
   window.location.reload();
 } else {
   alert("There was an error rejecting the user.");
 }
})
.catch(error => {
 console.error('Error:', error);
 alert("There was an error rejecting the user.");
})
.finally(() => {
 spinner.style.display = 'none';
 rejectModal.style.display = "none";
});
});

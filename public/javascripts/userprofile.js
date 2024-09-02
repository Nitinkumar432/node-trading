async function submitForm(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (result.success) {
            showPopup(); // Show success pop-up
            document.getElementById('userProfileForm').reset(); // Reset the form fields
        } else {
            alert('There was an error processing your request.');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your request.');
    }
}

function showPopup() {
    document.getElementById('successPopup').classList.remove('hidden');
}

function closePopup() {
    document.getElementById('successPopup').classList.add('hidden');
    window.location.href = '/'; // Redirect to home page after closing the pop-up
}
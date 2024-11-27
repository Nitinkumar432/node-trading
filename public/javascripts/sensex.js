// Data for companies (this can be dynamically passed from Node.js)
const companies = [
    { name: "Axis Bank", symbol: "AXISBANK", currentPrice: 1000.00, sector: "Finance" },
    { name: "Maruti Suzuki", symbol: "MARUTI", currentPrice: 8500.00, sector: "Automobile" },
    // Add other companies here...
];

// Function to generate the company cards
function generateCompanyCards() {
    const container = document.querySelector('.companies-container');
    companies.forEach((company) => {
        const card = document.createElement('div');
        card.classList.add('company-card');
        card.innerHTML = `
            <h3>${company.name}</h3>
            <p class="price">₹${company.currentPrice}</p>
            <div class="graph-container" id="graph-${company.symbol}"></div>
            <button onclick="showInvestmentModal('${company.name}', ${company.currentPrice})">Invest</button>
        `;
        container.appendChild(card);

        // Create a chart for the company price changes
        createGraph(`graph-${company.symbol}`, company.currentPrice);
    });
}

// Create the graph for each company
function createGraph(elementId, initialPrice) {
    const ctx = document.getElementById(elementId).getContext('2d');
    const data = {
        labels: Array.from({ length: 10 }, (_, i) => i + 1),
        datasets: [{
            label: 'Price Change',
            data: Array(10).fill(initialPrice),
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            tension: 0.4,
        }]
    };

    const options = {
        scales: {
            y: {
                beginAtZero: false,
                max: initialPrice + 1000,
                min: initialPrice - 1000,
            }
        }
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}

// Show investment modal
function showInvestmentModal(companyName, currentPrice) {
    document.getElementById('company-name').textContent = companyName;
    document.getElementById('current-price').textContent = currentPrice;

    const modal = document.getElementById('investment-modal');
    modal.style.display = 'flex';
}

// Close investment modal
document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('investment-modal').style.display = 'none';
});

// Handle investment
document.getElementById('invest-btn').addEventListener('click', () => {
    const quantity = document.getElementById('quantity').value;
    if (quantity && quantity > 0) {
        alert(`Invested in ${document.getElementById('company-name').textContent} for ₹${document.getElementById('current-price').textContent} with quantity: ${quantity}`);
        document.getElementById('investment-modal').style.display = 'none';
    } else {
        alert("Please enter a valid quantity.");
    }
});

// Initialize the page
generateCompanyCards();

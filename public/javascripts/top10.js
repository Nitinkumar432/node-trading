document.addEventListener("DOMContentLoaded", function() {
    const companies = [
        { rank: 1, name: "Apple Inc.", owner: "Tim Cook", marketCap: "$2.47T", currentPrice: "$171.14" },
        { rank: 2, name: "Microsoft Corporation", owner: "Satya Nadella", marketCap: "$2.43T", currentPrice: "$319.86" },
        { rank: 3, name: "Amazon.com Inc.", owner: "Andy Jassy", marketCap: "$1.61T", currentPrice: "$3,296.40" },
        { rank: 4, name: "Alphabet Inc.", owner: "Sundar Pichai", marketCap: "$1.53T", currentPrice: "$2,267.79" },
        { rank: 5, name: "Meta Platforms Inc.", owner: "Mark Zuckerberg", marketCap: "$1.09T", currentPrice: "$347.79" },
        // Add more companies as needed
    ];

    const tableBody = document.getElementById("companyTableBody");

    companies.forEach(company => {
        const row = document.createElement("tr");
        row.classList.add("company-row");
        row.innerHTML = `
            <td class="company-cell">${company.rank}</td>
            <td class="company-cell">${company.name}</td>
            <td class="company-cell">${company.owner}</td>
            <td class="company-cell">${company.marketCap}</td>
            <td class="company-cell">${company.currentPrice}</td>
            <td class="company-cell"><button class="buy-button" data-name="${company.name}">Buy</button></td>
        `;
        tableBody.appendChild(row);
    });

    // Buy button functionality
    document.querySelectorAll(".buy-button").forEach(button => {
        button.addEventListener("click", function() {
            const companyName = this.dataset.name;
            alert(`You have chosen to buy shares of ${companyName}`);
        });
    });
});

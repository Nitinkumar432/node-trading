const createEmailTemplate = (userName, subject, amount, totalFunds, transactionType) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #4CAF50;
                font-size: 24px;
            }
            p {
                line-height: 1.6;
                font-size: 16px;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #888;
            }
            .highlight {
                color: #4CAF50;
                font-weight: bold;
            }
            .terms {
                background-color: #e7f1ff;
                border-left: 4px solid #007BFF;
                padding: 10px;
                margin-top: 20px;
            }
            .terms h2 {
                font-size: 18px;
                color: #007BFF;
            }
            .terms ul {
                padding-left: 20px;
            }
            .button {
                background-color: #4CAF50;
                color: white;
                padding: 10px 15px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${subject}</h1>
            <p>Dear ${userName},</p>
            <p>Your funds have been successfully <span class="highlight">${transactionType}</span>.</p>
            <p><strong>Amount ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}:</strong> Rs ${amount}</p>
            <p><strong>Total Funds:</strong> Rs ${totalFunds}</p>
            <p>Thank you for using our service!</p>
            <a href="#" class="button">View Account</a>
  
            <div class="terms">
                <h2>Terms and Conditions</h2>
                <p>Please review our terms and conditions:</p>
                <ul>
                    <li>Funds added are subject to verification.</li>
                    <li>Withdrawal limits may apply based on your account type.</li>
                    <li>For more details, please visit our terms page.</li>
                </ul>
            </div>
  
            <p class="footer">Best Regards,<br>Your Support Team</p>
        </div>
    </body>
    </html>
    `;
  };
module.exports= createEmailTemplate;
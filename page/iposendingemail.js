const xy=`
<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 5px; max-width: 600px; margin: auto;">
    <h2 style="color: #333; text-align: center;">IPO Booking Confirmation</h2>
    <p style="font-size: 16px; color: #555;">Dear User,</p>
    <p style="font-size: 16px; color: #555;">
        Your request for IPO booking has been accepted.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Company</th>
            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Slots</th>
            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Bid Price</th>
            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Total Price</th>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${companyName}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${slots}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${bidPrice}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${totalPrice}</td>
        </tr>
    </table>
    <p style="font-size: 16px; color: #555; margin-top: 20px;">
        Thank you for your request!
    </p>
    <p style="font-size: 16px; color: #555;">Best regards,<br>Your Company Name</p>
</div>
`
module.exports=xy;
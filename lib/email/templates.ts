export const applicationApprovedTemplate = (name: string, paymentLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Inner Circle!</h1>
        <p>Hi ${name},</p>
        <p>We are thrilled to let you know that your application to join Inner Circle has been approved!</p>
        <p>To finalize your membership and gain access to our community, please complete your subscription setup:</p>
        <p><a href="${paymentLink}" class="btn">Activate Membership</a></p>
        <p>We can't wait to see you inside.</p>
        <p>Best,<br>The Inner Circle Team</p>
    </div>
</body>
</html>
`;

export const applicationRejectedTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <p>Hi ${name},</p>
        <p>Thank you for your interest in Inner Circle and for taking the time to apply.</p>
        <p>After careful review, we are unable to move forward with your application at this time. We receive many qualified applications and unfortunately can only accept a limited number of new members each month.</p>
        <p>We wish you the best in your professional journey.</p>
        <p>Best,<br>The Inner Circle Team</p>
    </div>
</body>
</html>
`;

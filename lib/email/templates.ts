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

export const introductionEmailTemplate = (
    nameA: string,
    nameB: string,
    reasoning: string,
    linkedinA?: string,
    linkedinB?: string
) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .footer { font-size: 0.8em; color: #777; margin-top: 20px; }
        .member-info { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .linkedin-link { color: #0077b5; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Inner Circle: You've been matched!</h1>
        <p>Hi ${nameA} and ${nameB},</p>
        <p>We are delighted to introduce you to each other. Based on our latest matching analysis, we think there's a fantastic opportunity for you to connect.</p>
        
        <div class="member-info">
            <strong>Why you were matched:</strong><br>
            ${reasoning}
        </div>

        <p>We encourage you to schedule a 15-30 minute introductory call to get to know each other and see how you might support one another's goals.</p>
        
        <p><strong>Profiles:</strong></p>
        <ul>
            <li>${nameA}: ${linkedinA ? `<a href="${linkedinA}" class="linkedin-link">LinkedIn Profile</a>` : 'No LinkedIn provided'}</li>
            <li>${nameB}: ${linkedinB ? `<a href="${linkedinB}" class="linkedin-link">LinkedIn Profile</a>` : 'No LinkedIn provided'}</li>
        </ul>

        <p>Happy networking!</p>
        
        <div class="footer">
            <p>Best Regards,<br>The Inner Circle Team</p>
        </div>
    </div>
</body>
</html>
`;

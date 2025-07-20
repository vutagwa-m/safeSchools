const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Set up transporter with your email provider
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com', // replace
    pass: 'your-app-password'     // replace
});

exports.sendReportNotification = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    const report = snap.data();

    const mailOptions = {
      from: 'SafeSchools <youremail@gmail.com>',
      to: 'admin@example.com', // replace with admin/support email
      subject: '🚨 New Student Report Submitted',
      text: `New report received:

Type: ${report.type}
Description: ${report.description}
Language: ${report.language}
Time: ${new Date(report.timestamp?.toDate()).toLocaleString()}

Please review the report in the Admin Panel.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully.');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  });

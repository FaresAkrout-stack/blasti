import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mohamedrhaiem16@gmail.com",
        pass: "xqtw ahcx dhpx orap", // Use App Password, NOT your Gmail password
    },
});

export default transporter;
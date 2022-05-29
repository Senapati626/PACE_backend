const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.send("Application is up and running.....")
})
app.post("/send_mail",cors(),async(req,res)=>{
    let {given_name,surname,email,contact_no,title_of_assignment,assignment_description} = req.body
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'vsentertainment7@gmail.com',
            pass: '7potpog!'
        }
    })
    let mailOptions = {
        from: 'vsentertainment7@gmail.com',
        to: email,
        subject: 'Projects And Content Experts: Confirmation Email',
        html: `
        <div syle="width:100%;margin:0;padding:0;font-family:sans-serif">
        <div class="header" style="width:100%;background-color:#1b1b1c;color:white;padding:2em">
            <h1>Thanks for choosing PACE</h1>
        </div>
        <div class="content" style="width:100%;padding:2em;background-color: #fdf5e2;">
            <p>Hi ${given_name},</p>
            <br>
            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eaque fuga repellendus ex alias consectetur facere magnam provident id corrupti iure doloribus, quos quae necessitatibus similique. Iusto architecto esse iure provident?</p>
        </div>
        </div>
            `,
        cc: 'neellohitsenapati626@gmail.com'
    }
    await transport.sendMail(mailOptions,(err,data)=>{
        if(err){
            console.log('error: ', err)
        }
        else{
            console.log(email,contact_no,given_name,surname,title_of_assignment,assignment_description)
        }
    })
})
























app.listen(process.env.PORT || 4000, ()=>{
    console.log("Server is running on port 4000")
})

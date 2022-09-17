const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(fileUpload());


const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'pace'
})

mysqlConnection.connect((err)=>{
    if(err){
        console.log("Database connection failed.",JSON.stringify(err))
    }
    else{
        console.log("Succesfully connected to database.")
    }
})

app.get("/",(req,res)=>{
    res.send("Application is up and running.....")
})
app.post("/send_mail",cors(),async(req,res)=>{
    let {given_name,email} = req.body;
    const transport = nodemailer.createTransport({
        service: 'gmail',
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let mailOptions = ()=>{
        return {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Welcome to the world of PACE',
        html: `
        <div>
        <div>
            <p>Hi ${given_name},</p>
            <p>Thanks for choosing PACE, we have recieved your order. One of our representatives will soon get in touch with you.</p>
            <p>Thanks and Regards,</p>
            <p>Team PACE</p>
        </div>
        </div>
        `}
    }
    await transport.sendMail(mailOptions(),(err,data)=>{
        if(err){
            console.log('error: ', err)
        }
        else{
            console.log('succesfully sent mail')
        }
    })
})
app.post("/send_mail_admin",cors(),async(req,res)=>{
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();
    let orderId = [];
    if(dd<10){
        dd = '0'+dd;
    }
    if(mm<10){
        mm = '0'+mm;
    }
    today = yyyy+'-'+mm+'-'+dd;
    let {given_name,surname,email,contact_no,title_of_assignment,assignment_description,deadline} = req.body
    // mysqlConnection.query('INSERT INTO orders (clientName,clientEmail,clientPhone,issueDate,deadlineDate,orderTitle,orderDescription) VALUES(?,?,?,?,?,?,?)',[given_name+' '+surname,email,contact_no,today,deadline,title_of_assignment,assignment_description],(err,rows,fields)=>{
    //     if(!err){
    //         orderId.push(rows.insertId);
    //         res.send("order added")
    //     }
    //     else{
    //         res.send("Cannot book order")
    //     }
    // })
    const transport = nodemailer.createTransport({
        service: 'gmail',
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let mailOptions = ()=>{
        return {
        from: process.env.MAIL_FROM,
        to: 'projectandcontentexperts@gmail.com',
        subject: 'Order Recieved',
        html: `
        <div>
        <div>
            <p>Hi Akash,</p>
            <p>Just Recieved a new order</p>
            <p><strong>Name- </strong>${given_name} ${surname}</p>
            <p><strong>Email- </strong>${email}</p>
            <p><strong>Contact- </strong>${contact_no}</p>
            <p><strong>Title- </strong>${title_of_assignment}</p>
            <p><strong>Description- </strong>${assignment_description}</p>
            <p><strong>Deadline- </strong>${deadline}</p>
        </div>
        </div>
        `}
    }
    await transport.sendMail(mailOptions(),(err,data)=>{
        if(err){
            console.log('error: ', err)
        }
        else{
            res.send("success")
        }
    })
})
app.get("/reviews",(req,res)=>{
    mysqlConnection.query('SELECT * FROM reviews',(err,rows,fields)=>{
        if(!err){
            res.send(rows)
        }
        else{
            console.log("Cannot fetch reviews",JSON.stringify(err))
        }
    })
})

app.get("/reviews/:id",(req,res)=>{
    mysqlConnection.query('SELECT * FROM reviews WHERE id=?',[req.params.id],(err,rows,fields)=>{
        if(!err){
            res.send(rows)
        }
        else{
            console.log("failed to fetch review#",req.params.id)
        }
    })
})

app.post("/reviews",(req,res)=>{
    let client = req.body.client;
    let desgn = req.body.designation;
    let review = req.body.review;
    mysqlConnection.query('INSERT INTO reviews (reviewer,designation,review) VALUES (?,?,?)',[client,desgn,review],(err,rows,fields)=>{
        if(!err){
            res.send("Review added")
        }
        else{
            console.log("Cannot add review",JSON.stringify(err))
        }
    })
})

app.put("/reviews/:id",(req,res)=>{
    let data = req.body;
    mysqlConnection.query('UPDATE reviews SET reviewer=?,designation=?,review=? WHERE id=?',[data.client,data.designation,data.review,req.params.id],(err,rows,fields)=>{
        if(!err){
            res.send("Review #"+req.params.id+" updated")
        }
        else{
            console.log("Cannot update review")
        }
    })
})

app.delete("/reviews/:id",(req,res)=>{
    mysqlConnection.query('DELETE FROM reviews WHERE id=?',[req.params.id],(err,rows,fields)=>{
        if(err){
            res.send("Failed to delete record")
        }
        else{
            res.send("Deleted Succesfully")
        }
    })
})


app.get("/orders",(req,res)=>{
    mysqlConnection.query('SELECT * FROM orders',(err,rows,fields)=>{
        if(!err){
            res.send(rows)
        }
        else{
            res.send(err)
        }
    })
})

app.put("/orders/:id",(req,res)=>{
    let data = req.body;
    mysqlConnection.query('UPDATE orders SET orderTopic=?,expert=?,progress=?,paymentStatus=?,price=?',[data.topic,data.expert,data.progress,data.paymentStatus,data.price],(err,rows,fields)=>{
        if(!err){
            res.send(rows)
        }
        else{
            console.log("Cannot update order",JSON.stringify(err))
        }
    })
})

app.delete("/orders/:id",(req,res)=>{
    mysqlConnection.query('DELETE from orders WHERE orderId=?',[req.params.id],(err,rows,fields)=>{
        if(!err){
            res.send("Deleted order #"+req.params.id)
        }
        else{
            res.send("cannot delete record")
        }
    })
})


app.post("/admin",(req,res)=>{
    let data = req.body
    if(data.username==='AkashKhatik' && data.password==="akash1234"){
        res.send(true)
    }
    res.send(false)
})













app.listen(process.env.PORT || 4000, ()=>{
    console.log("Server is running on port 4000")
})

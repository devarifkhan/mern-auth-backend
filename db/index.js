const mongoose= require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Database Connected");
}).catch(err=>{
    console.log("Error connecting to database",err);
});
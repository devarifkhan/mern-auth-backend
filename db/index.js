const mongoose= require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://arifcse209:eVmzXVPxS1W1hTNK@cluster0.yqdjk4p.mongodb.net/?retryWrites=true&w=majority').then(()=>{
    console.log("Database Connected");
}).catch(err=>{
    console.log("Error connecting to database",err);
});

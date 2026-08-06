if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
// console.log(process.env.SECRET); 

const express=require('express');
const app=express();
const Listing=require('./models/listing');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/asyncWrap.js");
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema} =require("./schema.js");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { MongoStore, createWebCryptoAdapter } = require('connect-mongo');
const flash =require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user.js");
const mongoose=require('mongoose');

app.use(cookieParser());

const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js")

let dbUrl = process.env.ATLASDB_URL;

main()
    .then(res=>{
        console.log("connected to db")
    })
    .catch(err=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl:process.env.ATLASDB_URL,
    cryptoAdapter: createWebCryptoAdapter({
        secret:process.env.SECRET,
    }),
    touchAfter : 24*3600,
});

store.on("error",(err)=>{
    console.log("error in mongo session store",err);
})

let sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    // add lifetime of cookie stored in session
    cookie:{
        expires : Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true,
    }
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride('_method'));


const path=require('path');

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

// app.use("/",(req,res)=>{
//     console.dir(req.cookies);
//     res.send("hi, I am root");
// })
app.use((req,res,next)=>{
    res.locals.message = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/demouser",async (req,res)=>{
    let newUser = new User({
        email:"student@gmail.com",
        username:"ayansh-student",
    });
    let registeredUser = await User.register(newUser,"helloworld");
    res.send(registeredUser);

})

app.use("/listings",listingRoute);
app.use("/listings/:id/reviews",reviewRoute);
app.use("/",userRoute);


app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err,req,res,next)=>{
    let {status=500,message="Something went Wrong"} = err;
    res.status(status).render("listings/error.ejs", { err});
})



// app.get("/testListing",async (req,res)=>{
//     let samplelisting = new Listing({
//         title:"My New Villa",
//         description:"By the Beaach",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India"
//     })
//     await samplelisting.save().then(res=>{console.log(res)}).catch(err=>{console.log(err)});
//     console.log("sample was saved");
//     res.send("successful testing");
// })

// app.get("/listings",(req,res)=>{
//     res.render('index.ejs',{});
// })

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});




const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const sequelize= require("./util/database");
const cors = require('cors');

const errorController = require("./controllers/error");
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');

const app = express();
app.use(cors());

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req,res,next)=>{
    User.findByPk(1)
    .then(user=>{
        req.user = user ;               ////sequel object and not js object
        next();                         ////going to next middleware 
    })
    .catch(err=> console.log(err))
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User , {constraints:true , onDelete:'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through:CartItem})

sequelize
.sync()
// .sync({force: true})
.then(result=>{
    return User.findByPk(1);
    
})
.then((user)=>{
    if(!user){
        return User.create({name:"sam" , email:"asdf@qweer.com"});
    }
    return user; 
})
.then(user =>{
    return user.createCart();
})
.then(cart=>{
    app.listen(3000);
})
.catch(err=>{
    console.log(err);
})

// app.listen(3000);

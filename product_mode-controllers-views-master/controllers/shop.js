const Product = require("../models/product");
const Cart = require("../models/cart");

let limit_items = 1 ;

exports.getProducts = (req, res, next) => {

  let page = req.query.page || 1 ;
  let totalItems ;

  Product.count().then(totalProducts=>{
    totalItems = totalProducts;
    return  Product.findAll({ offset : (page-1)*limit_items , limit:limit_items })
  })
   .then((products) => {
      res.status(200).json({products , success:true , 
        data:{
          currentPage: page ,
          hasNextPage: totalItems > page*limit_items ,
          hasPreviousPage: page>1 ,
          nextPage: +page+1 ,
          previousPage: +page-1,
          lastPage: Math.ceil(totalItems/limit_items)
        }})
      // res.render("shop/product-list", {
      //   prods: products,
      //   pageTitle: "All Products",
      //   path: "/products",
      // });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  // Product.findAll({where:{id:prodId}})
  // .then(product=>{
  //   res.render("shop/product-detail", {
  //     product: product[0], ///as fetch all returns array of products
  //     pageTitle: product[0].title,
  //     path: "/products",
  //   });
  // })
  // .catch()

  Product.findByPk(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  const page = req.query.page || 1 ;
  let totalItems ;

  Product.count().then(numProducts =>{
    totalItems = numProducts ;
    return Product.findAll({ offset: (page-1)*limit_items , limit: limit_items })
  })
  .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage:page,
        hasNextPage: totalItems > page*limit_items ,
        hasPreviousPage : page>1,
        nextPage : +page+1,
        previousPage : +page-1 ,
        lastPage: Math.ceil(totalItems/limit_items)
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      res.status(200).json(products);
    })
    .catch((err) => {
      res.status(400).json({error:true , message:'Error getting cart items '})
    });

  // res.render("shop/cart", {
  //   path: "/cart",
  //   pageTitle: "Your Cart",
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  if(!prodId){
    res.status(400).json({error:true , message: "product id is missing"})
  }
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
    
      if (product) {
        let oldquantity = product.cartItem.quantity ;
        newQuantity = oldquantity+1;
        return product;
      }
      return Product.findByPk(prodId)
    })
    .then(product=>{
      return fetchedCart.addProduct(product , {
        through : { quantity:newQuantity }
      })
    })
    .then(() => {
      res.status(200).json({success: true , message:'Successfully added product'})
    })
    .catch((err) => {
      res.status(500).json({success:false , message: 'some error occured'})
    });
  // res.redirect("/cart");
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};

exports.postDeleteProduct =(req,res,next)=>{
  let prodId = req.body.productId ;
  req.user.getCart()
  .then(cart=>{
    return cart.getProducts({ where : { id : prodId }});
  })
  .then(products=>{
     const product = products[0];
     return product.cartItem.destroy();
  })
  .then(()=>{
    res.redirect('/cart');
  })
  .catch(err=>{
    console.log(err);
  })
}
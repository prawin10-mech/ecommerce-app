const Product = require("../models/product");


let limit_items = 2;

exports.getProducts = (req, res, next) => {
  let page = req.query.page || 1;
  let totalItems;

  Product.count()
    .then((totalProducts) => {
      totalItems = totalProducts;
      return Product.findAll({
        offset: (page - 1) * limit_items,
        limit: limit_items,
      });
    })
    .then((products) => {
      res.status(200).json({
        products,
        success: true,
        data: {
          currentPage: page,
          hasNextPage: totalItems > page * limit_items,
          hasPreviousPage: page > 1,
          nextPage: +page + 1,
          previousPage: +page - 1,
          lastPage: Math.ceil(totalItems / limit_items),
        },
      });
      // res.render("shop/product-list", {
      //   prods: products,
      //   pageTitle: "All Products",
      //   path: "/products",
      // });
    })
    .catch((err) => {
      res
        .status(500)
        .json({  message: "Error getting products " });
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
  const page = req.query.page || 1;
  let totalItems;

  Product.count()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.findAll({
        offset: (page - 1) * limit_items,
        limit: limit_items,
      });
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: totalItems > page * limit_items,
        hasPreviousPage: page > 1,
        nextPage: +page + 1,
        previousPage: +page - 1,
        lastPage: Math.ceil(totalItems / limit_items),
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
      res
        .status(400)
        .json({ error: true, message: "Error getting cart items " });
    });

  // res.render("shop/cart", {
  //   path: "/cart",
  //   pageTitle: "Your Cart",
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  if (!prodId) {
    res.status(400).json({ error: true, message: "product id is missing" });
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
      // if (products.length > 0) {
      //   product = products[0];
      // }
      if (product) {
        let oldquantity = product.cartItem.quantity;
        newQuantity = oldquantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Successfully added product" });
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: "some error occured" });
    });
  // res.redirect("/cart");
};

exports.getOrder = (req, res, next) => {
  req.user.getOrders({include : ['products']})
  .then(orders=>{
    res.status(200).json(orders)
  })
  .catch(err=>{
    res.status(400).json('unable to fetch orders')
  })
};

exports.postOrder = (req, res, next) => {
  let fetchedCart ;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart ;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user.createOrder().then(order=>{
        order.addProducts(products.map(product => {
          product.orderItem = {quantity : product.cartItem.quantity}
          return product
        }))
      })
      .catch(err=>console.log(err))
    })
    .then(result=>{
      fetchedCart.setProducts(null);
      res.status(200).json({message:'successfully posted orders'})
    })
    .catch((err) => {
      res.status(500).json({message:'error posting orders'})
    });
};

exports.postDeleteProduct = (req, res, next) => {
  let prodId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.status(200).json("successfully deleted product from cart")
    })
    .catch((err) => {
      res.status(500).json("Error deleting product")
    });
};

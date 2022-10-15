const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  // two ways of adding userId

  // Product.create({
  // title:title,
  // imageUrl:imageUrl,
  // price:price,
  // description:description,
  //   userId : req.user.id   ///we stored user object in req.user
  // })

  ////we can use below method as we have defined user.hasmany(products)

  req.user.createProduct({
    title:title,
    imageUrl:imageUrl,
    price:price,
    description:description
  })
  .then(()=>{
    res.redirect('/');
  })
  .catch(err=>console.log(err))
  
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user.getProducts()
  // Product.findByPk(prodId)
  .then(products => {
    let product = products[0];
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  })
  .catch()
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
 
  Product.findByPk(prodId)
  .then(product=>{
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.description = updatedDesc ;

    return product.save();
  }).then(result=>{
    console.log(result);
    res.redirect('/admin/products');
  }).catch(err=>{
    console.log(err);
  })
 
};

exports.getProducts = (req, res, next) => {
  // Product.findAll()
  req.user
    .getProducts()
    .then(products=>{
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err=>{
     console.log(err);
    });  
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.destroy({where:{id:prodId}})       ///we can use this one or next one
  // .then(()=>{
  //   res.redirect('/admin/products');
  // })
  // .catch(err=>{
  //   console.log(err);
  // }) ; 

  Product.findByPk(prodId)
  .then(product=>{
    return product.destroy();
  }).then(result=>{
    console.log(result);
    res.redirect('/admin/products');
  })
  .catch(err=>{
    console.log(err);
  }) ; 
  
};

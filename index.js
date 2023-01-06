const cart_items = document.querySelector("#cart .cart-items");

const parentNode = document.getElementById("music-content");

const pagination = document.getElementById("pagination");

window.addEventListener("DOMContentLoaded", () => {
  console.log("loaded");

  let page = 1;
  getProducts(page);
});

function getProducts(page) {
  axios.get(`http://localhost:3000/products/?page=${page}`).then((products) => {
    showProductsOnScreen(products);
    showPagination(products.data.data);
  });
}

function showPagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  lastPage,
}) {
  pagination.innerHTML = "";

  if (hasPreviousPage) {
    const button1 = document.createElement("button");
    button1.innerHTML = previousPage;
    button1.addEventListener("click", () => getProducts(previousPage));
    pagination.appendChild(button1);
  }

  const button2 = document.createElement("button");
  button2.classList.add("active");
  button2.innerHTML = currentPage;
  button2.addEventListener("click", () => getProducts(currentPage));
  pagination.appendChild(button2);

  if (hasNextPage) {
    const button3 = document.createElement("button");
    button3.innerHTML = nextPage;
    button3.addEventListener("click", () => getProducts(nextPage));
    pagination.appendChild(button3);
  }
}

function showProductsOnScreen(products) {
  parentNode.innerHTML = "";

  products.data.products.forEach((product) => {
    const productHtml = `
                <div id="album-${product.id}">
                    <h3>${product.title}</h3>
                    <div class="image-container">
                        <img class="prod-images" src=${product.imageUrl} alt="">
                    </div>
                                    <div class="prod-details">
                        <span>$<span>${product.price}</span></span>
                        <button class="shop-item-button" type='button'>ADD TO CART</button>
                    </div>
                </div>`;
    parentNode.innerHTML = parentNode.innerHTML + productHtml;
  });
}

document.addEventListener("click", (e) => {
  if (e.target.className == "shop-item-button") {
    const prodId = Number(e.target.parentNode.parentNode.id.split("-")[1]);
    axios
      .post("http://localhost:3000/cart", { productId: prodId })
      .then((data) => {
        if (data.data.error) {
          throw new Error("Unable to add product");
        }
        showNotification(data.data.message, false);
      })
      .catch((err) => {
        console.log(err);
        showNotification(err, true);
      });
  }
  if (
    e.target.className == "cart-btn-bottom" ||
    e.target.className == "cart-bottom" ||
    e.target.className == "cart-holder"
  ) {
    getCartItems();
  }
  if (e.target.className == "cancel") {
    document.querySelector("#cart").style = "display:none;";
  }
  if (e.target.className == "purchase-btn") {
    if (parseInt(document.querySelector(".cart-number").innerText) === 0) {
      alert("You have Nothing in Cart , Add some products to purchase !");
      return;
    }
    axios
      .post("http://localhost:3000/create-order")
      .then((response) => {
        getCartItems();
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
    alert("Thank you! forshopping with us");
  }
});

function getCartItems() {
  axios
    .get("http://localhost:3000/cart")
    .then((carProducts) => {
      showProductsInCart(carProducts.data);
      document.querySelector("#cart").style = "display:block;";
    })
    .catch((err) => {
      console.log(err);
    });
}

function showProductsInCart(listofproducts) {
  let total = 0;
  cart_items.innerHTML = "";
  listofproducts.forEach((product) => {
    const id = `album-${product.id}`;
    const name = product.title;
    const img_src = product.imageUrl;
    const price = product.price;
    total = total + +price;
    document.querySelector(".cart-number").innerText =
      parseInt(document.querySelector(".cart-number").innerText) + 1;
    const cart_item = document.createElement("div");
    cart_item.classList.add("cart-row");
    cart_item.setAttribute("id", `in-cart-${id}`);
    cart_item.innerHTML = `
        <span class='cart-item cart-column'>
        <img class='cart-img' src="${img_src}" alt="">
            <span>${name}</span>
        </span>
        <span class='cart-price cart-column'>${price}</span>
        <form onsubmit='deleteCartItem(event, ${product.id})' class='cart-quantity cart-column'>
            <input type="text" value="1">
            <button>REMOVE</button>
        </form>`;
    cart_items.appendChild(cart_item);
  });

  document.querySelector(".total-price").innerText = total;
}
function deleteCartItem(e, prodId) {
  e.preventDefault();
  axios
    .post("http://localhost:3000/cart-delete-item", { productId: prodId })
    .then(() => removeElementFromCartDom(prodId));
}

function showNotification(message, iserror) {
  const container = document.getElementById("container");
  const notification = document.createElement("div");
  notification.style.backgroundColor = iserror ? "red" : "green";
  notification.classList.add("notification");
  notification.innerHTML = `<h4>${message}<h4>`;
  container.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 2500);
}

function removeElementFromCartDom(prodId) {
  document.getElementById(`in-cart-album-${prodId}`).remove();
  showNotification("Succesfuly removed product");
}

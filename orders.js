const orderContent = document.getElementById('order-content');

window.addEventListener('DOMContentLoaded', getOrderDetails)

async function getOrderDetails(){
    try {
        let result = await axios.get('http://localhost:3000/orders') ;
        console.log(result.data);
        if(result.data.length <= 0){
            orderContent.innerHTML = `No Orders Uptil now`
            
        }else{
            result.data.reverse().map(order=>{
                displayOrders(order);
            })
        }
    } catch (error) {
        console.log(error)
    }
}

function displayOrders(order){
    let newOrderDetail = `<div id=${order.id} class="order-style" ><h2>Order Id - ${order.id}</h2></div>`

    orderContent.innerHTML += newOrderDetail ;
  
    orderedProducts(order);
}

function orderedProducts(order){
    let orderList = document.getElementById(`${order.id}`);
    
    order.products.map(product=>{
        let items = `<ul><li><img src="${product.imageUrl}">  ${product.title}  x  ${product.orderItem.quantity}</li></ul>`
        orderList.innerHTML += items
    })
}
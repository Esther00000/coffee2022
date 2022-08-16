// navbar
const menuList = document.querySelector(".menu-list")
const hamBtn = document.querySelector(".ham-btn")
let buttons = []

// shopping cart
const cartOverlay = document.querySelector('.cart-overlay')
const cartBtn = document.getElementById('cart-btn')
const closeCartBtn = document.getElementById('close-cart')
const cartContent = document.querySelector('.cart-content')
const cartItemNum = document.querySelector('.cart-items-num')
const cartTotalPrice = document.querySelector('.cart-total')
const clearCartBtn = document.querySelector('.clear-btn')

// loading
let loadingPage = document.querySelector('.loadingPage')
let coffeeCup = document.querySelector('.coffee-cup')
let coffee = document.querySelector('.coffee')
let integradient = document.querySelector('.integradient')

let carts = []
let removeBtns = []


// GSAP Animation

let tl = gsap.timeline({
    default: false
})
gsap.registerPlugin(ScrollTrigger);




// products
const drinkBox = document.getElementById('drink')
const dessertBox = document.getElementById('dessert')





// event-------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded',() => {

    let products = new ProductData()
    let update = new Updata()

    update.menuShowHide()
    update.cartShowHide()
    update.useCartBtn()
    update.Animation()
    // update.loadingcssAni()
    


    products.getJSONproductData()
    .then(data => {update.productDisplay(data)})
    .then(() => {update.productAddToCart()})
   
})


 




// product model
class ProductData {
    async  getJSONproductData(){
        try{

            let res = await fetch('product.json')
            let data = await res.json()
            let drinks = data.drink
            let desserts = data.dessert
            drinks = drinks.map(item => {
                let productItem = {
                    id: item.pid,
                    title: item.details.title,
                    price: item.details.price,
                    image: item.details.image,
                    type: 'drink'
                }
                return productItem
            })
            desserts = desserts.map(item => {
                let productItem = {
                    id: item.sid,
                    title: item.details.title,
                    price: item.details.price,
                    image: item.details.image,
                    type: 'dessert'
                }
                return productItem
            })
        
            let productArr = [drinks,desserts]
            return productArr
        }
        catch(error){console.log(error)}
        
    }
}

// update UI
class Updata {

    showMenu() {
        menuList.classList.toggle("show-menu")
        hamBtn.classList.toggle("show-menu")
    }
    showCart() {
        cartOverlay.classList.add('show-cart')
    }
    hideCart() {
        cartOverlay.classList.remove('show-cart')
    }

    // execute
    menuShowHide(){
        hamBtn.addEventListener("click",this.showMenu)
    }

    cartShowHide(){
        cartBtn.addEventListener("click",this.showCart)
        closeCartBtn.addEventListener("click",this.hideCart)
    }

    productDisplay(item) {
        let drinkTemp = ''
        let dessertTemp = ''
        item.forEach(arr => {
            arr.forEach(product => {
                let single = `<div class="box">
                <div class="img-box">
                  <img src="${product.image}" alt="" />
                  <button class="bag-btn" data-name = "${product.type}${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    add to cart
                  </button>
                </div>
                <div class="product-name">${product.title}</div>
                <div class="price">NT$<span class="priceNum">${product.price}</span></div>
              </div>`
                if(product.type === 'drink'){
                    drinkTemp += single
                }else{
                    dessertTemp += single
                }
    
            })
        })
        drinkBox.innerHTML = drinkTemp
        dessertBox.innerHTML = dessertTemp
        let menu = gsap.utils.toArray(".product-container")
        gsap.timeline({
            default:{

            }
        })

       
        
    }

    productAddToCart() {
        let addToCartBtns = document.querySelectorAll('.bag-btn')
        addToCartBtns = [...addToCartBtns]
        buttons = addToCartBtns 
        buttons.forEach(btn => {
            let btnId = btn.dataset.name
            btn.addEventListener('click',(e) => {
                let productBtn = e.target
                let singleBox = productBtn.parentNode.parentNode  //box
                let productImg = singleBox.querySelector('img').getAttribute('src')
                let productName = singleBox.querySelector('.product-name').innerText
                let productPrice = singleBox.querySelector('.priceNum').innerText
                // 建立 購買商品 的  obj 放入 shopping cart
                let singleProduct = {
                    image: productImg,
                    title: productName,
                    price: productPrice,
                    amount: 1,
                    id: btnId
                }
                
                let isInCart = carts.find(item => {item.title === singleProduct.title})
                if(isInCart){
                    productBtn.innerHTML = `<i class="fas fa-shopping-cart"></i>
                    in cart`
                    productBtn.disabled = true
                }else{
                    // cliked button changing
                    productBtn.innerHTML = `<i class="fas fa-shopping-cart"></i>
                    in cart`
                    productBtn.disabled = true
                    // shopping cart all items display
                    this.cartItemDisplay(singleProduct)
                    this.showCart()
                    //計算 購買商品數量 及 總金額 by carts array
                    carts.push(singleProduct)
                    this.caculated(carts)  
                }
            
            })
        
        })
        
    }


    cartItemDisplay(singleProduct) {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
        <img src="${singleProduct.image}" alt="" />
        <div class="item-box">
            <h4>${singleProduct.title}</h4>
            <h5>$${singleProduct.price}</h5>
            <button class="remove-item" data-name = "${singleProduct.id}">remove</button>
        </div>
        <div class="count-box">
            <i data-name = "${singleProduct.id}" class="fa-solid fa-chevron-left"></i>
            <span class="item-amount">${singleProduct.amount}</span>
            <i data-name = "${singleProduct.id}" class="fa-solid fa-chevron-right"></i>
        </div>`
        cartContent.prepend(div)
        
    }

    // 計算 購買 總數量  總金額
    caculated(carts){
        let totalPrice = 0
        let totalItemNum = 0
        carts.map(item => {
            totalPrice += item.price * item.amount
            totalItemNum += item.amount
        })
        cartTotalPrice.innerText = totalPrice
        cartItemNum.innerText = totalItemNum
    }

    useCartBtn(){
        
        // clear all items
        clearCartBtn.addEventListener('click',() => {
            // 取得 cart Item 的 id 建立 array
            let cartsItemIdArr = carts.map(item => item.id)
            cartsItemIdArr.forEach(id => {
                // 從 carts array 中移除 item
                carts = carts.filter(item => item.id !== id)
                // 重新計算 carts array items total price & total item amount
                this.caculated(carts)

                

                this.hideCart()

                // ---- product btn  'in cart' => 'add to cart'
                let itemBtn = buttons.find(item => item.dataset.name === id)  //找出 與  carts 中 item 相應的 product btn
                itemBtn.disabled = false
                itemBtn.innerHTML = `<i class="fas fa-shopping-cart"></i>
                add to cart`

            })
            while(cartContent.children.length > 1) {
                cartContent.removeChild(cartContent.children[0])
            }
        })

        // shopping cart  single item  btn funtionality  (remove  , amount + / -)
        cartContent.addEventListener('click',(e) => {
            // remove btn
            if(e.target.classList.contains('remove-item')){
                let removeItemBtn = e.target    // <button class="remove-item" data-name = "${singleProduct.id}">remove</button>
                let id = removeItemBtn.dataset.name
                cartContent.removeChild(removeItemBtn.parentElement.parentElement)  //移除 點擊者的 cart-item

                // 把點擊的item 從 carts array 中 移除 
                carts = carts.filter(item => item.id !== id) // 從 carts array 中移除 item
                this.caculated(carts) // 重新計算 carts array items total price & total item amount
            }  // > amount increasing btn
            else if(e.target.classList.contains('fa-chevron-right')){
                let addAmountBtn = e.target
                let id = addAmountBtn.dataset.name
                let increaseItem = carts.find(item => item.id === id)  // 從 carts array 中 找出要 增加 數量的 item
                increaseItem.amount = increaseItem.amount + 1

                this.caculated(carts)

                addAmountBtn.previousElementSibling.innerText = increaseItem.amount

            } //< amount decrease btn
            else if(e.target.classList.contains('fa-chevron-left')){
                let minusAmountBtn = e.target
                let id = minusAmountBtn.dataset.name
                let decreaseItem = carts.find(item => item.id === id)  // 從 carts array 中 找出要 減少 數量的 item
                decreaseItem.amount = decreaseItem.amount - 1
                if(decreaseItem.amount > 0){
                    this.caculated(carts)
                    minusAmountBtn.nextElementSibling.innerText = decreaseItem.amount
                }else{
                    cartContent.removeChild(minusAmountBtn.parentElement.parentElement)  //移除 點擊者的 cart-item
                    // 把點擊的item 從 carts array 中 移除 
                    carts = carts.filter(item => item.id !== id) // 從 carts array 中移除 item
                    this.caculated(carts) // 重新計算 carts array items total price & total item amount
                }
            }
        })

    }

    // GSAP Animation

    homeAni() {
        tl.from("nav",{yPercent: -100 ,duration:0.5})
            .from(".title",{
                duration: 1,
                opacity: 0,
                y: 100,
                stagger: 1.5,
                delay: .5
            })
    }
    
    aboutAni() {
        gsap.from(".image-box",{
            duration: 1,
            opacity: 0,
            xPercent: -100,
            scrollTrigger:{
                trigger:".detail-container",
                start: "top 75%",
                end: "bottom 25%",
                toggleActions:"restart complete restart play",
                markers:false
            }
        })
        
        gsap.from(".content-box",{
            duration: 1,
            opacity: 0,
            xPercent: 100,
            scrollTrigger:{
                trigger:".detail-container",
                start: "top 75%",
                end: "bottom 25%",
                toggleActions:"restart complete restart play",
                markers:false
            }
        })
    }

    menuAni() {
        gsap.fromTo(".product-container",{
            yPercent: 100,
            opacity: 0
        },{
            "display": "grid",
            duration: 1.5,
            yPercent: 0,
            opacity: 1,
            stagger: .5,
            scrollTrigger:{
                trigger:".products",
                start: "top 60%",
                end: "bottom 25%",
                toggleActions:"restart complete none none",
            }
        })
    }

    footerAni() {
        let contactChildren = document.querySelector('.contact-container').children;
        let footer = document.querySelectorAll("footer > .container > div");
        gsap.from([contactChildren,footer],{
            duration: 1.5,
            yPercent: 300,
            scale: 0,
            stagger: 1,
            scrollTrigger:{
                trigger: '#contact',
                start: "top center",
                toggleActions:"restart complete none none"
            }
        })

    }

    loadingcssAni() {
        let percent = 0
        let timer = setInterval(() => {
            integradient.style.height = `${percent}%`
            percent+=0.99
            if(percent>=100) {
                // loadingPage.classList.add('complete')
                clearInterval(timer)
            }
        },100)
    }

    Animation() {
        tl.call(this.loadingcssAni)
          .to(".coffee-cup",{rotation: 360,scale: 0,duration: 1},'>9')
          .to(".loading-text",{scale: 0,duration: 1},'<')  // '<'在上一個動畫 開始處 插入此動畫   與上一個動畫一起開始
          .to(".loadingPage",{y:"200%","display": "none",duration: .5})
          .call(this.homeAni)
          .call(this.aboutAni)
          .call(this.menuAni)
          .call(this.footerAni)


    }

}






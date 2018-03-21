class Cart extends REST {
  constructor(app) {
    super();
    this.app = app;
    this.cartItems = [];
    if (this.app instanceof App){
      this.getCartItems();
      
    }
  }

  async getCartItems() {
    let all = new All();
    await this.loadCart();
    for (let item of this.app.shoppingCart) {
      let searchObj = await all.getResult({_id: item._id});
      searchObj = searchObj[0].result;
      searchObj.quantity = item.quantity;
      if (searchObj.stockBalance - item.quantity < 0) searchObj.stockWarning = true;
      this.cartItems.push(new CartItem(searchObj, this));
  }
    // if statement to not render on startpage.
    if(location.pathname == '/kassa'){
      $('main').empty();
      this.render();
    }
    this.saveCart();
  }

  async loadCart(){
    let userId = (await UserHandler.check()).info.query;
    let cart = (await Cart.findOne({userId: userId}));
    if (this.app.shoppingCart.length === 0 && cart){
      this.app.shoppingCart = cart.app.items
      this.app.header.render()
    }
  }

  getTotalPrice(){
    let totalPrice = 0;
    for (let cartItem of this.cartItems) {
      totalPrice += cartItem.price * cartItem.quantity;
    }
    return totalPrice;
  }

  getTotalVat(){
    let totalVat = 0;

    for (let cartItem of this.cartItems) {
      // Calculating vat off the set price
      if (cartItem.vatRate == 6) {
        totalVat += (cartItem.price * 0.0566) * cartItem.quantity;
      } else if (cartItem.vatRate == 12) {
        totalVat += (cartItem.price * 0.1071) * cartItem.quantity;
      } else {
        totalVat += (cartItem.price * 0.2) * cartItem.quantity;
      }
    }
    totalVat = Math.round( totalVat * 10 ) / 10;
    if (totalVat == 0){return totalVat;}
    if (totalVat % 1 != 0) {
      return totalVat += '0';
    } else {
      return totalVat;
    }
  }

  getTotalPriceExVat(){
    let totalPrice = this.getTotalPrice();
    let totalVat = this.getTotalVat();
    return totalPrice - totalVat;
  }

  approveCustomerData() {
     return true;
  }

  async saveCart() {
    let userId = await UserHandler.check();
    userId = userId.info.query;
    let alreadyExists = (await Cart.findOne({userId: userId}));
    // Check if there is a cart with logged in user
    if (alreadyExists) {
      return await this.save({
        userId: userId,
        items: this.app.shoppingCart
      });
    } else {
      return await Cart.create({
        userId: userId,
        items: this.app.shoppingCart
      });
    }

  }

  async confirmOrder() {

    if(this.app.shoppingCart.length !== 0 && this.approveCustomerData()) {

      this.app.shoppingCart = [];
      this.cartItems = [];

      let order = await Order.create({
      orderno: 123,
      products: ["String"],
      status: "String",
      orderdate: Date.now(),
      customerid: "String",
      price: 123,
      vat: Number
    } );
      order.result.email = $('#user-email').val();
      order.result.orderdate = order.result.orderdate.substring(0,10);
      this.sendMail(order.result);
      this.sendMail(order);
      $('#confirmorder').modal('show');
    }

  }

  click () {
    if ($(event.target).hasClass('confirmorder')) {
      this.confirmOrder();
    }
  }

  sendMail(order){
      console.log(order);
      let body = {
        orderdate: order.orderdate,
        email: order.email,
        orderno: order.orderno,
        username: order.customerid,
        products: order.products,
        totalprice: order.price
      };

      let reqObj = {
        url: `/send-mail`,
        method: 'POST',
        data: JSON.stringify(body),
        dataType: 'json',
        processData: false,
        contentType: "application/json; charset=utf-8"
      };
      $.ajax(reqObj);
  }


}

class Admin extends REST {
    constructor(app) {
      super();
      this.app = app;
      this.getOrders({});
      this.clickEvents();
      this.changeOrderStatus();
    }

    async getOrders(searchObj) {
      this.orders = await Order.find(searchObj);    
        
      for (const order of this.orders) {
        this.order = order;
        this.order.result.orderdate = this.order.result.orderdate.substring(0,10);
        this.render('.orderList',2);
        this.render(`#progress-${this.order.result._id}`, 3);
        this.orderStatus(this.order.result.status);
      }
    }

    clickEvents(){
      $(document).on('click', '#orderDetails', function( event ) {
        let state = $(event.target).attr('value');
        state == 'Open'? $(event.target).attr('value', 'Close').text('Stänga detaljer') : $(event.target).attr('value', 'Open').text('Öppna detaljer')
      });
    }

    orderStatus(status){
      switch(status){
        case 'Mottagen': 
          $(`#orderStatus-1-${this.order.result._id}`).addClass('d-block');
          break;
        case 'Behandlad': 
          $(`#orderStatus-1-${this.order.result._id}`).addClass('d-block');
          $(`#orderStatus-2-${this.order.result._id}`).addClass('d-block');
          break;
        case 'Skickad': 
          $(`#orderStatus-1-${this.order.result._id}`).addClass('d-block');
          $(`#orderStatus-2-${this.order.result._id}`).addClass('d-block');
          $(`#orderStatus-3-${this.order.result._id}`).addClass('d-block');
          break;
        case 'Levererad': 
          $(`#orderStatus-1-${this.order.result._id}`).addClass('d-block');
          $(`#orderStatus-2-${this.order.result._id}`).addClass('d-block');
          $(`#orderStatus-3-${this.order.result._id}`).addClass('d-block');
          $(`#orderStatus-4-${this.order.result._id}`).addClass('d-block');
          break;
      }
    }

    changeOrderStatus(){
      let that = this;
      $(document).on('click', '.changeOrderStatus', function( event ) {
        let idToChange = $(event.target).attr('id').split('-')[1];
        console.log(idToChange);
        
        $(document).on('click', `#changeOrderStatusOption-${idToChange} button`, function( event ) {
        console.log('woop');
         that.order.result._id = idToChange;
         let status = $(event.target).text();
         $(`#progress-${idToChange}`).empty();
         that.render(`#progress-${idToChange}`, 3);
         that.orderStatus(status);
         that.orderUpdate(idToChange, status);
         $(`#status-title-${idToChange}`).empty();
         $(`#status-title-${idToChange}`).text(status);
        });
      });

      
    }

    async orderUpdate(idToChange, status){
      this.orderToUpdate = this.orders.find( orderSelected => 
        orderSelected.result._id == idToChange );

      this.orderToUpdate.result.status = status;
      return await this.order.save(this.orderToUpdate);
        
    }
  }
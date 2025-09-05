import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }


  // Listagem -----------------------------------------------------
  @Get("listPrices")
  async listPrices(): Promise<any> {
    return this.appService.listPrices();
  }

  @Get("listClients")
  async listClients(): Promise<any> {
    return this.appService.listClients();
  }

  @Get("listSessions")
  async listSession(): Promise<any> {
    return this.appService.listSessions();
  }

  @Get('listProducts')
  async listProducts(): Promise<any> {
    return this.appService.listProducts();
  }

  @Get('listSubscription')
  async listSubscription(): Promise<any> {
    return this.appService.listSubscription();
  }
  // ---------------------------------------------------------------


  // Create checkout sessions subscription -------------------------
  @Get('createSession')
  async createSessionStripe(): Promise<any> {

    return await this.appService.createStripeSession();
  }

  @Get('createSession/:cus_id')
  async createSessionStripeWithId(@Param('cus_id') customerID: string): Promise<any> {
    return await this.appService.createStripeSessionWithCustomerId(customerID);
  }
  // ---------------------------------------------------------------

  @Get('updateSession/:sub_id/:subscription_item_id/:update_price_id')
  async updateSession(
    @Param('sub_id') subscriptionID: string,
    @Param('subscription_item_id') subscriptionItemID,
    @Param('update_price_id') update_price_id
  ) {

    if (
      !subscriptionID.trim() ||
      !subscriptionItemID.trim() ||
      !update_price_id.trim()
    )
      return

    return this.appService.updateSubscription(
      subscriptionID,
      subscriptionItemID,
      update_price_id
    );
  }

  @Get('cancelSubscription/:sub_id')
  async cancelSubscription(
    @Param('sub_id') subscriptionID: string,
  ) {

    if (!subscriptionID.trim())
      return

    return this.appService.cancelSubscription(
      subscriptionID,
    );
  }

}

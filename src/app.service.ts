import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class AppService implements OnModuleInit {

  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get('STRIPE_KEY');
    if (apiKey)
      this.stripe = new Stripe(apiKey);
  }

  private printData(print: boolean, data: any) {

    if (print)
      console.log(data);
  }

  // Listagem de usuários -----------------------------------------
  async listPrices(print: boolean = true) {

    // expand é uma opção muito útil para pegar dados relacionados de uma vez só
    const prices = await this.stripe.prices.list({
      expand: ["data.product"]
    });
    this.printData(print, prices);
    return prices;
  }

  async listSessions(print: boolean = true) {

    const sessions = await this.stripe.checkout.sessions.list();
    this.printData(print, sessions);
    return sessions;
  }

  async listClients(print: boolean = true) {

    const clients = await this.stripe.customers.list();
    this.printData(print, clients);
    return clients;
  }

  async listProducts(print: boolean = true) {

    const products = await this.stripe.products.list();
    this.printData(print, products);
    return products;
  }

  async listSubscription(print: boolean = true) {

    const subscriptions = await this.stripe.subscriptions.list();
    this.printData(print, subscriptions);
    return subscriptions;

  }

  //---------------------------------------------------------------

  // Create session subscription -------------------------------------------
  private async stripeSessionCreationOption(extraArgs?: any) {
    const prices = await this.listPrices(false);
    const stripeCreationOption: Stripe.Checkout.SessionCreateParams | undefined = {
      // Mudar para required depois
      billing_address_collection: 'auto',
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        }
      ],
      mode: 'subscription',
      success_url: 'https://accesssecurity.com.br/',
      cancel_url: 'https://sitedefender.com.br/',
      ...(extraArgs ?? {}) 
    }
    return stripeCreationOption;
  }

  // Without customer id
  async createStripeSession() {

    const stripeSessionCreation = await this.stripeSessionCreationOption();

    const stripeSession = await this.stripe.checkout.sessions.create(
      stripeSessionCreation
    );

    return stripeSession;
  }

  // With customer id
  async createStripeSessionWithCustomerId(customerID) {

    const stripeSessionCreation = await this.stripeSessionCreationOption(
      {customer: customerID}
    );

    console.log(stripeSessionCreation);

    const stripeSession = await this.stripe.checkout.sessions.create(
      stripeSessionCreation
  );

    return stripeSession;
  }
  // -------------------------------------------------------------------

  // Update subscription operation -------------------------------------
  async cancelSubscription(subscriptionID: string) { 
    const subscription = await this.stripe.subscriptions.cancel(subscriptionID);

    return subscription;
  }

  async updateSubscription(subscriptionID: string, subscriptionItemID: string, updatePlanID: string) {
    const subscription = await this.stripe.subscriptions.update(
      subscriptionID,
      {
        items: [{
          id: subscriptionItemID,
          price: updatePlanID
        }],
        proration_behavior: 'create_prorations'
      }
    );
    return subscription;
  }
  //--------------------------------------------------------------------

}

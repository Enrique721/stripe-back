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

  // Listagem -----------------------------------------------------
  async listPrices(print: boolean = true) {

    // expand é uma opção muito útil para pegar dados relacionados de uma vez só
    const prices = await this.stripe.prices.list({
      expand: ["data.product"]
    });
    this.printData(print, prices);

    const pricesDataIDs = prices.data.map((price) => { return { id: price.id, unit_amount: price.unit_amount } });
    return pricesDataIDs;
  }

  async listSessions(print: boolean = true) {

    const sessions = await this.stripe.checkout.sessions.list();
    this.printData(print, sessions);

    const sessionsIDs = sessions.data.map((session) => { return { id: session.id, status: session.status } });
    return sessionsIDs;
  }

  async listClients(print: boolean = true) {

    const clients = await this.stripe.customers.list();
    this.printData(print, clients);

    const clientIDs = clients.data.map((client) => { return { id: client.id, name: client.name } });
    return clientIDs;
  }

  async listProducts(print: boolean = true) {

    const products = await this.stripe.products.list();
    this.printData(print, products);

    const productIDs = products.data.map((product) => { return { id: product.id, name: product.name } });
    return productIDs;
  }

  async listSubscription(print: boolean = true) {

    const subscriptions = await this.stripe.subscriptions.list();
    this.printData(print, subscriptions);

    const subscriptionIDs = subscriptions.data.map((subscription) => {
      return {
        id: subscription.id,
        status: subscription.status,
        trial_end: subscription.trial_end,
        items: subscription.items.data.map((item) => { return { id: item.id } })
      }
    });
    return subscriptionIDs;

  }

  //---------------------------------------------------------------

  // Create session subscription -------------------------------------------
  private async stripeSessionCreationOption(extraArgs?: any) {
    const prices = await this.listPrices(false);

    const priceFree = prices.find((price) => price.unit_amount === 0);
    const pricePaid = prices.find((price) => price.unit_amount !== 0);

    if (!priceFree || !pricePaid)
      return;

    const stripeCreationOption: Stripe.Checkout.SessionCreateParams | undefined = {
      // Mudar para required depois
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceFree.id,
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

    const stripeSession = await this.stripe.checkout.sessions.create(
      stripeSessionCreation
  );

    return stripeSession;
  }

  async createStripeSessionNoCard() {

    const priceId = (await this.listPrices()).find((price) => price[1] === 0);

    const customer = await this.stripe.customers.create({
      name: "Opal2",
      email: "umemailqualquer@alkdjslakdjs.com"
    });

    if (!priceId)
      return

    const customerID = customer.id;
    
    const subscription = await this.stripe.subscriptions.create({
      customer: customerID,
      items: [{ price: (priceId[0] as string) }],
    });
    return subscription;
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

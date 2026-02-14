import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function constructWebhookEvent(
  body: string,
  signature: string,
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}

export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // TODO: Update subscription record in database
  console.log('Subscription created:', subscription.id);
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // TODO: Update subscription status
  console.log('Subscription updated:', subscription.id);
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // TODO: Mark subscription as canceled
  console.log('Subscription deleted:', subscription.id);
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // TODO: Update billing records
  console.log('Invoice paid:', invoice.id);
}

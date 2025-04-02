import Stripe from 'stripe';
import { supabase } from '../../lib/supabaseClient'; // Adjust the import path as needed
import { generateUuid } from '../../lib/uuid'; // Optional: Helper function for generating UUID

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-08-01' });

export async function POST(req) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  // Verify the webhook signature
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log('✅ Webhook event verified');
  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log('==================================================');
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Payment successful:');

      // Ensure subscription exists in the session
      if (!session.subscription) {
        console.error('No subscription ID found in session.');
        return new Response(JSON.stringify({ error: 'No subscription ID found.' }), { status: 400 });
      }

      // Fetch subscription details
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      const currentPeriodStart = subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : null;

      const currentPeriodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;

      const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;

      // Get the latest invoice
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);

      // Get receipt URL (from the charge object)
      const charge = invoice.charge ? await stripe.charges.retrieve(invoice.charge) : null;

      // Retrieve the payment intent
      const intent = await stripe.charges.retrieve(invoice.charge);

      const uuid = generateUuid(); // Generate a unique UUID for the subscription entry

      // Save payment details to your Supabase database
      const { data, error } = await supabase.from('payments').insert({
        payment_id: uuid,
        user_id: 'user_id_placeholder', // Replace with actual user ID
        payment_amount: (session.amount_total || 0) / 100, // Convert cents to dollars
        payment_provider: 'stripe',
        payment_status: session.payment_status || 'pending',
        transaction_id: session.id,
        credits: '100',
        remarks: 'Payment for ' + (session.metadata?.description || 'purchase'),
        customer_id: session?.customer || null,
        invoice_id: invoice?.id || null,
        receipt_url: charge?.receipt_url || null,
        payment_intent_id: intent?.payment_intent || null,
      });

      if (error) {
        console.error('❌ Failed to save payment:', error);
        return new Response(JSON.stringify({ received: true, message: 'Payment details not saved in DB' }), { status: 500 });
      }

      console.log('📌 Saved payment to DB:', data);
      break;

    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
  }

  // Send a 200 response to Stripe to acknowledge the event
  return new Response(JSON.stringify({ received: true, message: 'Payment successful, data saved in DB' }), { status: 200 });
}

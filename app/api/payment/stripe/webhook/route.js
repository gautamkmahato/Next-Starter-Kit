// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto'; // For generating UUID 

// --- Stripe Initialization ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// --- Supabase Initialization ---
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
  // Consider more graceful handling in production
}
// Create a single Supabase client instance (can be reused)
// Use Service Role key for admin-level access from the backend
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// --- Webhook Config ---
export const config = {
  api: {
    bodyParser: false,
  },
};

// --- POST Handler ---
export async function POST(req) {
  console.log('Stripe webhook received!');

  if (!webhookSecret) {
    console.error('⚠️ Stripe webhook secret not found.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    console.error('⚠️ Missing Stripe signature header');
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log('✅ Stripe signature verified.');
  } catch (err) {
    console.error(`❌ Error verifying webhook signature: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`Processing event: ${event.id}, type: ${event.type}`);

  // --- Event Handling Logic ---
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`Checkout session ${session.id} completed! Payment Status: ${session.payment_status}`);

        // Only process if payment was successful
        if (session.payment_status === 'paid') {
          const checkoutSessionId = session.id;

          // --- Idempotency Check ---
          // Prevent processing the same event multiple times
          const { data: existingPayment, error: checkError } = await supabaseAdmin
            .from('payments') // Your table name
            .select('payment_id')
            .eq('transaction_id', checkoutSessionId) // Use a unique ID from the event
            .maybeSingle();

          if (checkError) {
            console.error('Supabase check error:', checkError.message);
            // Decide if you should still proceed or return an error
            // For now, we'll log and proceed, but you might want to return 500
          }

          if (existingPayment) {
            console.log(`🔁 Event ${event.id} already processed for session ${checkoutSessionId}. Skipping.`);
            return NextResponse.json({ received: true, message: 'Already processed' }, { status: 200 });
          }
          // --- End Idempotency Check ---


          // --- Retrieve associated data (optional but good for details) ---
          let paymentIntent = null;
          let charge= null;
          let receiptUrl = null;

          // Fetch subscription details
          const subs = await stripe?.subscriptions.retrieve(session?.subscription);
          const invoice = await stripe?.invoices.retrieve(subs?.latest_invoice);

          if (session.payment_intent) { 
            try {
                paymentIntent = await stripe.paymentIntents.retrieve(
                    session.payment_intent,
                    { expand: ['latest_charge'] } // Expand to get charge details
                );
                if (paymentIntent.latest_charge) {
                    // The charge object might be nested or directly available depending on expansion
                    charge = paymentIntent.latest_charge;
                    receiptUrl = charge.receipt_url;
                 }
            } catch (retrieveError) {
                console.warn(`⚠️ Could not retrieve Payment Intent ${session.payment_intent}: ${retrieveError.message}`);
                // Continue without receipt URL if retrieval fails
            }
          }


          // --- Prepare Data for Supabase ---
          const paymentData = {
            payment_id: crypto.randomUUID(), // Generate a new UUID
            user_id: '6b047557-e0e4-4da2-8074-6b02bbd329f9', // Ensure client_reference_id is set during checkout creation
            payment_amount: (session.amount_total || 0) / 100, // Convert from cents/smallest unit
            payment_provider: 'stripe',
            payment_status: session.payment_status, // Should be 'paid' here
            transaction_id: checkoutSessionId, // Stripe Checkout Session ID
            credits: 100, // Hardcoded as per your example - **Review this:** Should this be dynamic based on metadata or line items?
            remarks: session.metadata?.description || 'Stripe Purchase', // Get from metadata if set
            customer_id: typeof session.customer === 'string' ? session.customer : null, // Stripe Customer ID (cus_xxx)
            // Use the invoice ID string if available
            invoice_id: typeof session.invoice === 'string' ? session.invoice : null, // Stripe Invoice ID (in_xxx)
            receipt_url: invoice?.hosted_invoice_url || null, // From the expanded charge object
            payment_intent_id: typeof session.payment_intent === 'string' ? invoice?.payment_intent : null, // Stripe Payment Intent ID (pi_xxx)
            // 'created_at' can often be handled by Supabase column default (DEFAULT now())
            // created_at: new Date().toISOString(), // Or set explicitly
          };

          console.log('Attempting to insert payment data:', paymentData);

          // --- Insert into Supabase Database ---
          const { error: insertError } = await supabaseAdmin
            .from('payments') // Your table name
            .insert([paymentData]);

          if (insertError) {
            console.error('❌ Supabase insert error:', insertError.message);
            // Consider returning 500 to signal failure to Stripe, which might retry
            return NextResponse.json({ error: 'Failed to save payment record.' }, { status: 500 });
          }

          console.log(`✅ Successfully inserted payment record for session ${checkoutSessionId} into Supabase.`);

          // --- TODO: Add any further fulfillment logic here ---
          // e.g., Granting credits to the user identified by `paymentData.user_id`
          // await grantCredits(paymentData.user_id, paymentData.credits);

        } else {
          console.warn(`Checkout session ${session.id} completed but payment status is ${session.payment_status}. Not processing.`);
        }
        break;
      } // End case 'checkout.session.completed'

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded!`);
        // Often redundant if 'checkout.session.completed' is handled,
        // but you might have specific logic here if not using Checkout.
        // If needed, you could perform a Supabase lookup/insert here too,
        // potentially using paymentIntent.id for idempotency.
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log(`Invoice ${invoice.id} payment succeeded!`);
        // Important for subscriptions or manually created invoices.
        // You might insert/update a record in Supabase here.
        // Ensure idempotency using `invoice.id`.
        // You might need to retrieve the associated Subscription or Customer
        // to link it to your internal user ID.
        // const subscriptionId = invoice.subscription;
        // const customerId = invoice.customer;
        // const paymentIntentId = invoice.payment_intent;
        // const hostedInvoiceUrl = invoice.hosted_invoice_url; // Direct invoice link
        // const invoicePdf = invoice.invoice_pdf; // PDF link
        break;
      }

      // Add cases for other events you need to handle (e.g., failures, subscription updates)
      // case 'payment_intent.payment_failed': ...
      // case 'invoice.payment_failed': ...
      // case 'customer.subscription.deleted': ...

      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt of the event to Stripe
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error(`Webhook handler error for event ${event.id}: ${error.message}`);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
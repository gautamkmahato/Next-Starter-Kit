
import supabaseAdmin from '@/configs/supabaseConfig';
import crypto from 'crypto';



export async function checkPaymentExists(transactionId) {
  try {
    const { data: existingPayment, error: checkError } = await supabaseAdmin
      .from('payments')
      .select('payment_id')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (checkError) {
      console.error('Supabase check error:', checkError.message);
      throw checkError; // Re-throw for caller to handle
    }

    return !!existingPayment;
  } catch (error) {
    console.error('Database checkPaymentExists error:', error);
    throw error; // Re-throw for caller to handle
  }
}

export function createPaymentData(session, userId, invoice) {
  return {
    payment_id: crypto.randomUUID(),
    user_id: userId, // Ensure client_reference_id is set during checkout creation
    payment_amount: (session.amount_total || 0) / 100,
    payment_provider: 'stripe',
    payment_status: session.payment_status,
    transaction_id: session.id,
    credits: 100, // Review this: Should be dynamic?
    remarks: session.metadata?.description || 'Stripe Purchase',
    customer_id: typeof session.customer === 'string' ? session.customer : null,
    invoice_id: typeof session.invoice === 'string' ? session.invoice : null,
    receipt_url: invoice?.hosted_invoice_url || null,
    payment_intent_id: typeof session.payment_intent === 'string' ? invoice?.payment_intent : null,
  };
}

export async function savePayment(paymentData) {
  try {
    const { error: insertError } = await supabaseAdmin
      .from('payments')
      .insert([paymentData]);

    if (insertError) {
      console.error('❌ Supabase insert error:', insertError.message);
      throw new Error('Failed to save payment record.');
    }

    console.log('✅ Payment record saved successfully.');
  } catch (error) {
    console.error('Database savePayment error:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

export default supabaseAdmin;
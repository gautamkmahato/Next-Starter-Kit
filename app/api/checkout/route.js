import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { credits } = await request.json(); // Parse JSON body

        const priceMap = {
            100: process.env.STRIPE_BASIC_PLAN, // ✅ Use correct env variables
            500: process.env.STRIPE_PREMIUM_PLAN,
            1000: "price_ghi789123",
        };

        const selectedPriceId = priceMap[credits]; // Get correct Price ID

        console.log("Credits selected:", credits);
        console.log("Using Price ID:", selectedPriceId);

        if (!selectedPriceId) {
            return new Response(JSON.stringify({ error: "Invalid credit amount selected" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Assuming you have the email and userId
        const email = 'user@example.com'; // Replace with actual email
        const userId = 'user-unique-id'; // Replace with actual user ID from your system

        // Step 1: Search for an existing customer by email
        const customers = await stripe.customers.list({ email });
        let customer = customers.data.length > 0 ? customers.data[0] : null;

        // Step 2: Create customer if not found
        if (!customer) {
            console.log("Customer not found, creating a new one...");
            customer = await stripe.customers.create({
                email,
                metadata: { userId },  // Optionally store your system's userId in metadata for reference
            });
        } else {
            console.log("Found existing customer:", customer.id);
        }

        // Now, you can check customer.id and use it for payment
        const customerId = customer.id;
        console.log("Using customer ID:", customerId);

        // Continue with creating a payment session or any other Stripe operation


        const origin = request.headers.get("origin") || "http://localhost:3000";
        console.log("Request origin:", origin);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: selectedPriceId, // Use correct Stripe Price ID
                    quantity: 1,
                },
            ],
            mode: "subscription",
            customer: customerId,  // Link the session to the customer ID
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
        });

        console.log("Stripe session created:", session);

        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

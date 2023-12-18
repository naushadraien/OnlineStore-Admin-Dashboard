import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  // CORS headers to allow access from any origin (see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,OPTIONS,DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}; //this is to avoid cors error for payment through stripe

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds } = await req.json();
  //   console.log(productIds);

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are  required", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach((product) => {
    //this is to create a line item for each product in the cart to be used in the session created in stripe for payment
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "USD",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price.toNumber() * 100,
      },
    });
  });
  const order = await prismadb.order.create({
    //this is to create an order in the database with the product ids and store id and isPaid set to false as the payment is not yet done through stripe
    data: {
      storeId: params.storeId,
      isPaid: false,
      orderItems: {
        create: productIds.map((productId: string) => ({
          product: {
            connect: {
              id: productId,
            },
          },
        })),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    //this is to create a session for payment through stripe
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id, //this is to store the order id in the metadata of the session created in stripe so that we can use it later to update the order status in the database using stripe webhook
    },
  });
  return NextResponse.json(
    { url: session.url },
    {
      headers: corsHeaders,
    }
  );
}

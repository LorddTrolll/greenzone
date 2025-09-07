import Stripe from 'stripe'

// Cliente Stripe para servidor apenas
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Configurações dos planos
export const PLANS = {
  MONTHLY: {
    name: 'VIP Mensal',
    price: 3000, // R$ 30,00 em centavos
    currency: 'brl',
    interval: 'month' as const,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
  },
  ANNUAL: {
    name: 'VIP Anual',
    price: 30000, // R$ 300,00 em centavos (desconto de 2 meses)
    currency: 'brl',
    interval: 'year' as const,
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID!,
  },
} as const

// Função para criar sessão de checkout
export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  })

  return session
}
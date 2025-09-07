import { loadStripe } from '@stripe/stripe-js'

// Cliente Stripe para browser - usando apenas a chave pública
let stripePromise: Promise<any> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não encontrada')
      return null
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Função para verificar se o Stripe está disponível
export const isStripeAvailable = () => {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
}
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '../../../../lib/stripe'
import { createServerSupabaseClient } from '../../../../lib/supabase'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Erro na verificação do webhook:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = createServerSupabaseClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice, supabase)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice, supabase)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription, supabase)
        break
      }

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const userId = session.metadata?.userId
  if (!userId) {
    console.error('User ID não encontrado nos metadados da sessão')
    return
  }

  // Validar se userId é um UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    console.error(`UUID inválido: ${userId}`)
    return
  }

  // Buscar detalhes da assinatura
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
    {
      expand: ['items.data.price']
    }
  ) as Stripe.Subscription

  const priceId = subscription.items.data[0].price.id
  const planType = getPlanTypeFromPriceId(priceId)
  
  // Validar timestamps antes de converter para Date
  const startTimestamp = (subscription as any).current_period_start
  const endTimestamp = (subscription as any).current_period_end
  
  if (!startTimestamp || !endTimestamp || startTimestamp <= 0 || endTimestamp <= 0) {
    console.error('Timestamps inválidos na assinatura:', { startTimestamp, endTimestamp })
    return
  }
  
  const currentPeriodStart = new Date(startTimestamp * 1000)
  const currentPeriodEnd = new Date(endTimestamp * 1000)
  
  // Verificar se as datas são válidas
  if (isNaN(currentPeriodStart.getTime()) || isNaN(currentPeriodEnd.getTime())) {
    console.error('Datas inválidas calculadas:', { currentPeriodStart, currentPeriodEnd })
    return
  }

  // Atualizar perfil do usuário
  const { error } = await supabase
    .from('profiles')
    .update({
      is_vip: true,
      plano: planType,
      data_inicio: currentPeriodStart.toISOString(),
      data_expiracao: currentPeriodEnd.toISOString(),
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Erro ao atualizar perfil após checkout:', error)
    throw error
  }

  console.log(`Assinatura ativada para usuário ${userId}`)
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price']
  }) as Stripe.Subscription
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('User ID não encontrado nos metadados da assinatura')
    return
  }

  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000)

  // Atualizar data de expiração
  const { error } = await supabase
    .from('profiles')
    .update({
      is_vip: true,
      data_expiracao: currentPeriodEnd.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Erro ao atualizar perfil após pagamento:', error)
    throw error
  }

  console.log(`Pagamento confirmado para usuário ${userId}`)
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('User ID não encontrado nos metadados da assinatura')
    return
  }

  console.log(`Pagamento falhou para usuário ${userId}`)
  // Aqui você pode implementar lógica adicional, como notificar o usuário
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('User ID não encontrado nos metadados da assinatura')
    return
  }

  // Validar se userId é um UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    console.error(`UUID inválido: ${userId}`)
    return
  }

  const isActive = subscription.status === 'active'
  const endTimestamp = (subscription as any).current_period_end
  
  // Validar timestamp antes de converter para Date
  if (!endTimestamp || endTimestamp <= 0) {
    console.error('Timestamp inválido na assinatura:', endTimestamp)
    return
  }
  
  const currentPeriodEnd = new Date(endTimestamp * 1000)
  
  // Verificar se a data é válida
  if (isNaN(currentPeriodEnd.getTime())) {
    console.error('Data inválida calculada:', currentPeriodEnd)
    return
  }
  
  const priceId = subscription.items.data[0].price.id
  const planType = getPlanTypeFromPriceId(priceId)

  const { error } = await supabase
    .from('profiles')
    .update({
      is_vip: isActive,
      plano: isActive ? planType : null,
      data_expiracao: isActive ? currentPeriodEnd.toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Erro ao atualizar perfil após mudança de assinatura:', error)
    throw error
  }

  console.log(`Assinatura atualizada para usuário ${userId}: ${subscription.status}`)
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('User ID não encontrado nos metadados da assinatura')
    return
  }

  // Desativar VIP
  const { error } = await supabase
    .from('profiles')
    .update({
      is_vip: false,
      plano: null,
      data_expiracao: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Erro ao desativar VIP após cancelamento:', error)
    throw error
  }

  console.log(`Assinatura cancelada para usuário ${userId}`)
}

function getPlanTypeFromPriceId(priceId: string): 'mensal' | 'anual' {
  if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) {
    return 'mensal'
  } else if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID) {
    return 'anual'
  }
  
  // Fallback - assumir mensal se não conseguir identificar
  return 'mensal'
}
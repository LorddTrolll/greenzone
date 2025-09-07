import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, PLANS } from '../../../lib/stripe'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json()
    
    // Verificar se o usuário está autenticado através do cookie
    const cookieStore = cookies()
    const userCookie = cookieStore.get('greenzone_user')
    
    if (!userCookie || !userCookie.value) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    let user
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value))
    } catch (error) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Validar tipo de plano
    if (!planType || !['MONTHLY', 'ANNUAL'].includes(planType)) {
      return NextResponse.json(
        { error: 'Tipo de plano inválido' },
        { status: 400 }
      )
    }

    const plan = PLANS[planType as keyof typeof PLANS]
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Criar sessão de checkout
    const session = await createCheckoutSession({
      priceId: plan.priceId,
      userId: user.id,
      userEmail: user.email,
      successUrl: `${origin}/vip/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/vip?canceled=true`,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
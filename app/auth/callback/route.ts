import { createServerSupabaseClient } from '../../../lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerSupabaseClient()
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('Erro ao trocar código por sessão:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
    }
  }

  // Redirecionar para o dashboard após login bem-sucedido
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
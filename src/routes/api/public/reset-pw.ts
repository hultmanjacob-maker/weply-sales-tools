import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/reset-pw')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { secret, email, password } = await request.json()
        if (secret !== 'one-off-2026-07-08') {
          return new Response('Unauthorized', { status: 401 })
        }
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
        const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
        if (listErr) return new Response(listErr.message, { status: 500 })
        const user = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
        if (!user) return new Response('User not found', { status: 404 })
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password })
        if (error) return new Response(error.message, { status: 500 })
        return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
      },
    },
  },
})

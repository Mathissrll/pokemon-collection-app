import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email, username, token } = await req.json()
  if (!email || !token) {
    return NextResponse.json({ error: "Email et token requis" }, { status: 400 })
  }

  const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/confirm-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: "no-reply@pokemon-collection.app",
      to: email,
      subject: "Confirme ton compte Pokémon Collection",
      html: `<h2>Bienvenue ${username || "!"}</h2>
        <p>Merci de t'être inscrit sur Pokémon Collection.</p>
        <p>Pour activer ton compte, clique sur le bouton ci-dessous :</p>
        <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Confirmer mon compte</a>
        <p>Ou copie ce lien dans ton navigateur :<br/><code>${confirmUrl}</code></p>
        <p>Si tu n'es pas à l'origine de cette inscription, ignore cet email.</p>`
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur d'envoi d'email" }, { status: 500 })
  }
} 
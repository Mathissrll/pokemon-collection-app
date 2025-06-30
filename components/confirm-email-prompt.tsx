import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MailCheck, Loader2 } from "lucide-react"

export function ConfirmEmailPrompt({ email, onResend }: { email: string; onResend?: () => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    setSent(false)
    if (onResend) await onResend()
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center animate-bounce">
          <MailCheck className="w-12 h-12 text-blue-600" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-blue-200 rounded-full blur-sm opacity-70 animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Confirme ton adresse email</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        Un email de confirmation a été envoyé à <span className="font-semibold text-blue-700">{email}</span>.<br />
        Clique sur le lien dans l'email pour activer ton compte et accéder à toutes les fonctionnalités.
      </p>
      <Button onClick={handleResend} disabled={loading} className="mt-2">
        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
        Renvoyer l'email de confirmation
      </Button>
      {sent && <div className="mt-2 text-green-600 text-sm animate-fade-in">Email de confirmation renvoyé !</div>}
      <div className="mt-6 text-xs text-gray-400">Vérifie aussi tes spams ou courriers indésirables.</div>
    </div>
  )
} 
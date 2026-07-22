'use client'

export default function AdminError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-xl font-semibold text-gray-900">Ocurrió un error en el panel de administración</h2>
      <p className="mt-2 text-gray-600">No pudimos procesar tu solicitud. Intenta de nuevo.</p>
      <button
        onClick={() => unstable_retry()}
        className="mt-6 btn-primary"
      >
        Reintentar
      </button>
    </div>
  )
}

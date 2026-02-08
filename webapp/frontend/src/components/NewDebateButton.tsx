interface NewDebateButtonProps {
  onClick: () => void
}

export default function NewDebateButton({ onClick }: NewDebateButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl hover:scale-110 transition flex items-center justify-center text-3xl z-50 animate-pulse"
      title="Start New Debate"
    >
      ➕
    </button>
  )
}

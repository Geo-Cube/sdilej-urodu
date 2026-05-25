import * as React from 'react'

type ToastVariant = 'default' | 'destructive'

type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

type ToastState = { toasts: Toast[] }
type Action =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string }

let listeners: Array<(state: ToastState) => void> = []
let memState: ToastState = { toasts: [] }

function dispatch(action: Action) {
  memState = reducer(memState, action)
  listeners.forEach((l) => l(memState))
}

function reducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case 'ADD':
      return { toasts: [action.toast, ...state.toasts].slice(0, 3) }
    case 'REMOVE':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) }
  }
}

function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  const id = String(Date.now())
  dispatch({ type: 'ADD', toast: { id, title, description, variant } })
  setTimeout(() => dispatch({ type: 'REMOVE', id }), 4000)
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => { listeners = listeners.filter((l) => l !== setState) }
  }, [])
  return { toasts: state.toasts, toast }
}

export { useToast, toast }

import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { AsyncThunkAction } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

type Thunk<Returned, Arg> = (arg: Arg) => AsyncThunkAction<Returned, Arg, { rejectValue: string }>

/**
 * Wraps an async thunk so components call `send(arg)` instead of
 * `dispatch(thunk(arg))` + hand-rolled loading/error state each time.
 */
export function useApiRequest<Returned, Arg>(thunk: Thunk<Returned, Arg>) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    async (arg: Arg): Promise<Returned> => {
      setLoading(true)
      setError(null)
      try {
        return await dispatch(thunk(arg)).unwrap()
      } catch (err) {
        const message = typeof err === 'string' ? err : 'Something went wrong'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [dispatch, thunk],
  )

  return { send, loading, error }
}

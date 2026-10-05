import { useEffect, useState } from 'react'

export function useAsync(loader, dependencies) {
  const [state, setState] = useState({ data: null, loading: true, error: '', key: '' })
  const key = JSON.stringify(dependencies)

  useEffect(() => {
    let active = true
    setState({ data: null, loading: true, error: '', key })
    loader()
      .then((data) => active && setState({ data, loading: false, error: '', key }))
      .catch(
        (error) => active && setState({ data: null, loading: false, error: error.message, key }),
      )
    return () => {
      active = false
    }
  }, dependencies)

  return state.key === key ? state : { data: null, loading: true, error: '', key }
}

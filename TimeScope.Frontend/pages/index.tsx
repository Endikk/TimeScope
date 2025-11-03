import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    // Redirection immédiate vers /home
    router.replace('/home')
  }, [router])

  // Affichage minimal pendant la redirection
  return null
}

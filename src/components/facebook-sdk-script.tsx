"use client"

import { useEffect } from "react"

export function FacebookSDKScript() {
  useEffect(() => {
    const initializeFacebook = () => {
      if (window.FB) {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
          cookie: true,
          xfbml: false,
          version: "v19.0",
        })
      }
    }

    const script = document.getElementById("facebook-jssdk")
    script?.addEventListener("load", initializeFacebook)
    initializeFacebook()

    return () => {
      script?.removeEventListener("load", initializeFacebook)
    }
  }, [])

  return null
}

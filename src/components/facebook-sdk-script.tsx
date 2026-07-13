"use client"

import { useEffect } from "react"

export function FacebookSDKScript() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const existingScript = document.getElementById("facebook-jssdk")
    if (existingScript) {
      if (window.FB) {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
          cookie: true,
          xfbml: false,
          version: "v19.0",
        })
      }
      return
    }

    const script = document.createElement("script")
    script.id = "facebook-jssdk"
    script.async = true
    script.defer = true
    script.src = "https://connect.facebook.net/en_US/sdk.js"
    script.onload = () => {
      if (window.FB) {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
          cookie: true,
          xfbml: false,
          version: "v19.0",
        })
      }
    }

    document.body.appendChild(script)

    return () => {
      script.onload = null
    }
  }, [])

  return null
}

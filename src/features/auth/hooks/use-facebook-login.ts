"use client"

export function useFacebookLogin() {
  const getFacebookAccessToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.FB) {
        reject(new Error("Facebook SDK not loaded"))
        return
      }

      FB.login(
        (response) => {
          if (response.authResponse?.accessToken) {
            resolve(response.authResponse.accessToken)
          } else {
            reject(new Error("User cancelled or did not grant permission"))
          }
        },
        { scope: "email,public_profile" }
      )
    })
  }

  return { getFacebookAccessToken }
}

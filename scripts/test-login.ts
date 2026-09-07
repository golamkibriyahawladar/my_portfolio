import { getAuth } from '../lib/auth'

async function main() {
  const auth = getAuth()
  try {
    const res = await auth.api.signInEmail({
      body: {
        email: "golamkibriyahawladar@gmail.com",
        password: "admin123456"
      }
    })
    console.log("SUCCESS:", res)
  } catch (error) {
    console.error("ERROR:", error)
  }
  process.exit(0)
}

main().catch(console.error)

import { signInWithEmailAndPassword, signOut, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"

export const useAdminAuth = () => {
  const { $auth } = useNuxtApp()
  const user = useState<import("firebase/auth").User | null>("adminUser", () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
    
  // 🔹 Re-authenticate admin before sensitive changes
  const reauthenticate = async (email: string, password: string) => {
    if (!$auth.currentUser) throw new Error("No authenticated user")
    const credential = EmailAuthProvider.credential(email, password)
    return await reauthenticateWithCredential($auth.currentUser, credential)
  }

  // 🔹 Change email
  const changeEmail = async (newEmail: string, currentPassword: string) => {
    loading.value = true
    error.value = null

    try {
      if (!$auth.currentUser || !$auth.currentUser.email) {
        throw new Error("No authenticated admin")
      }

      // Step 1: re-authenticate
      await reauthenticate($auth.currentUser.email, currentPassword)

      // Step 2: update email
      await updateEmail($auth.currentUser, newEmail)

      return { success: true }
    } catch (err: any) {
      error.value = err.message || "Failed to change email"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 🔹 Change password
  const changePassword = async (newPassword: string, currentPassword: string) => {
    loading.value = true
    error.value = null

    try {
      if (!$auth.currentUser || !$auth.currentUser.email) {
        throw new Error("No authenticated admin")
      }

      // Step 1: re-authenticate
      await reauthenticate($auth.currentUser.email, currentPassword)

      // Step 2: update password
      await updatePassword($auth.currentUser, newPassword)

      return { success: true }
    } catch (err: any) {
      error.value = err.message || "Failed to change password"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword($auth, email, password)
      user.value = res.user;
      return { success: true, user: res.user }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const logout = async () => {
    await signOut($auth)
    user.value = null
  }

  return {
    user,
    login,
    logout,
    error,
    loading,
    changeEmail,
    changePassword,
  }
}

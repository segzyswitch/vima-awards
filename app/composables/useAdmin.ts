import { addDoc, collection, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useCloudinary } from "./useCloudinary"

type ContestantData = {
  name: string
  category: string
  votes: number
  image?: File | string | null
}

type PaymentMethodData = {
  name: string
  tag: string
  icon?: File | string | null
}

export function useAdmin() {
  const { $db } = useNuxtApp()
  const { uploadImage } = useCloudinary()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // 🔹 Save or update contestant
  const saveContestant = async (contestant: ContestantData, id?: string) => {
    loading.value = true
    error.value = null

    try {
      let imageUrl: string | null = null

      if (!id) {
        // New contestant → image required
        if (!contestant.image || !(contestant.image instanceof File)) {
          throw new Error("Image is required when adding new contestant")
        }
        imageUrl = await uploadImage(contestant.image)
      } else {
        // Updating contestant
        if (contestant.image && contestant.image instanceof File) {
          imageUrl = await uploadImage(contestant.image)
        } else {
          const oldDoc = await getDoc(doc($db, "contestants", id))
          imageUrl = oldDoc.exists() ? oldDoc.data().image : null
        }
      }

      const contestantRecord = {
        name: contestant.name,
        category: contestant.category,
        votes: contestant.votes,
        image: imageUrl,
        updatedAt: serverTimestamp(),
      }

      if (id) {
        await setDoc(doc($db, "contestants", id), contestantRecord, { merge: true })
        return { success: true, id }
      } else {
        const docRef = await addDoc(collection($db, "contestants"), {
          ...contestantRecord,
          createdAt: serverTimestamp(),
        })
        return { success: true, id: docRef.id }
      }
    } catch (err: any) {
      error.value = err.message || "Failed to save contestant"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 🔹 Save or update payment method
  const savePaymentMethod = async (method: PaymentMethodData, id?: string) => {
    loading.value = true
    error.value = null

    try {
      let iconUrl: string | null = null

      if (!id) {
        if (!method.icon || !(method.icon instanceof File)) {
          throw new Error("Icon is required when adding new payment method")
        }
        iconUrl = await uploadImage(method.icon)
      } else {
        if (method.icon && method.icon instanceof File) {
          iconUrl = await uploadImage(method.icon)
        } else {
          const oldDoc = await getDoc(doc($db, "payment_methods", id))
          iconUrl = oldDoc.exists() ? oldDoc.data().icon : null
        }
      }

      const methodRecord = {
        name: method.name,
        tag: method.tag,
        icon: iconUrl,
        updatedAt: serverTimestamp(),
      }

      if (id) {
        await setDoc(doc($db, "payment_methods", id), methodRecord, { merge: true })
        return { success: true, id }
      } else {
        const docRef = await addDoc(collection($db, "payment_methods"), {
          ...methodRecord,
          createdAt: serverTimestamp(),
        })
        return { success: true, id: docRef.id }
      }
    } catch (err: any) {
      error.value = err.message || "Failed to save payment method"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
	
  // 🔹 Delete contestant
  const deleteContestant = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      await deleteDoc(doc($db, "contestants", id))
      // TODO: Optionally call backend to delete Cloudinary image
      return { success: true }
    } catch (err: any) {
      error.value = err.message || "Failed to delete contestant"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
	// 🔹 Delete payment method
  const deletePaymentMethod = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      await deleteDoc(doc($db, "payment_methods", id))
      // TODO: Optionally call backend to delete Cloudinary icon
      return { success: true }
    } catch (err: any) {
      error.value = err.message || "Failed to delete payment method"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  // delete vote
  const deleteVote = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      await deleteDoc(doc($db, "votes", id))
      // TODO: Optionally call backend to delete Cloudinary icon
      return { success: true }
    } catch (err: any) {
      error.value = err.message || "Failed to delete payment method"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return { saveContestant, savePaymentMethod, deleteContestant, deletePaymentMethod, deleteVote, loading, error }
}

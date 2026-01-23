import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";

type VoteData = {
  userEmail: string
  contestantId: string
  votes: number
  amountPaid: number
  paymentMethod: string,
	category: string,
  proofFile?: String | null
};

export function useVotes() {
  const { $db } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const submitVote = async (vote: VoteData) => {
    loading.value = true
    error.value = null

    try {
      // Prepare Firestore document
      const voteRecord: any = {
        userEmail: vote.userEmail,
        contestantId: vote.contestantId,
        votes: vote.votes,
        amountPaid: vote.amountPaid,
        paymentMethod: vote.paymentMethod,
				category: vote.category,
				proofFileName: vote.proofFile,
        createdAt: serverTimestamp()
      }

      // Save to Firestore
      await addDoc(collection($db, "votes"), voteRecord);

      // 2. Increment contestant's vote count
      const contestantRef = doc($db, "contestants", voteRecord.contestantId)
      await updateDoc(contestantRef, {
        votes: increment(voteRecord.votes),
      });

      return { success: true }
    } catch (err: any) {
      error.value = err.message || "Failed to submit vote"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return { submitVote, loading, error }
}

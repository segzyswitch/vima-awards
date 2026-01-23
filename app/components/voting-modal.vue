<script lang="ts" setup>
import { useCloudinary } from '~/composables/useCloudinary';
const { uploadImage } = useCloudinary();

import { closeModal } from '~/utils/modal';
// SweetAlert
const { $swal } = useNuxtApp();

// Define props
const props = defineProps<{
  nominee: any,
	payment_methods: any
}>();

const votePricing = [
	{ votes: 10, price: 25 },
	{ votes: 20, price: 50 },
	{ votes: 30, price: 75 },
	{ votes: 40, price: 100 },
	{ votes: 60, price: 150 },
	{ votes: 80, price: 200 },
	{ votes: 120, price: 300 }
];

const activePage:any = ref(null); // null, 'payment', 'checkout'
const manualAmount = ref(0);
const donateTerms = ref(false);

const priceData = computed((): { votes: number; price: number } => {
  return {
    price: (manualAmount.value ?? 0),
		votes: (manualAmount.value ?? 0) / 2.5
  }
});
const payAuto = ref(true);
function makeVote(query: { votes: number; price: number } | 'manual') {
	if (query == 'manual') {
		payAuto.value = false;
		manualAmount.value = 0;
		return false;
	}
	manualAmount.value = query.price;
	payAuto.value = true;
}

// Payment methods
const selectedMethod:any = ref(null);
function selectMethod(method:any) {
	selectedMethod.value = method;
	if ( !method ) return false;
	// copy to clipboard
	const text = method.tag;
  navigator.clipboard.writeText(text)
  .then(() => {
    console.log('Copied!');
  })
  .catch(() => {
    console.log('Failed to copy.');
  });
}
const loadData = ref(false);
const formdata:any = ref({
	email: '',
});
const formerr:any = ref({
	email: '',
	payment_method: '',
});

const files = ref<File[]>([]);
const previews:any = ref([]);
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const newFiles = Array.from(target.files);
    // append instead of replace
    files.value = [...files.value, ...newFiles];
    previews.value = [...previews.value, ...newFiles.map((f) => URL.createObjectURL(f))];
  }
};
const removeFile = (index: number) => {
  // revoke object URL to avoid memory leaks
  URL.revokeObjectURL(previews.value[index]);
  files.value.splice(index, 1);
  previews.value.splice(index, 1);
};


// Send votes
import { useVotes } from '~/composables/useVotes';
const { submitVote } = useVotes();
async function castVote() {
	loadData.value = true;
	// validate form
	formerr.value.email = formdata.value.email ? null : 'Email is required';
	formerr.value.payment_method = selectedMethod.value ? null : 'Select payment method';
	if (formerr.value.email || formerr.value.payment_method) {
		loadData.value = false;
		return;
	}
	if ( files.value.length < 1 ) {
		$swal.fire({
			title: 'Error!',
			icon: 'warning',
			text: 'Please upload proof of payment to proceed.',
		});
		loadData.value = false;
		return;
	}

	// upload proofs if available
let proofUrls:any = [];
if (files.value.length > 0) {
  proofUrls = await Promise.all(
    files.value.map((f) => uploadImage(f)) // call your uploadImage for each file
  );
  // filter out any failed uploads (nulls)
  proofUrls = proofUrls.filter((url: any): url is string => url !== null);
}
	// prepare data
	const voteData = {
		userEmail: formdata.value.email,
		contestantId: props.nominee.id,
		votes: priceData.value?.votes || 0,
		amountPaid: priceData.value?.price || 0,
		paymentMethod: selectedMethod.value?.name || '',
		category: props.nominee.category || '',
		proofFile: proofUrls,
	};
	// return console.log(voteData);
	submitVote(voteData).then((resp:any) => {
		loadData.value = false;
		console.log(resp);
		if ( resp?.success == true ) {
			// close modal
			closeModal(`Modal_${props.nominee.id}`);
			payAuto.value = true;
			manualAmount.value = 0;
			formdata.value.email = '';
			selectedMethod.value = null;
			$swal.fire({
        title: 'Thank You!',
        icon: 'success',
        text: "Your votes have been submitted! stay tuned, we will send you updates via email!",
      });
		}else {
			$swal.fire({
        title: 'Error!',
        icon: 'warning',
        text: resp.error,
      });
		}
	}).catch((err) => {
		loadData.value = false;
		console.log(err);
	});
}

</script>

<template>
	<teleport to="body">
		<div class="modal fade" :id="`Modal_${nominee.id}`" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
			<div class="modal-dialog">
				<div class="modal-content text-light text-center">
					<div class="modal-header border-0 d-block text-start" v-if="!activePage">
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<form @submit.prevent="activePage='payment'" v-if="!activePage">
							<h4 class="text-gold">Donate for this Nominee</h4>
							<div class="col-7 col-sm-4 mx-auto py-2 mb-2 rounded-circle">
								<div class="contest-img overflow-hidden border-0 p-1"
									style="background-color: rgba(59, 29, 9, .5);background:linear-gradient(185deg, rgba(59, 29, 9, .5), rgb(218, 165, 32));">
									<div class="w-100 h-100 rounded-circle overflow-hidden"><img :src="nominee.image" class="w-100" :alt="nominee.name" /></div>
								</div>
							</div>
							<p class="text-light text-uppercase h4">{{ nominee.name }}</p>
							<p class="text-gold mb-4">In Category: <span class="text-uppercase">{{ nominee.category }}</span></p>
							<div class="w-100 rounded-3 border border-gold p-3 mb-4">
								<h5>Choose donation amount</h5>
								<div class="row g-4 pt-3">
									<div class="col-6" v-for="(rates, idx) in votePricing" :key="idx">
										<button type="button" @click="makeVote(rates)" class="btn border-gold bg-dark text-gold w-100" :class="{'bg-gold text-dark': manualAmount==rates.price}">{{ rates.votes }} votes <br /> ${{rates.price}}</button>
									</div>
									<div class="col-6">
										<button type="button" @click="makeVote('manual')" class="btn border-gold bg-dark text-gold w-100" :class="{'bg-gold text-dark': !payAuto}">Custom amount <br /> above $300</button>
									</div>
									<div class="col-12 position-relative" v-if="!payAuto">
										<span class="position-absolute d-inline-block" style="top:5px;left:17.5px;">
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
										</span>
										<input v-model="manualAmount"
											type="number" min="200"
											placeholder="Enter amount"
											class="form-control"
											style="padding-left:30px;"
											required
										/>
										<small class="d-block pt-2 text-start" style="opacity:.6;" v-if="manualAmount && manualAmount>0">
											${{ `${priceData.price} = ${priceData.votes} votes` }}
										</small>
									</div>
								</div>
							</div>
							<label class="d-block mb-4" style="font-size:.9rem;">
								<input type="checkbox" v-model="donateTerms" style="scale: 1.2;" required />
								<span class="ms-2">I agree that all donations are final and non-refundable.</span>
							</label>
							<p class="text-center">
								<button :disabled="!donateTerms||manualAmount<1" style="scale:1.2;" type="submit" class="btn btn-warning px-4">Continue</button>
							</p>
						</form>
						<form @submit.prevent="activePage='checkout'" class="position-relative" v-if="activePage=='payment'">
							<p class="text-start mb-4">
								<button type="button" @click="activePage=null" class="btn p-0 border-0 bg-transparent text-light" aria-label="Close">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
								</button>
							</p>
							<h1 class="text-gold">Donate ${{ priceData?.price }} for {{ priceData?.votes }} points to vote:</h1>
							<div class="text-light text-uppercase h4 py-2 d-flex mx-auto">
								<div class="contest-img overflow-hidden ms-auto border-2">
									<img :src="nominee.image" width="45" :alt="nominee.name" />
								</div>
								<div class="me-auto ps-2 my-auto">{{ nominee.name }}</div>
							</div>
							<p class="text-gold mb-4">In Category: <span class="text-uppercase">{{ nominee.category }}</span></p>
							<div class="w-100 rounded-3 border border-gold p-3 mb-4 text-start">
								<h5>Select payment method</h5>
								<div class="row ">
									<div class="col-12 pt-3" v-for="(method, idx) in payment_methods" :key="idx">
										<button type="button" @click="selectMethod(method)" class="btn border-gold bg-dark text-gold text-start w-100 d-flex py-2"
											:class="{'bg-gold text-dark': selectedMethod?.name==method?.name}">
											<img :src="method?.icon" class="my-auto py-1" :alt="method?.name" width="45" />
											<div class="ps-2 my-auto text-gold" :class="{'text-dark': selectedMethod?.name==method?.name}">
												<p class="m-0">{{ method.name }}</p>
												<small>{{ method.tag }}</small>
											</div>
											<span class="ms-auto text-muted" v-if="selectedMethod?.name==method?.name">copied!</span>
											<span class="bi bi-copy ms-auto text-muted" v-else></span>
										</button>
									</div>
									<!-- <div class="col-12 pt-3" >
										<button type="button" @click="Pay(); selectMethod(null)" class="btn border-gold bg-dark text-gold text-start w-100 d-flex py-2"
											:class="{'bg-gold text-dark': selectedMethod?.name=='card'}">
											<i class="my-auto py-1 bi bi-credit-card h2 d-block text-center" style="width:45px;"></i>
											<div class="ps-2 my-auto">
												<p class="m-0">Card Payment</p>
												<small>Fast and secure debit/credit card payment</small>
											</div>
										</button>
									</div> -->
									<small class="text-danger d-block mt-1 mb-3" v-if="formerr?.payment_method">{{ formerr?.payment_method }}</small>
									<p v-else-if="selectedMethod" class="d-block mt-3 mb-0" style="opacity:.7;">
										<i class="bi bi-exclamation-circle text-gold me-1 h5"></i>
										Complete the payment of ${{ priceData?.price }} via the selected payment method:<br />
										<span class="text-white p-1 d-block pt-3"><img :src="selectedMethod?.icon" width="25" /> {{ selectedMethod?.name }}<br />
											<span v-if="selectedMethod?.tag" class="py-2 px-3 rounded d-block my-2 w-100" style="background:#224a55;">{{ selectedMethod?.tag }}</span>
										</span>
									</p>
								</div>
							</div>
							<p class="text-center">
								<button :disabled="loadData||!selectedMethod" style="scale:1.2;" type="submit" class="btn btn-warning px-4">
									<i class="spinner-border spinner-border-sm" v-if="loadData"></i> Continue
								</button>
							</p>
						</form>
						<form @submit.prevent="castVote" class="position-relative" v-if="activePage=='checkout'">
							<p class="text-start">
								<button type="button" @click="activePage='payment'" class="btn p-0 border-0 bg-transparent text-light" aria-label="Close">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
								</button>
							</p>
							<h2 class="text-gold mb-4 my-1">Complete payment</h2>
							<!-- <p class="text-light text-uppercase h5 py-2">{{ nominee.name }}</p>
							<p class="text-gold mb-4">In Category: <span class="text-uppercase">{{ nominee.category }}</span></p> -->
							<div class="w-100 rounded-3 border border-gold p-3 mb-4 text-start">
								<div class="d-flex mb-3 p-2" style="border-bottom:1px dotted #cecece;">
									<span>Nominee:</span>
									<span class="ms-auto">{{ nominee?.name }}</span>
								</div>
								<div class="d-flex mb-3 p-2" style="border-bottom:1px dotted #cecece;">
									<span>Category:</span>
									<span class="ms-auto">{{ nominee?.category }}</span>
								</div>
								<div class="d-flex mb-3 p-2" style="border-bottom:1px dotted #cecece;">
									<span>Votes:</span>
									<span class="ms-auto">{{ priceData?.votes }}</span>
								</div>
								<div class="d-flex mb-3 p-2" style="border-bottom:1px dotted #cecece;">
									<span>Price:</span>
									<span class="ms-auto">${{ priceData?.price }}</span>
								</div>
								<div class="d-flex mb-3 p-2" style="border-bottom:1px dotted #cecece;">
									<span class="my-auto">Method:</span>
									<span class="ms-auto my-auto text-end" style="max-width:75%;"><img :src="selectedMethod?.icon" width="35" /> {{ selectedMethod?.name }} <small v-if="selectedMethod?.tag">({{ selectedMethod?.tag }})</small></span>
								</div>
								<div class="row pt-2">
									<div class="col-12">
										<div class="d-flex mb-1">
											<label>Proof of payment:</label>
											<button v-if="files.length" class="btn p-0 text-danger ms-auto" type="button" @click="files=[];previews=[]">&times; clear</button>
										</div>
										<input type="file" accept="image/*" multiple @change="handleFileChange" class="d-none" />
										<button type="button"
											class="form-control my-1 p-3 py-4 position-relative text-light"
											onclick="document.querySelector('input[type=file]')?.click()"
											:class="{'text-white': previews}">
											<i class="bi bi-cloud-arrow-up pe-1 display-2 mb-3"></i>
											<span class="d-block">{{ files.length ? 'Add file' : 'Select files' }}</span>
											<small class="d-block pt-2" style="opacity:.6;">{{ files.length ? 'Select another file' : 'Upload reciept or payment photo.' }}</small>
										</button>
										<div class="row py-3" v-if="previews.length">
											<div class="col-3" v-for="prev in previews">
												<div style="transform:scale(1,1);"
													class="shadow h-100 bg-dark"
													:style="`aspect-ratio:1 / 1;background-image:url(${prev});background-position:center;background-size:cover;`">
													<span class="close-btn text-danger"></span>
												</div>
											</div>
										</div>
									</div>
									<div class="col-12 mb-2" :class="{'mt-4': !formerr?.payment_method}">
										<label class="mb-1">Email address:</label>
										<input type="email" placeholder="Email address" v-model="formdata.email" class="form-control" required />
										<small class="text-danger d-block mt-1" v-if="formerr?.email">{{ formerr?.email }}</small>
									</div>
								</div>
							</div>
							<p class="text-center">
								<button :disabled="loadData" style="scale:1.2;" type="submit" class="btn btn-warning px-4">
									<i class="spinner-border spinner-border-sm" v-if="loadData"></i> Submit payment
								</button>
							</p>
						</form>
					</div>
				</div>
			</div>
		</div>
	</teleport>
</template>
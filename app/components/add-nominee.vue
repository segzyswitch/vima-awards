<script lang="ts" setup>
import { useAdmin } from '~/composables/useAdmin';
import { closeModal } from '~/utils/modal';
// SweetAlert
const { $swal } = useNuxtApp();

// Define props
const props = defineProps<{
  nominee: any,
	reloadData: Function
}>();

const loadData = ref(false);
const formdata:any = ref({
	name: '',
	category: '',
});
const formerr:any = ref({
	name: '',
	category: '',
});

const file:any = ref<File | null>(null);
const preview = ref<string | null>(null);
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
    preview.value = URL.createObjectURL(file.value);
		// console.log(file.value);
  }
};

// watch prop
watch(
  () => props.nominee,
  (newVal, oldVal) => {
		formdata.value = newVal;
		if (newVal != null) preview.value = newVal?.image;
    console.log('prop changed from', oldVal, 'to', newVal);
    // update something here
  }
)

// Add nominee
const { saveContestant, loading, error } = useAdmin();
async function addNominee() {
	loadData.value = true;
	const form = formdata.value;
	try {
		const result:any = await saveContestant({
			name: form.name,
			category: form.category,
			votes: 0,
			image: file.value, // File or null
		}, form.id || undefined);
		console.log(result);
		if ( !result.success ) {
			$swal.fire({
        title: 'Error!',
        icon: 'warning',
        text: result?.error,
      });
			loadData.value = false;
			return false;
		}
		// emit('data-added');
		props.reloadData();
		closeModal('newNominee');
		loadData.value = false;
		formdata.value.name = '';
		formdata.value.category = '';
		$swal.fire({
			title: 'Success!',
			icon: 'success',
			text: 'Nominee updated successfully!',
		});
	} catch (err:any) {
		console.log(err)
	}
}


// Fetch data on mount
onMounted( () => {
	
});

// async function castVote() {
// 	loadData.value = true;
// 	// validate form
// 	formerr.value.email = formdata.value.email ? null : 'Email is required';
// 	formerr.value.payment_method = selectedMethod.value ? null : 'Select payment method';
// 	if (formerr.value.email || formerr.value.payment_method) {
// 		loadData.value = false;
// 		return;
// 	}

// 	// upload proof if available
//   let proofUrl: string | null = null;
//   if (file.value != null) {
//     proofUrl = await uploadImage(file.value);
//   }
// 	// prepare data
// 	const voteData = {
// 		userEmail: formdata.value.email,
// 		contestantId: props.nominee.id,
// 		votes: priceData.value?.votes || 0,
// 		amountPaid: priceData.value?.price || 0,
// 		paymentMethod: selectedMethod.value?.name || '',
// 		category: props.nominee.category || '',
// 		proofFile: proofUrl,
// 	};
// 	// return console.log(voteData);
// 	submitVote(voteData).then((resp:any) => {
// 		loadData.value = false;
// 		console.log(resp);
// 		if ( resp?.success == true ) {
// 			// close modal
// 			closeModal(`Modal_${props.nominee.id}`);
// 			payAuto.value = true;
// 			manualAmount.value = 0;
// 			formdata.value.email = '';
// 			selectedMethod.value = null;
// 			$swal.fire({
//         title: 'Thank You!',
//         icon: 'success',
//         text: "Your votes have been submitted! stay tuned, we will send you updates via email!",
//       });
// 		}else {
// 			$swal.fire({
//         title: 'Error!',
//         icon: 'warning',
//         text: resp.error,
//       });
// 		}
// 	}).catch((err) => {
// 		loadData.value = false;
// 		console.log(err);
// 	});
// }

</script>

<template>
	<teleport to="body">
		<div class="modal fade" id="newNominee" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
			<div class="modal-dialog">
				<div class="modal-content text-light">
					<div class="modal-header border-0 d-block">
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<form @submit.prevent="addNominee" class="position-relative" v-if="!nominee">
							<h2 class="text-gold mb-4">Add contestant</h2>
							<!-- <p class="mb-4">
								<button type="button" @click="activePage=null" class="btn p-0 border-0 bg-transparent text-light" aria-label="Close">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
								</button>
							</p> -->
							<div class="row">
								<div class="col-12 py-4">
									<div class="d-flex mb-1">
										<!-- <label>Proof of payment (optional):</label> -->
										<button v-if="file" class="btn p-0 text-danger ms-auto" type="button" @click="file=null;preview=null">&times; clear</button>
									</div>
									<input type="file" accept="image/*" @change="handleFileChange" class="d-none" />
									<div class="col-7 col-sm-5 mx-auto mb-2 rounded-circle p-2" :style="preview ? `background:linear-gradient(185deg, rgba(59, 29, 9, .5), rgb(218, 165, 32));` : `background-color: rgba(59, 29, 9, .5);`">
										<div class="contest-img overflow-hidden border-0"
											:style="preview ? 'background-image: url(' + preview + '); background-size: cover; background-position: center;' : 'background-color: rgba(59, 29, 9, .5);'">
											<button type="button"
												onclick="document.querySelector('input[type=file]')?.click()"
												class="btn p-0 text-light w-100 h-100 rounded-circle overflow-hidden">
												<!-- <img v-if="preview" :src="preview" class="w-100 m-0 p-0" /> -->
												<div class="w-100 h-100 d-flex flex-column justify-content-center" style="background-color:rgba(255,255,255,0.1);" v-if="!preview">
													<i class="bi bi-cloud-arrow-up pe-1 display-4 mx-auto"></i>
													<span class="d-block mx-auto">{{ file ? 'Change photo' : 'Upload photo' }}</span>
												</div>
											</button>
										</div>
									</div>
									<!-- <button type="button"
										class="form-control my-1 text-start"
										onclick="document.querySelector('input[type=file]')?.click()">
										<i class="bi bi-cloud-arrow-up pe-1"></i>
										<span>{{ file ? 'Change file' : 'Choose file' }}</span>
									</button> -->
								</div>
								<div class="col-12 mb-3">
									<label class="mb-1">Contestant fullname:</label>
									<input type="text" placeholder="Enter fullname" v-model="formdata.name" class="form-control" required />
									<small class="text-danger d-block mt-1" v-if="formerr?.name">{{ formerr?.name }}</small>
								</div>
								<div class="col-12 mb-4">
									<label class="mb-1">Category:</label>
									<input type="text" placeholder="Enter category" v-model="formdata.category" class="form-control" required />
									<small class="text-danger d-block mt-1" v-if="formerr?.category">{{ formerr?.category }}</small>
								</div>
							</div>
							<p class="text-center mt-2">
								<button :disabled="loadData" style="scale:1.2;" type="submit" class="btn btn-warning px-4">
									<i class="spinner-border spinner-border-sm" v-if="loadData"></i> Submit
								</button>
							</p>
						</form>
						<form @submit.prevent="addNominee" class="position-relative" v-else>
							<h2 class="text-gold mb-4">Edit contestant</h2>
							<p class="mb-4">
								<!-- <button type="button" @click="activePage=null" class="btn p-0 border-0 bg-transparent text-light" aria-label="Close">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
								</button> -->
							</p>
							<div class="row">
								<div class="col-12 py-3">
									<div class="d-flex mb-1">
										<!-- <label>Proof of payment (optional):</label> -->
										<button v-if="file" class="btn p-0 text-danger ms-auto" type="button" @click="file=null;preview=null">&times; clear</button>
									</div>
									<input type="file" accept="image/*" @change="handleFileChange" class="d-none" />
									<div class="col-7 col-sm-5 mx-auto mb-2 rounded-circle p-2" :style="preview ? `background:linear-gradient(185deg, rgba(59, 29, 9, .5), rgb(218, 165, 32));` : `background-color: rgba(59, 29, 9, .5);`">
										<div class="contest-img overflow-hidden border-0"
											:style="preview ? 'background-image: url(' + preview + '); background-size: cover; background-position: center;' : 'background-color: rgba(59, 29, 9, .5);'">
											<button type="button"
												onclick="document.querySelector('input[type=file]')?.click()"
												class="btn p-0 text-light w-100 h-100 rounded-circle overflow-hidden">
												<!-- <img v-if="preview" :src="preview" class="w-100 m-0 p-0" /> -->
												<div class="w-100 h-100 d-flex flex-column justify-content-center" style="background-color:rgba(255,255,255,0.1);" v-if="!preview">
													<i class="bi bi-cloud-arrow-up pe-1 display-4 mx-auto"></i>
													<span class="d-block mx-auto">{{ file ? 'Change photo' : 'Upload photo' }}</span>
												</div>
											</button>
										</div>
									</div>
									<!-- <button type="button"
										class="form-control my-1 text-start"
										onclick="document.querySelector('input[type=file]')?.click()">
										<i class="bi bi-cloud-arrow-up pe-1"></i>
										<span>{{ file ? 'Change file' : 'Choose file' }}</span>
									</button> -->
								</div>
								<div class="col-12 mb-3">
									<label class="mb-1">Contestant fullname:</label>
									<input type="text" placeholder="Enter fullname" v-model="formdata.name" class="form-control" required />
									<small class="text-danger d-block mt-1" v-if="formerr?.name">{{ formerr?.name }}</small>
								</div>
								<div class="col-12 mb-4">
									<label class="mb-1">Category:</label>
									<input type="text" placeholder="Enter category" v-model="formdata.category" class="form-control" required />
									<small class="text-danger d-block mt-1" v-if="formerr?.category">{{ formerr?.category }}</small>
								</div>
							</div>
							<p class="text-center mt-3">
								<button :disabled="loadData" style="scale:1.2;" type="submit" class="btn btn-warning px-4">
									<i class="spinner-border spinner-border-sm" v-if="loadData"></i> Submit
								</button>
							</p>
						</form>
					</div>
				</div>
			</div>
		</div>
	</teleport>
</template>
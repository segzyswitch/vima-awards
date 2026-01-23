<script lang="ts" setup>
import { useAdmin } from '~/composables/useAdmin';
import { closeModal } from '~/utils/modal';
// SweetAlert
const { $swal } = useNuxtApp();

// Define props
const props = defineProps<{
  method: any,
	reloadData: Function
}>();

const loadData = ref(false);
const formdata:any = ref({
	name: '',
	tag: '',
});
const formerr:any = ref({
	name: '',
	tag: '',
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
  () => props.method,
  (newVal, oldVal) => {
		formdata.value = newVal;
		if (newVal != null) preview.value = newVal?.icon;
    console.log('prop changed from', oldVal, 'to', newVal);
    // update something here
  }
)

// Add nominee
const { savePaymentMethod, loading, error } = useAdmin();
async function addPaymentMethod() {
	loadData.value = true;
	const form = formdata.value;
	try {
		const result:any = await savePaymentMethod({
			name: form.name,
			tag: form.tag,
			icon: file.value, // File or null
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
		closeModal('newPaymentMethod');
		loadData.value = false;
		formdata.value.name = '';
		formdata.value.category = '';
		$swal.fire({
			title: 'Success!',
			icon: 'success',
			text: 'Payment method updated successfully!',
		});
	} catch (err:any) {
		console.log(err)
	}
}

</script>

<template>
	<teleport to="body">
		<div class="modal fade" id="newPaymentMethod" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
			<div class="modal-dialog">
				<div class="modal-content text-light">
					<div class="modal-header border-0 d-block">
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<form @submit.prevent="addPaymentMethod" class="position-relative">
							<h3 class="text-gold mb-4">Add payment method</h3>
							<div class="row">
								<div class="col-12 py-4">
									<div class="d-flex mb-1">
										<!-- <label>Proof of payment (optional):</label> -->
										<button v-if="file" class="btn p-0 text-danger ms-auto" type="button" @click="file=null;preview=null">&times; clear</button>
									</div>
									<input type="file" accept="image/*" @change="handleFileChange" class="d-none" />
									<div class="col-4 col-sm-3 mx-auto mb-2 rounded-circle">
										<div class="contest-img overflow-hidden border-0"
											:style="preview ? 'background-image: url(' + preview + '); background-size: cover; background-position: center;' : 'background-color: transparent;'">
											<button type="button"
												onclick="document.querySelector('input[type=file]')?.click()"
												class="btn p-0 text-light w-100 h-100 rounded-circle overflow-hidden">
												<!-- <img v-if="preview" :src="preview" class="w-100 m-0 p-0" /> -->
												<div class="w-100 h-100 d-flex flex-column justify-content-center" style="background-color:rgba(255,255,255,0.1);" v-if="!preview">
													<i class="bi bi-cloud-arrow-up pe-1 h3 mx-auto"></i>
													<span class="d-block mx-auto">{{ file ? 'Change' : 'Upload' }}</span>
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
									<label class="mb-1">Payment method:</label>
									<input type="text" placeholder="Cashapp, Paypal, Bank name, Zelle" v-model="formdata.name" class="form-control" required />
									<small class="text-danger d-block mt-1" v-if="formerr?.name">{{ formerr?.name }}</small>
								</div>
								<div class="col-12 mb-4">
									<label class="mb-1">Tag:</label>
									<input type="text" placeholder="username, email, account number, $cashtag" v-model="formdata.tag" class="form-control" required />
									<small class="text-danger d-block mt-1" v-if="formerr?.tag">{{ formerr?.tag }}</small>
								</div>
							</div>
							<p class="text-center mt-2">
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
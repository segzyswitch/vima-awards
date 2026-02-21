<script setup lang="ts">
import { collection, getDocs, Timestamp, query, orderBy,  } from "firebase/firestore";
import { useAdminAuth } from '~/composables/useAdminAuth';
import { openModal, closeModal } from "~/utils/modal";
// SweetAlert
const { $swal } = useNuxtApp();
const { $db } = useNuxtApp();
const { user, logout, changeEmail, changePassword, loading, error } = useAdminAuth();
const router = useRouter();
const route = useRoute();

// redirect to login if not logged in
if (!user.value) router.push('/admin');

// page route
const slug = route.params.pages;

// Edit data
const editNominee:any = ref(null);
function selectNominee(nominee:any) {
  // nomineeForm.value?.makeEdit();
	if (nominee) {
		editNominee.value = nominee;
	}else editNominee.value = null;
	
	openModal('newNominee');
}
// delete data
const { deleteContestant } = useAdmin();
const removeNominee:any = ref(null);
async function resolveNominee(nominee:any) {
	if (nominee) {
		removeNominee.value = nominee;
		try {
			const result = await deleteContestant(nominee.id);
			if (!result.success) {
				$swal.fire({
					title: 'Sorry!',
					icon: 'warning',
					text: result?.error??'Unable to delete, try again',
				});
				return false;
			}
			$swal.fire({
				title: 'Success!',
				icon: 'success',
				text: 'Nominee removed successfully!',
			});
			console.log(result);
			loadAll();
		} catch (err) {
			console.log(err)
		}
	}else removeNominee.value = null;
	
	// openModal('newNominee');
}

// delete vote
const voteToDelete:any = ref(null);
function selectDeleteVote(vote:any) {
	voteToDelete.value = vote;
	openModal('deleteModal');
}
const { deleteVote } = useAdmin();
const removeVote:any = ref(null);
const loadDeleteVote = ref(false);
async function resolveVote(vote:any) {
	loadDeleteVote.value = true;
	if (vote) {
		removeVote.value = vote;
		try {
			const result = await deleteVote(vote.id);
			if (!result.success) {
				$swal.fire({
					title: 'Sorry!',
					icon: 'warning',
					text: result?.error??'Unable to delete, try again',
				});
				loadDeleteVote.value = false;
				return false;
			}
			$swal.fire({
				title: 'Success!',
				icon: 'success',
				text: 'Vote item removed successfully!',
			});
			loadDeleteVote.value = false;
			closeModal('deleteModal');
			console.log(result);
			loadAll();
		} catch (err) {
			console.log(err)
		}
	}else removeVote.value = null;
}

const { deletePaymentMethod } = useAdmin();
const removePaymentMethod:any = ref(null);
async function resolvePaymentMethod(payment:any) {
	if (payment) {
		removePaymentMethod.value = payment;
		try {
			const result = await deletePaymentMethod(payment.id);
			if (!result.success) {
				$swal.fire({
					title: 'Sorry!',
					icon: 'warning',
					text: result?.error??'Unable to delete, try again',
				});
				return false;
			}
			$swal.fire({
				title: 'Success!',
				icon: 'success',
				text: 'Payment method removed successfully!',
			});
			console.log(result);
			loadAll();
		} catch (err) {
			console.log(err)
		}
	}else removeVote.value = null;
}

// Edit payment method
const editMethod:any = ref(null);
function selectMethod(method:any) {
  // nomineeForm.value?.makeEdit();
	if (method) {
		editMethod.value = method;
	}else editMethod.value = null;
	// return console.log(method)
	openModal('newPaymentMethod');
}


const Contestants = ref<any[]>([]);
const paymentMethods = ref<any[]>([]);
const Votes = ref<any[]>([]);

// get single nominee
function getContestantById(id: string): any {
  return Contestants.value.find(c => c.id === id)
}

function formatFirestoreTimestamp(timestamp: Timestamp): string {
  // Convert Firestore Timestamp to JavaScript Date
  const date = timestamp.toDate();
  // Get parts of the date
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear().toString().slice(-2);
  // Format hours and minutes for 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
	// Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
	// Return formatted date string
  return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
}

const loadData = ref(true);

async function loadAll() {
	// fetch contestants
	const constestSnapshot = await getDocs(
		query(collection($db, "contestants"), orderBy("createdAt", "desc"))
	);
	Contestants.value = constestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	// fetch payment methods
	const paymentSnapshot = await getDocs(collection($db, "payment_methods"));
	paymentMethods.value = paymentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	// fetch votes
	const votesSnapshot = await getDocs(
		query(collection($db, "votes"), orderBy("createdAt", "desc"))
	);
	Votes.value = votesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

	loadData.value = false;
}

// Logout
function Logout() {
	try {
		const result:any = logout;
		if ( !result.success ) {
			$swal.fire({
        title: 'Error!',
        icon: 'warning',
        text: result?.error,
      });
			loadData.value = false;
			router.push('/admin');
			return false;
		}
		loadData.value = false;
		router.push('/admin');
	} catch (err:any) {
		$swal.fire({
			title: 'Error!',
			icon: 'warning',
			text: err?.message??'An error occured, try again',
		});
		console.log(err);
	}
}

// View proof
const openProofs = ref(undefined);
function showProof(vote:any) {
	openProofs.value = vote.proofFileName;
	openModal('proofModal');
}

// Settings
const settingsTab:any = ref(null);
// changeEmail
const loadEmail = ref(false);
const mailFD = ref({
	email: '',
	password: ''
});
async function changeAdminEmail() {
	loadEmail.value = true;
	const FD = mailFD.value;
	try {
		const result:any = await changeEmail(FD.email, FD.password);
		if ( result.success == false ) {
			loadEmail.value = false;
			$swal.fire({
        title: 'Sorry!',
        icon: 'warning',
        text: result?.error??"Operation failed, please try again",
      });
		}
		loadEmail.value = false;
		FD.email = '';
		FD.password = '';
		$swal.fire({
			title: 'Thank You!',
			icon: 'success',
			text: "Admin email successfully changed!",
		});
		console.log(result)
	} catch (err) {
		console.log(err);
			loadEmail.value = false;
			$swal.fire({
        title: 'Sorry!',
        icon: 'error',
        text: "Operation failed, please try again",
      });
	}
}

// changeEmail
const loadPass = ref(false);
const passFD = ref({
	password: '',
	new_password: '',
	con_password: ''
});
async function changeAdminPassword() {
	const FD = passFD.value;
	if ( FD.new_password !== FD.con_password ) {
		$swal.fire({
			title: 'Sorry!',
			icon: 'warning',
			text: "New passwords do not match!",
		});
		return false;
	}
	loadEmail.value = true;
	try {
		const result:any = await changePassword(FD.new_password, FD.password);
		if ( result.success == false ) {
			loadEmail.value = false;
			$swal.fire({
        title: 'Sorry!',
        icon: 'warning',
        text: result?.error??"Operation failed, please try again",
      });
			return false;
		}
		loadEmail.value = false;
		FD.password = '';
		FD.new_password = '';
		FD.con_password = '';
		$swal.fire({
			title: 'Thank You!',
			icon: 'success',
			text: "Admin password successfully changed!",
		});
		console.log(result)
	} catch (err) {
		console.log(err);
			loadEmail.value = false;
			$swal.fire({
        title: 'Sorry!',
        icon: 'error',
        text: "Operation failed, please try again",
      });
	}
}


// Fetch data on mount
onMounted( () => {
	loadAll();
	
  router.afterEach(() => {
    const offcanvasEl = document.getElementById('mobileMenu');
    const bootstrap = (window as any).bootstrap;
    if (offcanvasEl && bootstrap?.Offcanvas) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (bsOffcanvas) bsOffcanvas.hide();
    }
  });
});
</script>

<template>
	<div class="container-fluid pb-5">
		<div class="row pb-4">
			<div class="col-sm-3 ps-0 d-none d-sm-block">
				<div class="bg-dark vh-100 text-light position-fixed start-0 top-0 col-3 p-0">
				<a class="navbar-brand d-inline-block m-2 mb-3" href="#" style="position:relative;top:20px;padding:5px 0;"><PageLogo /></a>

					<div class="w-100 sidenav pt-5">
						<sidenav :Logout="Logout" />
					</div>
				</div>
			</div>
			<div class="col-sm-9">
				<!-- Top Navbar -->
				<div class="navbar navbar-expand-lg navbar-dark row mb-5 sticky-top bg-dark" style="height:60px;">
					<div class="container-fluid">
						<a class="navbar-brand d-inline-block d-sm-none" href="#" style="position:relative;top:20px;padding:5px 0;"><PageLogo /></a>
						<button class="navbar-toggler ms-auto text-light" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Open menu">
							<span class="navbar-toggler-icon"></span>
						</button>
						<div class="collapse navbar-collapse" id="navbarSupportedContent">
							<ul class="navbar-nav ms-auto">
								<li class="nav-item dropdown">
									<a class="nav-link p-0" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										<i class="bi bi-person-circle h3"></i>
									</a>
									<ul class="dropdown-menu pt-0" aria-labelledby="navbarDropdown" style="left:auto;right:0;">
										<div class="w-100 p-2">
											<div class="w-100 p-2 px-3 rounded-3 text-light"
												style="background-color:rgba(255,255,255,.2);">
												<i class="bi bi-person"></i> ADMIN
											</div>
										</div>
										<li><hr class="dropdown-divider text-light"></li>
										<li><a class="dropdown-item" href="#">Settings</a></li>
										<li><a class="dropdown-item" href="#" @click.prevent="Logout">Logout</a></li>
									</ul>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<!-- mobile top space -->
				<div class="d-sm-none py-4"></div>

				<!-- Dashboard -->
				<section class="w-100" v-if="slug=='dashboard'">
					<h1 class="text-light mb-4">Dashboard Overview</h1>
					<p class="text-center py-5" v-if="loadData"><i class="spinner-border text-light"></i></p>
					<div class="row g-4" v-else>
						<div class="col-sm-6">
							<router-link to="/admin/nominees" class="btn w-100 h-100 btn-success p-3 text-center">
								<p class="lead">Contestants</p>
								<h1 class="display-2">{{ Contestants.length }}</h1>
							</router-link>
						</div>
						<div class="col-sm-6">
							<router-link to="/admin/payments" class="btn w-100 h-100 btn-primary p-3 text-center">
								<p class="lead">Payment methods</p>
								<h1 class="display-2">{{ paymentMethods.length }}</h1>
							</router-link>
						</div>
						<div class="col-sm-6">
							<router-link to="/admin/votes" class="btn w-100 h-100 btn-warning p-3 text-center">
								<p class="lead">Total votes</p>
								<h1 class="display-2">{{ Votes.length }}</h1>
							</router-link>
						</div>
						<div class="col-sm-6">
							<router-link to="/admin/settings" class="btn w-100 h-100 btn-warning p-3 text-center">
								<h1 class="display-2"><i class="bi bi-gear"></i></h1>
								<p class="lead m-0">Settings</p>
							</router-link>
						</div>
					</div>
				</section>

				<!-- Nominee -->
				<section class="w-100" v-if="slug=='nominees'">
					<div class="d-flex mb-4">
						<h1 class="text-light my-auto">All Nominees</h1>
						<button @click="selectNominee(null)" class="btn ms-auto btn-secondary my-auto">Add new</button>
					</div>
					<add-nominee :nominee="editNominee" :reload-data="loadAll" />
					<p class="text-center py-5" v-if="loadData"><i class="spinner-border text-light"></i></p>
					<div class="table-responsive" v-else>
						<table class="table text-light">
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Name</th>
									<th scope="col">Category</th>
									<th scope="col">Votes</th>
									<th scope="col">Options</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(nom, idx) in Contestants" :key="idx">
									<th scope="row">{{ idx + 1 }}</th>
									<td class="d-flex">
										<div class="contest-img overflow-hidden border-0 p-1"
											style="width:50px;height:50px;background-color: rgba(59, 29, 9, .5);background:linear-gradient(185deg, rgba(59, 29, 9, .5), rgb(218, 165, 32));">
											<div class="w-100 h-100 rounded-circle overflow-hidden"><img :src="nom.image" class="w-100" :alt="nom.name" /></div>
										</div>
										<span class="ps-2 my-auto">{{ nom.name }}</span>
									</td>
									<td>{{ nom.category }}</td>
									<td>{{ nom.votes }}</td>
									<td>
										<a href="javascript:void(0)" class="btn text-primary p-1" @click="selectNominee(nom)">edit</a>
										<a href="javascript:void(0)" class="btn text-danger p-1" @click="resolveNominee(nom)">delete</a>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>

				<!-- Votes -->
				<section class="w-100" v-if="slug=='votes'">
					<h1 class="text-light mb-4">All Votes</h1>
					<p class="text-center py-5" v-if="loadData"><i class="spinner-border text-light"></i></p>
					<div class="table-responsive" v-else>
						<table class="table text-light table-hover">
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Voter's email</th>
									<th scope="col">Nominee</th>
									<th scope="col">Votes</th>
									<th scope="col">Amount</th>
									<th scope="col">Payment method/proof</th>
									<th scope="col">Date</th>
									<th scope="col">Action</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(vote, idx) in Votes" :key="idx" class="text-light">
									<th scope="row">{{ idx + 1 }}</th>
									<td>{{ vote.userEmail }}</td>
									<td><img :src="vote.image" width="25" /> <span class="ps-1">{{ getContestantById(vote.id)?.name??'...' }}</span></td>
									<td>{{ vote.votes }}</td>
									<td>${{ vote.amountPaid }}</td>
									<td>{{ vote.paymentMethod }} <a href="javascript:void(0)" @click.prevent="showProof(vote)" v-if="vote.proofFileName">Show reciept</a></td>
									<td>{{ formatFirestoreTimestamp(vote.createdAt) }}</td>
									<td>
										<a href="javascript:void(0)" class="btn text-danger p-1" @click="selectDeleteVote(vote)">delete</a>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>

				<!-- Payment Methods -->
				<section class="w-100" v-if="slug=='payments'">
					<div class="d-flex">
						<h1 class="text-light mb-4">Payment methods</h1>
						<button class="btn ms-auto btn-secondary my-auto" @click="selectMethod(null)">Add new</button>
					</div>
					<payment-method :method="editMethod" :reload-data="loadAll" />
					<p class="text-center py-5" v-if="loadData"><i class="spinner-border text-light"></i></p>
					<div class="table-responsive" v-else>
						<table class="table text-light table-hover">
							<thead>
								<tr>
									<th>Payment method</th>
									<th colspan="2">Tag</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(payment, idx) in paymentMethods" :key="idx" class="text-light">
									<td>
										<img :src="payment.icon" :alt="payment.name" width="45">
										<span class="ps-3">{{ payment.name }}</span>
									</td>
									<td>{{ payment.tag }}</td>
									<td>
										<a href="#" class="btn p-1 text-primary" @click="selectMethod(payment)">edit</a>
										<a href="#" class="btn p-1 text-danger" @click.prevent="resolvePaymentMethod(payment)">delete</a>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>

				<!-- Settings -->
				<section class="w-100" v-if="slug=='settings'">
					<h1 class="text-light mb-4">Settings</h1>
					<div class="row">
						<div class="col-sm-5 pb-4">
							<div class="w-100 rounded-3 p-3 shadow" style="background-color:rgba(255,255,255,.1);">
								<h1 class="mb-4 text-center text-muted" style="font-size:5em;"><i class="bi bi-person-circle"></i></h1>
								<div class="row my-tabs g-3">
									<div class="col-6 col-sm-12">
										<a href="#passwordTab" @click.prevent="settingsTab=null" class="btn border border-gold w-100" :class="{'active': !settingsTab}">Password</a>
									</div>
									<div class="col-6 col-sm-12">
										<a href="#emailTab" @click.prevent="settingsTab='email'" class="btn border border-gold w-100" :class="{'active': settingsTab=='email'}">Email</a>
									</div>
								</div>
							</div>
						</div>
						<div class="col-sm-7">
							<form id="passwordTab" v-if="!settingsTab" @submit.prevent="changeAdminPassword" class="w-100 rounded-3 p-3 shadow text-light" style="background-color:rgba(255,255,255,.1);">
								<h4 class="mb-4">Change password</h4>
								<div class="w-100 mb-3">
									<label class="mb-1">New password:</label>
									<input type="text" placeholder="Enter new password" v-model="passFD.new_password" class="form-control" required />
								</div>
								<div class="w-100 mb-3">
									<label class="mb-1">Confirm password:</label>
									<input type="text" placeholder="Retype new password" v-model="passFD.con_password" class="form-control" required />
								</div>
								<div class="w-100 mb-3">
									<label class="mb-1">Old password:</label>
									<input type="password" placeholder="Confirm old password" v-model="passFD.password" class="form-control" required />
								</div>
								<p class="ps-2 mb-0 pt-3">
									<button :disabled="loadEmail" style="scale:1.1;" type="submit" class="btn btn-warning px-4">
										<i class="spinner-border spinner-border-sm" v-if="loadEmail"></i> Change password
									</button>
								</p>
							</form>
							<form id="emailTab" v-else @submit.prevent="changeAdminEmail" class="w-100 rounded-3 p-3 shadow text-light" style="background-color:rgba(255,255,255,.1);">
								<h4 class="mb-4">Change Email</h4>
								<div class="w-100 mb-3">
									<label class="mb-1">New email address:</label>
									<input type="email" placeholder="Email address address" v-model="mailFD.email" class="form-control" required />
								</div>
								<div class="w-100 mb-3">
									<label class="mb-1">Enter password:</label>
									<input type="password" placeholder="Email password" v-model="mailFD.password" class="form-control" required />
								</div>
								<p class="ps-2 mb-0 pt-3">
									<button :disabled="loadEmail" style="scale:1.1;" type="submit" class="btn btn-warning px-4">
										<i class="spinner-border spinner-border-sm" v-if="loadEmail"></i> Change email
									</button>
								</p>
							</form>
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>

	
	<!-- mobile menu -->
	<div class="offcanvas offcanvas-start w-75 bg-dark text-light" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
		<div class="offcanvas-header">
			<h5 class="offcanvas-title" id="offcanvasExampleLabel">Vima Awards</h5>
			<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
		</div>
		<div class="offcanvas-body px-0">
			<sidenav :Logout="Logout" />
		</div>
	</div>
	
	<!-- Proof Modal -->
	<div class="modal fade" id="proofModal" tabindex="-1">
		<div class="modal-dialog modal-sm">
			<div class="modal-content text-light">
				<div class="modal-header border-0 d-block">
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body d-flex flex-column gap-3">
					<img v-for="img in openProofs" :src="img" class="w-100 border rounded mb-3" />
				</div>
			</div>
		</div>
	</div>
	
	<!-- Delete Modal -->
	<div class="modal fade" id="deleteModal" tabindex="-1">
		<div class="modal-dialog modal-sm">
			<div class="modal-content text-light">
				<div class="modal-header border-0 d-block">
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body d-flex flex-column gap-3">
					<p class="lead">Are you sure you want to delete this item?</p>
					<div class="d-flex gap-3">
						<button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">Cancel</button>
						<button type="button" :disabled="loadDeleteVote" class="btn btn-danger w-100" @click="resolveVote(voteToDelete)">
							<i class="spinner-border spinner-border-sm" v-if="loadDeleteVote"></i>
							<span v-else>Delete</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.dropdown-menu {
	background-color: #404040;
}
.dropdown-menu .dropdown-item { color: #cecece; }
.dropdown-menu .dropdown-item:hover { color: #6a6a6a; }
</style>
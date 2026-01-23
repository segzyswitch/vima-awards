<script lang="ts" setup>
const { $swal } = useNuxtApp();
const router = useRouter();

import { useAdminAuth } from '~/composables/useAdminAuth';
const { user, login } = useAdminAuth();
// go to dashboard if already logged in
if (user.value) router.push('/admin/dashboard');

const formdata:any = ref({
	email: '',
	password: ''
});
const loadData = ref(false);

// Login admin
async function loginAdmin() {
	loadData.value = true;
	// return console.log(formdata.value);
	try {
		const response = await login(formdata.value.email, formdata.value.password);
		if (!response.success) {
			$swal.fire({
				icon: 'warning',
				title: 'Login failed',
				text: 'Incorrect credentials!',
				confirmButtonText: 'OK',
				confirmButtonColor: '#ffc107'
			});
			return false;
		}
		$swal.fire({
			icon: 'success',
			title: 'Login successful',
			text: 'Welcome back, admin!',
			confirmButtonText: 'OK',
			confirmButtonColor: '#ffc107'
		});
		router.push('/admin/dashboard');
	} catch (error:any) {
		console.error('Login error:', error);
		await $swal.fire({
			icon: 'error',
			title: 'Login failed',
			text: error.message || 'An error occurred during login. Please try again.',
			confirmButtonText: 'OK',
			confirmButtonColor: '#dc3545'
		});
	} finally {
		loadData.value = false;
	}
}
</script>

<template>
<div class="w-100 vh-100 d-flex">
	<div class="container m-auto">
		<div class="row">
			<div class="col-sm-5 mx-auto">
				<div class="w-100 text-light shadow-lg rounded-3 py-3" style="background-color:rgba(0, 0, 0, .4);">
					<div class="card-body p-4">
						<!-- img logo -->
						<a class="d-flex mb-5 navbar-brand"><PageLogo class="m-auto" /></a>

						<h5 class="card-title text-gold mb-4 text-center">Sign in to admin dashboard</h5>

						<form @submit.prevent="loginAdmin">
							<div class="mb-3 text-start">
								<label for="email" class="form-label">Email address</label>
								<input type="email" class="form-control" id="email" v-model="formdata.email" required />
							</div>
							<div class="mb-4 text-start">
								<label for="password" class="form-label">Password</label>
								<input type="password" class="form-control" id="password" v-model="formdata.password" required />
							</div>
							<p class="text-center m-0">
								<button type="submit" class="btn btn-warning mx-auto" :disabled="loadData">
									<i class="spinner-border spinner-border-sm me-2" v-if="loadData"></i>
									<span>Login</span>
								</button>
							</p>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</template>
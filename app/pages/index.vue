<script setup lang="ts">
import { collection, getDocs } from "firebase/firestore";
const { $db } = useNuxtApp();
const locale = useLocaleStore();

const contestants = ref<any[]>([]);
const payment_methods = ref<any[]>([]);

// User client services
// const deviceInfo:any = ref({});
// try {
//   deviceInfo.value = await useHybridDeviceInfo();
// 	console.log("Device Info:", deviceInfo.value);
// } catch (err) {
//   console.log(err);
// }

onMounted(async () => {
	// fetch contestants
  const constestSnapshot = await getDocs(collection($db, "contestants"));
  contestants.value = constestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	// fetch payment methods
	const paymentSnapshot = await getDocs(collection($db, "payment_methods"));
	payment_methods.value = paymentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	// console.log(payment_methods.value);
});
</script>

<template>
	<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" style="height:60px;">
		<div class="container-fluid">
			<a class="navbar-brand d-inline-block" href="#" style="position:relative;top:20px;padding:5px 0;"><PageLogo /></a>
			<!-- <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button> -->
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<!-- <ul class="navbar-nav me-auto mb-2 mb-lg-0">
					<li class="nav-item">
						<a class="nav-link active" aria-current="page" href="#">Home</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#">Link</a>
					</li>
					<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
							Dropdown
						</a>
						<ul class="dropdown-menu" aria-labelledby="navbarDropdown">
							<li><a class="dropdown-item" href="#">Action</a></li>
							<li><a class="dropdown-item" href="#">Another action</a></li>
							<li><hr class="dropdown-divider"></li>
							<li><a class="dropdown-item" href="#">Something else here</a></li>
						</ul>
					</li>
					<li class="nav-item">
						<a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
					</li>
				</ul> -->
				<!-- <form class="d-flex">
					<input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
					<button class="btn btn-outline-success" type="submit">Search</button>
				</form> -->
			</div>
		</div>
	</nav>

	<header class="w-100 text-center py-4">
		<div class="container py-5 text-white mb-0">
			<h2 style="opacity:.7;">Category:</h2>
			<h1 class="display-4 text-uppercase py-3 text-gold">Best influencer / Modeling Awards</h1>
			<p class="lead">Select your favorite nominee below and click the image to cast your vote.</p>
		</div>
	</header>

	<section class="w-100 py-5 contest">
		<div class="container pb-5">
			<div class="w-100 text-center py-5" v-if="!contestants.length">
				<i class="spinner-border text-gold"></i>
			</div>
			<div class="row g-5 mb-5" v-else>
				<div v-for="(nominee, idx) in contestants" :key="idx" class="col-sm-4 text-center">
					<button class="w-100 h-100 card border-0 p-1 shadow-sm" data-bs-toggle="modal" :data-bs-target="`#Modal_${nominee.id}`">
						<div class="w-100 card-body bg-dark py-4 d-flex flex-column justify-content-center">
							<div class="col-9 col-sm-7 mx-auto py-3 rounded-circle mb-3">
								<!-- <div class="contest-img overflow-hidden"><img :src="nominee.image" class="w-100" :alt="nominee.name" /></div> -->
								<div class="contest-img overflow-hidden border-0 p-2"
									style="background-color: rgba(59, 29, 9, .5);background:linear-gradient(185deg, rgba(59, 29, 9, .5), rgb(218, 165, 32));">
									<div class="w-100 h-100 rounded-circle overflow-hidden"><img :src="nominee.image" class="w-100" :alt="nominee.name" /></div>
								</div>
							</div>
							<h6 class="card-title text-dark mb-3 text-uppercase ">
								<span class="p-1 px-2 bg-gold rounded-3 d-inline-block">{{ nominee.name }}</span>
							</h6>
							<p class="card-text lh-2 small text-uppercase mb-3">{{ nominee.category }}</p>
							<small class="heading-small mb-2"><span>nominee</span></small>
						</div>
						<img src="~/assets/img/card-lines.png"
							class="card-lines"
							style="position:absolute;opacity:.25;z-index:1;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;"
						/>
					</button>
					
					<!-- Modal -->
					<votingModal :nominee="nominee" :payment_methods="payment_methods" />
				</div>
			</div>
		</div>
	</section>
</template>
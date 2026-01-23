<template>
	<div class="logo-wrapper">
		<img src="/vima-logo.png" height="70" />
		<div class="logo-text">vima</div>
	</div>
</template>

<style scoped>
.logo-wrapper {
	border: 1px solid goldenrod;
	border-radius: 15px;
	width: 90px;
	position: relative;
	padding: 5px;
}
.logo-wrapper img {transform: scale(1.5);}
.logo-wrapper .logo-text {
	position: absolute;
	transform: rotateZ(-90deg);
	right: -10px;
	display: inline-block;
	top: 23px;
	padding: 1px 5px;
	background-color: goldenrod;
	color: black;
	border-radius: 10px;
}
</style>
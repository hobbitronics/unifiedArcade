<script>
    import Navbar from '../components/navbar.svelte'    
</script>

<Navbar/>
<div class="container">
    <slot />
</div>

<style>
    .container {
        position: relative;
        top: 72px;
    }

    @media only screen and (max-width: 840px) {
        .container {
            position: relative;
            top: 64px;
        }
    }
</style>

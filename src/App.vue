<script setup>
import TheHeader from "@/components/TheHeader.vue";
import ProductCard from "@/components/ProductCard.vue";
import { useProductStore } from "@/stores/ProductStore";
import { useCartStore } from "@/stores/CartStore";
import {reactive, ref} from "vue";

const cartStore = useCartStore()
const productStore = useProductStore()
const history = reactive([])
const future = reactive([])
const doingHistory = ref(false)

history.push((JSON.stringify(cartStore.$state)))

const redo = () => {
  const latesState = future.pop()

  if (!latesState) return

  doingHistory.value = true
  history.push(latesState)
  cartStore.$state = JSON.parse(latesState)
  doingHistory.value = false

}
const undo = () => {
  if (history.length === 1) return
  doingHistory.value = true
  future.push(history.pop())
  cartStore.$state = JSON.parse(history.at(-1))
  doingHistory.value = false
}

cartStore.$subscribe((mutation, state) => {
  if (!doingHistory.value) {
    history.push(JSON.stringify(state))
    future.splice(0, future.length)
  }
})

cartStore.$onAction(({ name, store, args, after, onError }) => {
  if (name === 'addItems') {
    after(() => {             // If your action return something, you can add a result to callback parameter
      console.log(args[0]);   // and use it on after or onError
    })
    onError((error) => {
      console.log("Hello error", error.message)
    })
  }
})

productStore.fill();
</script>

<template>
  <div class="container">
    <div class="mb-5 flex justify-end">
      <AppButton @click="undo">Undo</AppButton>
      <AppButton class="ml-2" @click="redo">Redo</AppButton>
    </div>
    <TheHeader />
    <ul class="sm:flex flex-wrap lg:flex-nowrap gap-5">
      <ProductCard
        v-for="product in productStore.products"
        :key="product.name"
        :product="product"
        @addToCart="cartStore.addItems($event, product)"

      />
    </ul>
  </div>
</template>

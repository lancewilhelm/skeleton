<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string;
    /**
     * Reserve vertical space so the form does not jump when the message appears.
     */
    minHeightRem?: number;
  }>(),
  {
    minHeightRem: 4,
  },
);
</script>

<template>
  <div
    class="relative mt-4 flex w-full justify-center"
    :style="{ minHeight: `${minHeightRem}rem` }"
    aria-live="polite"
    aria-atomic="true"
  >
    <Transition name="fade">
      <div
        v-if="message"
        class="absolute top-0 max-w-[320px] rounded border border-(--error-color) bg-(--error-color)/10 px-4 py-3 text-center text-sm text-(--error-color)"
        role="alert"
      >
        {{ message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
const showNukeConfirm = ref(false);
async function nukeData() {
  await $fetch("/api/nuke");
  showNukeConfirm.value = false;
  window.location.reload();
}

const syncStore = useSyncStore();
</script>

<template>
  <div class="w-full">
    <SettingsGroup
      title="Status"
      icon="lucide:cloud"
      description="status of the your cloud database"
    >
      <SettingsSubGroup title="Last Sync" icon="lucide:clock">
        <p class="text-sm text-(--text-color) mt-2">
          {{
            syncStore.lastSyncTime
              ? new Date(syncStore.lastSyncTime).toLocaleString()
              : "Never"
          }}
        </p>
      </SettingsSubGroup>
    </SettingsGroup>
    <SettingsGroup
      title="Pull"
      icon="lucide:git-pull-request"
      description="pull all data from the cloud"
    >
      <button
        class="bg-(--sub-alt-color) text-white font-bold py-2 px-4 rounded cursor-pointer"
        @click="syncStore.pull"
      >
        Pull Data
      </button>
    </SettingsGroup>
    <SettingsGroup
      title="Nuke"
      icon="lucide:bomb"
      description="delete all data from local and cloud storage. settings will not be affected."
    >
      <button
        class="bg-(--error-color)! text-(--bg-color)! font-bold py-2 px-4 rounded cursor-pointer"
        @click="showNukeConfirm = true"
      >
        Nuke Data
      </button>
      <p class="text-sm text-(--text-color) mt-2">
        This action is irreversible and will delete all your data.
      </p>
    </SettingsGroup>
    <!-- Modals -->
    <ModalWindow :open="showNukeConfirm" @close="showNukeConfirm = false">
      <div class="flex flex-col gap-4">
        <div class="font-bold">
          Are you sure you want to delete all your data? This action is
          irreversible.
        </div>
        <div class="flex w-full gap-4 justify-center">
          <button
            class="bg-(--error-color) text-white font-bold py-2 px-4 rounded cursor-pointer"
            @click="nukeData"
          >
            Yes
          </button>
          <button
            class="bg-(--sub-color) text-white font-bold py-2 px-4 rounded cursor-pointer"
            @click="showNukeConfirm = false"
          >
            No
          </button>
        </div>
      </div>
    </ModalWindow>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="dashboard-card">
    <h3 class="dashboard-title">
      {{ title }}
    </h3>

    <div class="dashboard-content">
      <slot></slot>
    </div>
  </section>
</template>

<style scoped>
.dashboard-card {
  margin-bottom: 30px;
  padding: 24px;
  border: 1px solid #d6deea;
  border-radius: 18px;
  background-color: #ffffff;
  color: #1f2937;
  box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
}

.dashboard-title {
  margin: 0 0 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #172033;
  font-size: 23px;
  line-height: 1.4;
}

.dashboard-content {
  width: 100%;
}

@media (max-width: 600px) {
  .dashboard-card {
    padding: 18px;
    border-radius: 15px;
  }

  .dashboard-title {
    font-size: 20px;
  }
}
</style>

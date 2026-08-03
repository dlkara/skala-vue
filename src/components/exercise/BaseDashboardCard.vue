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
  box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
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

/*
  dark-mode 클래스는 WeatherParent에 있으므로
  부모 클래스 참조를 위해 :global() 사용
*/

:global(.dark-mode) .dashboard-card {
  border-color: #334155;
  background-color: #172033;
  color: #e5e7eb;
  box-shadow: 0 10px 28px rgb(0 0 0 / 32%);
}

:global(.dark-mode) .dashboard-title {
  border-bottom-color: #334155;
  color: #f8fafc;
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

<template>
  <div :class="[
      currentFloor === floor ? 'elevator' : '',
      isJustArrived === true ? 'elevator-blinking' : '',
    ]">
    <p class="display">
      {{ currentFloor === floor && isMoving ? (currentFloor < targetFloor ? '↑' : '↓') : '' }}
      {{ currentFloor === floor ? targetFloor : '' }}
    </p>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["floor"],
  computed: {
    ...mapState(["currentFloor", "isMoving", "isJustArrived", "targetFloor"]),
  },
};
</script>

<style scoped>
/* Стили для подсветки текущего этажа */
.elevator {
  background-color: #00FEFF; /* Цвет текущего этажа */
  background-size: contain;
  min-height: 100%;
  padding: 0;
  margin: 0;
  color: white;
}

/* Анимация мигания при "трёхсекундном отдыхе" после остановки лифта */
.elevator-blinking {
  animation: blink 0.7s linear infinite;
}

@keyframes blink {
  0%, 49.9%, 100% {
    opacity: 0;
  }
  50%, 99.9% {
    opacity: 1;
  }
}

.display {
  margin: 0;
}
</style>
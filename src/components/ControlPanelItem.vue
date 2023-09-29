<template>
  <div class="button-container">
    <span>{{ floor }}</span>
    <button
        @click="callElevator(floor)"
        class="button-call"
        :class="{
          'elevator-in-progress': isMoving && (floor === targetFloor || callQueue.includes(floor)),
          'elevator-in-queue': !isMoving && callQueue.includes(floor),
        }"
    >о</button>
  </div>

</template>

<script>

import { mapActions, mapState } from "vuex";

export default {
  props: ["floor"],
  computed: {
    ...mapState(["currentFloor", "isMoving", "isJustArrived", "callQueue", "targetFloor"]),
  },
  methods: {
    ...mapActions(["callElevator"]),
  },
};
</script>

<style scoped>
  .button-container {
    display: flex;
    flex-direction: column;
    padding: 5px 10px 30px;
    font-size: 10px;
  }

  .button-call {
    background-color: #d1ccc5;
    border-radius: 10px;
    cursor: pointer;
  }

  .elevator-in-progress, .elevator-in-queue {
    background-color: #f7e5cd; /* Цвет кнопки, когда вызов уже в очереди или лифт находится в процессе обработки вызова  */
  }
</style>
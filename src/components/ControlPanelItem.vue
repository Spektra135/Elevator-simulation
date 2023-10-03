<template>
  <div class="button-container">
    <span>{{ floor }}</span>
    <button
        @click="callElevator(floor)"
        class="button-call"
        :class="{
           'elevator-in-progress': targetFloors.includes(floor) || callQueue.includes(floor),
        }"
    >о</button>
  </div>
</template>

<script>
  import { mapActions, mapState, mapGetters } from "vuex";

  export default {
    name: "ControlPanelItem",
    props: ["floor", "elevator"],
    computed: {
      ...mapState({
        callQueue: state => state.callQueue, // Получаем данные из state
      }),
      ...mapGetters({
        targetFloors: 'getTargetFloors',
      }),
    },
    methods: {
      ...mapActions(['callElevator']),
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
<template>
  <div>
    <div
        :class="[
        elevator.currentFloor === floor ? 'elevator' : '',
        elevator.isJustArrived && elevator.currentFloor === floor ? 'elevator-blinking' : '',
      ]"
    >
      <p class="display">
        {{ elevator.currentFloor === floor && elevator.isMoving ? (elevator.currentFloor < elevator.targetFloor ? '↑' : '↓') : '' }}
        {{ elevator.currentFloor === floor ? elevator.targetFloor : '' }}
        {{ elevator.currentFloor === floor && !elevator.isMoving ? elevator.currentFloor : '' }}

      </p>
    </div>
  </div>
</template>

<script>
  export default {
    name: "ElevatorItem",
    props: ["floor", "elevator"],
    computed: {
      currentFloor() {
        return this.elevator.currentFloor;
      },
      isMoving() {
        return this.elevator.isMoving;
      },
      isJustArrived() {
        return this.elevator.isJustArrived;
      },
      targetFloor() {
        return this.elevator.targetFloor;
      },
    },
  };
</script>

<style scoped>
  /* Стили для подсветки текущего этажа */
  .elevator {
    background-color: #00FEFF; /* Цвет текущего этажа */
    background-size: contain;
    width: 100%;
    min-height: 100%;
    padding: 0;
    margin: 0;
    color: white;
    border: 1px solid #ccc;
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

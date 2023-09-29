<template>
  <li class="floor">
    <div class="elevator-container">
      <ElevatorItem
          :floor="floor"
          :currentFloor="currentFloor"
          :isJustArrived="isJustArrived"
          :isMoving="isMoving"
          :targetFloor="targetFloor"
      />
    </div>

    <ControlPanelItem
        :floor="floor"
        :currentFloor="currentFloor"
        :isJustArrived="isJustArrived"
        :isMoving="isMoving"
        :targetFloor="targetFloor"
    />
  </li>
</template>

<script>
import ElevatorItem from "./ElevatorItem";
import ControlPanelItem from "./ControlPanelItem";
import { mapActions, mapState } from "vuex";

export default {
  components: { ElevatorItem, ControlPanelItem  },
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
.floor {
  list-style-type: none;
  display: flex;
  font-size: 24px;
  border: 1px solid #ccc;
  text-align: center;

}

.elevator-container {
  margin: 0;
  padding: 0;
  width: 10%;
  min-height: 100%;
  text-align: center;
  border: 1px solid #ccc;
}

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
<template>
  <div class="building-wrapper">
    <div class="building">
      <FloorItem
          v-for="floor in floors"
          :key="floor"
          :floor="floor"
          :currentFloor="currentFloor"
          :isMoving="isMoving"
          :isJustArrived="isJustArrived"
          :callQueue="callQueue"
          :targetFloor="targetFloor"
          @call-elevator="callElevator(floor)"
      />
    </div>
  </div>
</template>

<script>
import FloorItem from "@/components/FloorItem";
import { mapState, mapActions/*, mapMutations*/ } from "vuex";

export default {
  name: "App",
  components: {FloorItem},
  data() {
    return {
      floors: [1, 2, 3, 4, 5], // Список этажей
    };
  },
  created() {
    /*this.loadSavedState();*/
  },
  computed: {
    ...mapState(["currentFloor", "isMoving", "isJustArrived", "callQueue", "targetFloor"]),
    /*numberOfFloors() {
      return 10; // Замените на фактическое количество этажей
    },*/
  },
  methods: {
    ...mapActions(['callElevator', 'moveElevator', 'loadSavedState', 'saveState']),
  }
}
</script>

<style scoped>
  .building-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .building {
    display: flex;
    flex-direction: column-reverse;
    border: 1px solid #000;
    width: 900px;
  }
</style>
<template>
  <div class="building-wrapper">
    <div class="building">
      <FloorItem
          v-for="floor in floors"
          :key="floor"
          :floor="floor"
          :numberOfElevators="numberOfElevators"
          @call-elevator="callElevator(floor)"
      />
    </div>
  </div>
</template>

<script>
import FloorItem from "@/components/FloorItem";
import {mapState, mapActions, mapMutations, mapGetters} from "vuex";
import { config } from "../config/config";

  export default {
    name: "App",
    components: {FloorItem},
    data() {
      return {
        numberOfFloors: config.numberOfFloors,
        numberOfElevators: config.numberOfElevators,
      };
    },
    created() {
      const savedState = JSON.parse(localStorage.getItem('appState') || '{}');

      if (Object.keys(savedState).length === 0) {
        // Локальное хранилище пустое, вызываем createElevators
        this.$store.dispatch('createElevators');
      } else {
        this.$store.dispatch('loadSavedState');
      }
    },
  computed: {
    ...mapMutations(['assignElevatorToFloor']),
    ...mapState(['callQueue']),
    floors() {
      const floorList = [];
      for (let i = 1; i <= this.numberOfFloors; i++) {
        floorList.push(i);
      }
      return floorList;
    },
  },
  methods: {
    ...mapActions(['callElevator', 'loadSavedState']),
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
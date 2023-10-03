<template>
  <li class="floor">
    <ElevatorItem
        v-for="elevator in elevators" :key="elevator.id"
        :elevator="elevator"
        :floor="floor"
        class="elevator-container"
    />

    <ControlPanelItem
        :floor="floor"
    />
  </li>
</template>

<script>
  import ElevatorItem from "./ElevatorItem.vue";
  import ControlPanelItem from "./ControlPanelItem.vue";
  import { mapActions, mapState } from "vuex";
  import { config } from "../../config/config";

  export default {
    name: "FloorItem",
    components: { ElevatorItem, ControlPanelItem  },
    props: ["floor"],
    data() {
      return {
        numberOfFloors: config.numberOfFloors,
        numberOfElevators: config.numberOfElevators,
      };
    },
    computed: {
      ...mapState(['elevators', 'callQueue']),
    },
    methods: {
      ...mapActions(['callElevator']),
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
    display: flex;
    margin: 0 2px;;
    padding: 0;
    width: 20%;
    min-height: 100%;
    text-align: center;
    border: 1px solid #ccc;
  }
</style>
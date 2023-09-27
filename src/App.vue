<template>
  <div id="app">
      <div class="building ">
        <ul>
          <li class="floor" v-for="floor in floors" :key="floor">
            <!-- Левая часть: индикация этажей -->
            <div class="elevator-container">
              <!-- Динамически добавляются классы индикации движения лифта по этажам (через проезжаемые этажи и на целевом этаже)
               и мигания в состоянии покоя первые 3 секунды после остановки на целевом этаже -->
              <div :class="[currentFloor === floor ? 'elevator' : '', passedFloors.includes(floor) ? '' : '', isJustArrived === true ? 'elevator-blinking' : '']">
                <p class="display">
                {{ currentFloor === floor && isMoving ? (currentFloor < targetFloor ? '↑' : '↓') : '' }}
                {{ currentFloor === floor ? targetFloor : '' }}
                </p>
              </div>
            </div>
            <!-- Правая часть: кнопки вызова лифта и нумерация этажа -->
            <div class="button-container">
              <span>{{ floor }}</span>

              <!--<button  @click="callElevator(floor)">о</button>-->
              <button @click="callElevator(floor)" class="button-call" :class="{
                'elevator-in-progress': isMoving && (floor === targetFloor || callQueue.includes(floor)),
                'elevator-in-queue': !isMoving && callQueue.includes(floor)
              }">о</button>
            </div>
          </li>
        </ul>
      </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      floors: [ 7, 6, 5, 4, 3, 2, 1], // Список этажей
      currentFloor: 1, // Текущий этаж
      isMoving: false,
      isJustArrived: false,
      callQueue: [],
      passedFloors: [], // Список этажей, которые лифт проезжает не останавливаясь (транзитные этажи)
      targetFloor: null, // Этаж, к которому в данный момент направляется лифт
    }
  },
  created() {
    // Загрузите сохраненное состояние из локального хранилища при создании компонента
    this.loadSavedState();
    // если лифт двигался перед перезагрузкой - продолжить движение к целевому этажу
    if (this.targetFloor > 0 && this.isMoving) {
      this.moveElevator(this.targetFloor);
      // если очередь вызовов перед перезагрузкой была не пуста - продолжить движение по очереди вызовов
    } else if (this.callQueue.length > 0) {
      const nextFloor = this.callQueue.shift();
      this.targetFloor = nextFloor;
      this.moveElevator(nextFloor);
      // если лифт перед перезагрузкой был с сотоянии "трёхсекундного отдыха" - остановить мигание через 3 секунды
    } else if (this.isJustArrived) {
      setTimeout(() => {
        this.isJustArrived = false;
      }, 3000);
    }
  },
  methods: {
    callElevator(floor) {
      /*if (this.currentFloor === floor || this.callQueue.includes(floor)) {
        return
      }*/
      if (this.currentFloor === floor && !this.passedFloors.includes(floor)) {
        console.log('Лифт уже на выбранном этаже');
        this.moveElevator(floor);
        return;
      }
      if (this.callQueue.includes(this.targetFloor)) {
        console.log('Лифт уже на пути к выбранному этажу');
        return;
      }
      if (!this.isMoving) { // Когда лифт не движется
        if (this.callQueue.length === 0) { // если очередь вызовов пуста
          // Лифт поехал к выбранному этажу
          console.log('Лифт вызван и отправился на этаж', floor);
          this.moveElevator(floor);
          this.targetFloor = floor;
        } else {
          //если есть вызовы в очереди
          const nextFloor = this.callQueue.shift();
          this.targetFloor = nextFloor;
          this.moveElevator(nextFloor);
        }
        // Добавляем вызов в очередь, если лифт занят
      } else if (!this.callQueue.includes(floor) && floor !== this.targetFloor) {  // Проверяем, что выбранного этажа отсутствует в очереди и не является этажом, к которому в данный момент движется лифт
        console.log(`Лифт на этаж ${floor} помещён в очередь вызовов`);
        this.callQueue.push(floor);
      }
    },
    moveElevator(floor) {
      this.isMoving = true;
      // Метод для перемещения лифта к выбранному(целевому) этажу
      const direction = floor > this.currentFloor ? 1 : -1;

      const interval = setInterval(() => {
        // Обновляем текущий этаж и список транзитных этажей
        this.currentFloor += direction;
        this.passedFloors.push(this.currentFloor);
        this.saveState();

        // лифт прибыл на целевой этаж
        if (this.currentFloor === floor) {
          this.isMoving = false;
          clearInterval(interval); // Завершаем движение
          setTimeout(() => {
            // После ожидания, лифт "отдыхает"
            this.isJustArrived = true;
          }, 500);
          setTimeout(() => {
            this.isJustArrived = false;
            this.passedFloors = [];
            // если есть поступившие вызовы - лифт отправится после отдыха согласно очереди
            if (this.callQueue.length > 0) {
              const nextFloor = this.callQueue.shift();
              this.targetFloor = nextFloor;
              this.moveElevator(nextFloor);
            }
          }, 3000); // 3 секунды отдыха
          this.saveState();
        }
      }, 1000); // 1 этаж в секунду
    },
    loadSavedState() {
      // Получите сохраненное состояние из локального хранилища
      const savedState = localStorage.getItem('elevatorState');
      if (savedState) {
        const state = JSON.parse(savedState);

        // Восстановите сохраненное состояние
        this.currentFloor = state.currentFloor;
        this.isMoving = state.isMoving;
        this.isJustArrived = state.isJustArrived;
        this.callQueue = state.callQueue;
        this.passedFloors = state.passedFloors;
        this.targetFloor = state.targetFloor;
      }
    },

    saveState() {
      // Сохраните текущее состояние в локальное хранилище
      const state = {
        currentFloor: this.currentFloor,
        isMoving: this.isMoving,
        isJustArrived: this.isJustArrived,
        callQueue: this.callQueue,
        passedFloors: this.passedFloors,
        targetFloor: this.targetFloor,
      };

      localStorage.setItem('elevatorState', JSON.stringify(state));
    },
  },
}
</script>

<style>
  #app {
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

  .floor {
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

  /* Стили для подсветки текущего этажа */
  .elevator {
    background-color: #00FEFF; /* Цвет текущего этажа */
    background-size: contain;
    min-height: 100%;
    padding: 0;
    margin: 0;
    color: white;
  }

  .elevator-blinking {
     animation: blink 0.7s linear infinite; /* Анимация мигания */
  }

  @keyframes blink {
    0%, 49.9%, 100% {
      opacity: 0;
    }
    50%, 99.9% {
      opacity: 1;
    }
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
  }

  .elevator-in-progress, .elevator-in-queue {
    background-color: #facd8e; /* Цвет кнопки, когда вызов уже в очереди или лифт находится в процессе обработки вызова  */
  }

  .display {
    margin: 0;
  }
</style>

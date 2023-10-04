import Vue from "vue";
import Vuex from "vuex";
import { config } from "../../config/config";

Vue.use(Vuex);

export  default new Vuex.Store({
    state: {
        elevators: [], // Массив лифтов
        callQueue: [], // Общая очередь вызовов (массив номеров этажей)
    },
    mutations: {
        addElevator(state, elevator) {
            state.elevators.push(elevator);
        },
        setPassedFloors(state, passedFloors) {
            state.passedFloors = passedFloors;
        },
        setCurrentFloor(state, floor) {
            state.currentFloor = floor;
        },
        setIsMoving(state, isMoving) {
            state.isMoving = isMoving;
        },
        setIsJustArrived(state, isJustArrived) {
            state.isJustArrived = isJustArrived;
        },
        setCallQueue(state, callQueue) {
            state.callQueue = callQueue;
        },
        setTargetFloor(state, targetFloor) {
            state.targetFloor = targetFloor;
        },
        assignElevatorToFloor(state, { elevator, floor }) {
            // Назначаем лифту целевой этаж и включаем индикатор движения
            elevator.targetFloor = floor;
            elevator.isMoving = true;
            this.commit('saveState');

            // Метод для перемещения лифта к выбранному (целевому) этажу
            const direction = floor > elevator.currentFloor ? 1 : -1;

            const interval = setInterval(() => { // Запускаем движение лифта с заданным интервалом (1 секунду) на этаж
                if (elevator.targetFloor > 0) { // пока  лифт не доехал до целевого этажа
                    // Перемещаем лифт на следующий этаж в соответствии с направлением
                    elevator.currentFloor += direction;
                    this.commit('saveState');
                    // Записываем транзитные этажи в список (для проверки при вызове лифта)
                    if (elevator.targetFloor !== elevator.currentFloor) {
                        elevator.passedFloors.push(elevator.currentFloor);
                        this.commit('saveState');
                    }
                }

                // Когда лифт прибыл на целевой этаж
                if (elevator.targetFloor === elevator.currentFloor && !elevator.passedFloors.includes(floor)) {
                    console.log(`Лифт-${elevator.id} прибыл на целевой ${elevator.targetFloor} этаж `);
                    elevator.passedFloors = []; // Сбрасываем список транзитных этажей
                    elevator.targetFloor = null; // Сбрасываем целевой этаж
                    elevator.isMoving = false; // Сбрасываем целевой этаж
                    clearInterval(interval); // Завершаем движение
                    this.commit('saveState');

                    setTimeout(() => {
                        // По прибытии лифта на целевой этаж включаем индикатор "трёхсекундного" отдыха
                        elevator.isJustArrived = true;
                    }, 50);

                    setTimeout(() => {
                        elevator.isJustArrived = false; // убираем индикатор "трёхсекундного" отдыха лифта по прибытии
                        // если есть поступившие вызовы - лифт отправится после отдыха согласно очереди
                        if (state.callQueue.length > 0) {
                            // Выбираем первый этаж из очереди
                            const nextFloor = state.callQueue.shift();
                            console.log(`Лифт-${elevator.id} отправляется на следующий этаж: ${nextFloor}`);
                            // Устанавливаем его как целевой этаж для лифта
                            elevator.targetFloor = nextFloor;
                            // Отправляем лифт на вызов
                            this.commit("assignElevatorToFloor", { elevator, floor: nextFloor });
                            this.commit('saveState');
                        }
                    }, 3000); // 3 секунды отдыха
                }
            }, 1000); // 1 этаж в секунду
        },
        addCallToQueue(state, floor) { // Добавляем вызов в общую очередь (вызывается, когда все лифты заняты)
            state.callQueue.push(floor);
        },
        saveState(state) {
            localStorage.setItem('appState', JSON.stringify(state));
        },
        replaceState(state, newState) {
            // Заменяем текущее состояние новым состоянием
            Object.keys(state).forEach(key => {
                state[key] = newState[key];
            });

            // Проверяем наличие индикатора движения после перегазрузки страницы
            state.elevators.forEach(elevator => {
                if (elevator.isMoving) { // Если индикатор true - запускаем лифт к целевому этажу
                    this.commit('assignElevatorToFloor', {elevator, floor: elevator.targetFloor});
                } else if (state.callQueue.length > 0) { // если после остановки лифта есть вызовы в очереди - лифт отправится согласно очереди
                    // Выбираем первый этаж из очереди
                    const nextFloor = state.callQueue.shift();
                    console.log(`Лифт-${elevator.id} отправляется на следующий этаж: ${nextFloor}`);
                    // Устанавливаем его как целевой этаж для лифта
                    elevator.targetFloor = nextFloor;
                    // Отправляем лифт на вызов
                    this.commit("assignElevatorToFloor", { elevator, floor: nextFloor });
                    this.commit('saveState');
                }

                // Проверяем наличие индикатора "трёхсекундного отдыха" лифта
                if (elevator.isJustArrived) { // Если индикатор true - отменяем его через 3 секунды и перезаписываем состояние
                    setTimeout(() => {
                        elevator.isJustArrived = false;
                        this.commit('saveState');
                    }, 3000); // 3 секунды отдыха
                }
            });
        },
    },

    getters: {
        getTargetFloors: (state) => {
            return state.elevators.filter(elevator => elevator.targetFloor !== null).map(elevator => elevator.targetFloor);
        },
    },

    actions: {
        // Создание лифтов в зависимости от numberOfElevators
        createElevators({ commit, state }) {
            const numberOfElevators = config.numberOfElevators;
            for (let i = 1; i <= numberOfElevators; i++) {
                const elevator = {
                    id: i, // Уникальный ID для каждого лифта
                    currentFloor: 1, // Начальный этаж
                    passedFloors: [],  // Транзитные этажи, которые лифт проезжает по пути, не останавливаясь
                    isMoving: false, // Индикатор движения лифта
                    isJustArrived: false, // Индикатор "трёхсекундного отдыха" лифта по прибытии на целевой этаж
                    targetFloor: null, // Этаж, к которому в данный момент направляется лифт
                };
                commit("addElevator", elevator);
            }
        },

        loadSavedState({ commit }) {
            const savedState = JSON.parse(localStorage.getItem('appState'));
            commit('replaceState', savedState);
        },

        callElevator({ state, commit }, floor) {
            // Определяем, есть ли лифт на этом этаже
            const elevatorOnFloor = state.elevators.find(elevator => elevator.currentFloor === floor);

            // Определяем свободные лифты
            const freeElevators = state.elevators.filter(elevator => !elevator.isMoving);

            // Определяем движется ли лифт на целевой этаж
            const elevatorTargetFloor = state.elevators.find(elevator => elevator.targetFloor === floor);

            if (elevatorOnFloor && !elevatorOnFloor.isMoving) { // Лифт уже на этаже и в состоянии покоя, вызов пропускается
                console.log(`На ${floor} этаже уже есть лифт`);
                return;
            }

            if (elevatorTargetFloor) {  // Проверяем, не направляется ли уже лифт к целевому этажу
                console.log(`К ${floor} этажу уже движется лифт`);
                return;
            }

            // Если есть свободные лифты
            if (freeElevators.length > 0) {
                if (state.callQueue.length === 0) { // если очередь вызовов пуста
                    // Выбираем ближайший к этажу
                    const closestElevator = freeElevators.reduce((closest, elevator) => {
                        const distance = Math.abs(elevator.currentFloor - floor);
                        return distance < closest.distance ? { elevator, distance } : closest;
                    }, { elevator: null, distance: Infinity }).elevator;

                    if (closestElevator) {
                        // Оправляем лифт на целевой этаж
                        commit("assignElevatorToFloor", { elevator: closestElevator, floor });
                        this.commit('saveState');
                        console.log(`Лифт-${closestElevator.id} отправился на ${floor} этаж `);
                    }
                } else {  // если есть вызовы в очереди, добавляем ещё один (для ситуации "трёхсекундного отдыха")
                    if (!state.callQueue.includes(floor)) {
                        console.log(`Вызов на ${floor} этаж  помещён в очередь вызовов`);
                        commit("addCallToQueue", floor);
                    }
                }
            } else if (!state.callQueue.includes(floor) && !elevatorTargetFloor) { // Если нет свободных лифтов, этаж не содержится в общей очереди вызово и не является целевым этажом для движущихся лифтов, то добавляем вызов в общую очередь
                console.log(`Вызов на ${floor} этаж  помещён в очередь вызовов`);
                commit("addCallToQueue", floor);
            }
        },
    }
});
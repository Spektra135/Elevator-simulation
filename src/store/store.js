import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export  default new Vuex.Store({
    state: {
        currentFloor: 1, // Текущий этаж
        passedFloors: [], // Транзитные этажи, которые лифт проезжает по пути, не останавливаясь
        isMoving: false,
        isJustArrived: false,
        callQueue: [],
        targetFloor: null, // Этаж, к которому в данный момент направляется лифт
    },
    mutations: {
        setCurrentFloor(state, floor) {
            state.currentFloor = floor;
        },
        addPassedFloors(state, floor) {
            state.passedFloors.push(floor);
        },
        resetPassedFloors(state) {
            state.passedFloors = [];
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

        addToCallQueue(state, floor) {
            state.callQueue.push(floor);
        },
        setTargetFloor(state, targetFloor) {
            state.targetFloor = targetFloor;
        },

        resetTargetFloor(state) {
            state.targetFloor = null;
        },
    },
    getters: {

    },
    actions: {
        loadSavedState({ commit, dispatch }) {
            // Получаем сохраненное состояние из локального хранилища
            const savedState = localStorage.getItem('elevatorState');
            if (savedState) {
                const state = JSON.parse(savedState);

                // Восстанавливаем состояние
                commit('setCurrentFloor', state.currentFloor);
                commit('setIsMoving', state.isMoving);
                commit('setIsJustArrived', state.isJustArrived);
                commit('setTargetFloor', state.targetFloor);
                commit('setCallQueue', state.callQueue);

                if (state.callQueue.length > 0 && !state.isMoving) {  // Проверьте, есть ли вызовы в очереди, и если есть, начните движение лифта
                    dispatch('moveElevatorToNextFloor');
                } else if (state.isMoving) {            // Проверяем, двигался ли лифт на момент перезагрузки страницы, и если да, запускаем движение лифта
                    dispatch('moveElevator', state.targetFloor);
                }
                if (state.isJustArrived) {
                    setTimeout(() => {
                        commit('setIsJustArrived', false); // убираем индикатор "трёхсекундного" отдыха лифта по прибытии
                        dispatch('saveState');
                    }, 3000); // 3 секунды отдыха
                }
            }
        },
        saveState({ state }) {
            // Сохраняем текущее состояние в локальное хранилище
            const savedState = {
                currentFloor: state.currentFloor,
                isMoving: state.isMoving,
                isJustArrived: state.isJustArrived,
                callQueue: state.callQueue,
                targetFloor: state.targetFloor,
            };
            localStorage.setItem('elevatorState', JSON.stringify(savedState));
        },

        callElevator({ commit, dispatch, state }, floor) {
            if (state.currentFloor === floor && !state.passedFloors.includes(floor)) {  // Проверяем, не находится ли лифт в состоянии покоя на целевом этаже
                console.log('Лифт уже на выбранном этаже');
                return;
            }

            if (state.callQueue.includes(state.targetFloor)) {  // Проверяем, не направляется ли уже лифт к целевому этажу
                console.log('Лифт уже на пути к выбранному этажу');
                return;
            }

            if (!state.isMoving) { // Когда лифт не движется
                if (state.callQueue.length === 0) { // если очередь вызовов пуста
                    // Отправляем лифт к целевому этажу
                    console.log('Лифт вызван и отправился на этаж', floor);
                    dispatch('moveElevator', floor);
                    commit('setTargetFloor', floor);


                } else {
                    //если есть вызовы в очереди, добавляем ещё один (для ситуации "трёхсекундного отдыха")
                    commit('setCallQueue', [...state.callQueue, floor]);
                }
                // Добавляем вызов в очередь, если лифт движется
            } else if (!state.callQueue.includes(floor) && floor !== state.targetFloor) {  // Проверяем, что выбранного этажа отсутствует в очереди и не является этажом, к которому в данный момент движется лифт
                console.log(`Вызов лифт на этаж ${floor} помещён в очередь вызовов`);
                commit('setCallQueue', [...state.callQueue, floor]);
                dispatch('saveState');
            }
        },
        moveElevator({ commit, state, dispatch }, floor) {
            commit('setIsMoving', true);
            commit('setTargetFloor', floor);

            // Метод для перемещения лифта к выбранному (целевому) этажу
            const direction = state.targetFloor > state.currentFloor ? 1 : -1;

            const interval = setInterval(() => {
                if (state.targetFloor > 0) { // пока  лифт не доехал до целевого этажа
                    // Обновляем текущий этаж
                    commit('setCurrentFloor', state.currentFloor + direction);
                    // Записываем транзитные этажи в список (для проверки на вызов лифта)
                    if (state.targetFloor !== state.currentFloor) {
                        commit('addPassedFloors', state.currentFloor);
                    }
                }
                // Сохраняем данные в локальное хранилище
                dispatch('saveState');
                // Когда лифт прибыл на целевой этаж
                if (state.currentFloor === state.targetFloor && !state.passedFloors.includes(floor)) {
                    console.log(`Лифт прибыл на целевой этаж ${state.targetFloor}`);
                    commit('resetPassedFloors'); // Сбрасываем список транзитных этажей
                    commit('resetTargetFloor'); // Сбрасываем целевой этаж
                    commit('setIsMoving', false); // Убираем индикатор движения
                    clearInterval(interval); // Завершаем движение
                    setTimeout(() => {
                        // Включаем индикатор "трёхсекундного" отдыха лифта по прибытии
                        commit('setIsJustArrived', true);
                    }, 50);
                    setTimeout(() => {
                        commit('setIsJustArrived', false); // убираем индикатор "трёхсекундного" отдыха лифта по прибытии
                        // если есть поступившие вызовы - лифт отправится после отдыха согласно очереди
                        if (state.callQueue.length > 0) {
                            /*dispatch(' moveElevatorToNextFloor');*/
                            const nextFloor = state.callQueue.shift();
                            console.log(`Лифт отправляется на следующий этаж: ${nextFloor}`);
                            commit('setTargetFloor', nextFloor);
                            dispatch('moveElevator', nextFloor);
                        }
                    }, 3000); // 3 секунды отдыха
                    dispatch('saveState');
                }
            }, 1000); // 1 этаж в секунду
        },

        moveElevatorToNextFloor({ state, commit, dispatch }) {
            const nextFloor = state.callQueue.shift();
            console.log(`Лифт отправляется на следующий этаж: ${nextFloor}`);
            commit('setTargetFloor', nextFloor);
            dispatch('moveElevator', nextFloor);
        },
    }
});

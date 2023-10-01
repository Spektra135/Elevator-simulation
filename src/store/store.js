import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export  default new Vuex.Store({
    state: {
        currentFloor: 1, // Текущий этаж
        passedFloors: [],
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
        loadSavedState({ commit }) {
            // Получите сохраненное состояние из локального хранилища
            const savedState = localStorage.getItem('elevatorState');
            if (savedState) {
                const state = JSON.parse(savedState);
                // Восстановите сохраненное состояние
                commit('setCurrentFloor', state.currentFloor);
                commit('setIsMoving', state.isMoving);
                commit('setIsJustArrived', state.isJustArrived);
                commit('setCallQueue', state.callQueue);
                commit('setTargetFloor', state.targetFloor);
            }
        },

        saveState({ state }) {
            // Сохраните текущее состояние в локальное хранилище
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
            if (state.currentFloor === floor && !state.passedFloors.includes(floor)) {
                console.log('Лифт уже на выбранном этаже');
                return;
            }

            if (state.callQueue.includes(state.targetFloor)) {
                console.log('Лифт уже на пути к выбранному этажу');
                return;
            }

            if (!state.isMoving) { // Когда лифт не движется
                if (state.callQueue.length === 0) { // если очередь вызовов пуста
                    // Лифт поехал к выбранному этажу
                    console.log('Лифт вызван и отправился на этаж', floor);
                    dispatch('moveElevator', floor);
                    commit('setTargetFloor', floor);

                } else {
                    //если есть вызовы в очереди
                    commit('setCallQueue', [...state.callQueue, floor]);
                }
                // Добавляем вызов в очередь, если лифт занят (движется или "трёхсекундный отдых")
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
                if (state.targetFloor > 0) {
                    // Обновляем текущий этаж
                    commit('setCurrentFloor', state.currentFloor + direction);
                    if (state.targetFloor !==  state.currentFloor) {
                        commit('addPassedFloors', state.currentFloor);
                    }
                }
                // Сохраняем данные в локальное хранилище
                dispatch('saveState');
                // лифт прибыл на целевой этаж
                if (state.currentFloor === state.targetFloor && !state.passedFloors.includes(floor)) {
                    console.log(`Лифт прибыл на целевой этаж ${state.targetFloor}`);
                    commit('resetPassedFloors');
                    commit('resetTargetFloor');
                    commit('setIsMoving', false);
                    clearInterval(interval); // Завершаем движение
                    setTimeout(() => {
                        // После ожидания, лифт "отдыхает"
                        commit('setIsJustArrived', true);
                    }, 500);
                    setTimeout(() => {
                        commit('setIsJustArrived', false);
                        // если есть поступившие вызовы - лифт отправится после отдыха согласно очереди
                        if (state.callQueue.length > 0) {
                            const nextFloor = state.callQueue.shift();
                            console.log(`Лифт отправляется на следующий этаж: ${nextFloor}`);
                            dispatch('moveElevator', nextFloor);
                        }
                    }, 3000); // 3 секунды отдыха
                    dispatch('saveState');
                }
            }, 1000); // 1 этаж в секунду
        },

        moveElevatorToNextFloor({  commit, state, dispatch }, floor) {
            const nextFloor = state.callQueue.shift();
            console.log(`Лифт отправляется на следующий этаж: ${nextFloor}`);
            /*commit('setTargetFloor', nextFloor);*/
            dispatch('moveElevator', nextFloor);
            console.log(`nextFloor ${nextFloor}`);
        }
    }
});

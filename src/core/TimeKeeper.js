export class TimeKeeper {
    constructor(sId, oGame, fCallBack) {
        this.id = sId;
        this.startDate = new Date(2015, 1, 28); // February 28th, 2015
        this.currentDate = new Date(2015, 1, 28);
        this.game = oGame;
        this.counters = new Collection('timers', this);
        this.callback = fCallBack;
        return this;
    }
    // Method to handle a trip within the city (1/4 day)
    trip(iHours) {
        this.currentDate = dayjs(this.currentDate).add(iHours, 'hours').toDate();
        this.updateCounters(iHours / 24);
        this.saveState();
        this.callback();
    }
    // Method to add a counter
    addCounter(name) {
        if (!this.counters[name]) {
            this.counters[name] = 0;
        }
    }
    // Method to update counters (e.g., for calculating debts' interests)
    updateCounters(increment) {
        for (let counter in this.counters) {
            this.counters[counter] += increment;
        }
    }
    // Method to get the current date
    getCurrentDate() {
        const formattedDate = dayjs(this.currentDate);
        return formattedDate;
    }
    // Method to get the value of a specific counter
    getCounterValue(name) {
        return this.counters[name] || 0;
    }
    saveState(){
        this.game.db.set(this.id, {
            startDate: this.startDate,
            currentDate: this.currentDate,
        });
    }
    loadState(){
        const oData = this.game.db.get(this.id) || false;
        if (oData && oData.currentDate) {
            for (let key in oData) {
                this[key] = oData[key];
            }
        }
        this.callback();
    }
}
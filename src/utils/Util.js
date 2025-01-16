export class Util{
    constructor(oOwner){
        this.game = oOwner;
    }
    checkElementExists(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            setTimeout(() => this.checkElementExists(selector, callback), 2000);
        }
    }
    searchPlace(oRef){
        for (const [key, place] of Object.entries(this.game.places)) {
            if(place.reference == oRef){
            return place;
            };
        }
        return false;
    }
    getRandomPlace(sCity){
        const aSelected = [];
        for (const [key, place] of Object.entries(this.game.cities[sCity].places)) {
            aSelected.push(place.reference);
        }

        return aSelected[Math.floor(Math.random() * aSelected.length)];
    }
    loadAgentData(){
        const oAgentData = this.game.db.get('Agent');
        this.game.agent.setHealth(oAgentData.health);
        this.game.agent.receive(oAgentData.balance);
        this.game.agent.capacity = oAgentData.capacity;
    }
    transfer(oPayer, oReceiver, iAmount){
        if(oPayer.pay(iAmount) !== false){
            oReceiver.receive(iAmount);
            this.game.board.setStatus();
            return true;
        }
        return false;
    }
}
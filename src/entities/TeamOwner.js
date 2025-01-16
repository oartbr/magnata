import { NPC } from './NPC.js';

// a team owner is focused on financial interests and team management.
export class TeamOwner extends NPC {
    constructor(name, sPlace, oGame, teamName) {
        super(name, sPlace, oGame);
        this.teamName = teamName;
        return this;
    }
    setData(){
        this.saveState({teamName: this.teamName,
                        balance: this.wallet.balance});
    }
    getData(){
        const oData = this.loadState();
        if(oData){
        this.skillLevel = oData.skillLevel || 0;
        this.marketValue = oData.marketValue || 0;
        this.loyalty = oData.loyalty || 0;
        this.wallet.receive(oData.balance || 0);
        }
    }
    negotiateTransfer(playerName, offer) {
        if (offer > 500000) {
        this.wealth += offer;
        return `${this.name}, owner of ${this.teamName}, accepts the transfer deal for ${playerName}.`;
        } else {
        return `${this.name} rejects the offer. "That’s not enough for ${playerName}!"`;
        }
    }
    invest(amount) {
        if (amount > this.wealth) {
        return `${this.name} cannot invest ${amount}. Insufficient funds.`;
        } else {
        this.wealth -= amount;
        return `${this.name} invests ${amount} in ${this.teamName}.`;
        }
    }
    chat(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "Precisamos de um goleiro!");

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Mostrar jogadores', 'showOptions', this);
        this.game.board.createAction('Prometer para depois', 'showOptions', this);
    }                       
}

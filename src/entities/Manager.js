import { NPC } from './NPC.js';

// the manager represents a rival who competes for player deals.
export class Manager extends NPC {
    constructor(name, sPlace, oGame, reputation) {
        super(name, sPlace, oGame);
        this.reputation = reputation;
        return this;
    }
    setData(){
        this.saveState({reputation: this.reputation,
                        balance: this.wallet.balance});
    }
    getData(){
        const oData = this.loadState();
        if(oData){
        this.reputation = oData.reputation || 0;
        this.wallet.receive(oData.balance || 0);
        }
    }
    sabotage(playerName) {
        return `${this.name} tries to sabotage your deal with ${playerName}.`;
    }
    negotiateDeal(playerName, offer) {
        if (this.reputation > 7) {
        return `${this.name} outbids you and secures the deal for ${playerName}.`;
        } else {
        return `${this.name} fails to secure the deal due to low reputation.`;
        }
    }
    chat(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "Tem algum jogador que preste?");

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Mostrar jogadores', 'showOptions', this);
        this.game.board.createAction('Perguntar por trocas', 'showOptions', this);

    }               
}
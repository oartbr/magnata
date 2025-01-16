import { NPC } from './NPC.js';

// the player has attributes like skill level, market value, and loyalty.
export class Player extends NPC {
    constructor(name, sPlace, oGame, skillLevel, marketValue, loyalty) {
        super(name, sPlace, oGame);
        this.skillLevel = skillLevel;
        this.marketValue = marketValue;
        this.loyalty = loyalty;
        return this;
    }
    setData(){
        this.saveState({skillLevel: this.skillLevel,
                        marketValue: this.marketValue,
                        loyalty: this.loyalty,
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
    negotiate(playerOffer) {
        if (playerOffer >= this.marketValue) {
        return `${this.name} agrees to the deal.`;
        } else {
        return `${this.name} refuses the offer. "I’m worth more than that!"`;
        }
    }
    train() {
        this.skillLevel += 1;
        return `${this.name} trains hard and improves their skill to ${this.skillLevel}.`;
    }
    chat(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "Fala Magnata, tem algo pra mim?");

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Propor um time', 'showOptions', this);
        this.game.board.createAction('Pedir tempo', 'showOptions', this);
        this.game.board.createAction('Pedir fofocas', 'showOptions', this);
    }
}
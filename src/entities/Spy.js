import { NPC } from './NPC.js';

// the spy will bring insiders information from the market
export class Spy extends NPC {
    constructor(name, sPlace, oGame, iRetainer, iDailyFee) {
        super(name, sPlace, oGame);
        this.retainer = iRetainer;
        this.dailyFee = iDailyFee;
        return this;
    }
    setData(){
        this.saveState({retainer: this.retainer,
                        dailyFee: this.dailyFee,
                        balance: this.wallet.balance});
    }
    getData(){
        const oData = this.loadState();
        if(oData){
        this.retainer = oData.retainer || 0;
        this.dailyFee = oData.dailyFee || 0;
        this.wallet.receive(oData.balance || 0);
        }
    }
    chat(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "Tenho muito pra te contar.");

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Quero informação', 'showOptions', this);
        this.game.board.createAction('Contar rumores', 'showOptions', this);
    }
}
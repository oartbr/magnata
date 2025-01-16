import { NPC } from './NPC.js';

// the fixer will chase the player if they doesn't pay their debts
export class Fixer extends NPC {
    constructor(name, sPlace, oGame, iSpeed, iStrength, iLoyalty) {
        super(name, sPlace, oGame);
        this.speed = iSpeed;
        this.strength = iStrength;
        this.loyalty = iLoyalty;
        this.boss = {};
        return this;
    }
    setData(){
        this.saveState({speed: this.speed,
                        strength: this.strength,
                        loyalty: this.loyalty,
                        boss: this.boss,
                        balance: this.wallet.balance});
    }
    getData(){
        const oData = this.loadState();
        if(oData){
        this.speed = oData.speed || 10;
        this.strength = oData.strength || 10;
        this.loyalty = oData.loyalty || 0;
        this.boss = oData.boss || 0;
        this.wallet.receive(oData.balance || 0);
        }
    }
    chat(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.game.board.resetComm();

        this.getChat("Tu acha o Magnata, que está devendo grana pro seu Laerte e anda fujindo. Pede pra pagar ou terá consequencias. Seja bem curto e grosso.", "cobrador de um agiota")
            .then(response=>this.say(response));
        

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Correr', 'die', this.game.board);
        this.game.board.createAction('Pagar', 'pay', this);
    }
}

import { NPC } from './NPC.js';

// an Assistant can offer general help
export class Assistant extends NPC {
    constructor(name, sPlace, oGame) {
        super(name, sPlace, oGame);
        return this;
    }
    setData(){
        this.saveState({
                        balance: this.wallet.balance});
    }
    getData(){
        const oData = this.loadState();
        if(oData){
        this.wallet.receive(oData.balance || 0);
        }
    }
    chat(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.game.board.resetComm();
        // this.game.board.say(`${this.name}`, "Diga chefe, como te ajudo?");
        this.getChat("O teu chefe aparece no hotel. Você adora ele. Pergunta o que ele quer.", "assistente do Magnata, um agente esportivo.")
            .then(response=>this.say(response));

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Quem ligou?', 'showOptions', this);
        this.game.board.createAction('Traz café', 'showOptions', this);
        this.game.board.createAction('Faz um pix', 'fazerPix', this);
    }
    fazerPix(){
        this.game.board.resetComm();
        //this.game.board.say(`${this.name}`, "De quanto você precisa?");
        this.getChat(`O teu chefe pede dinheiro. Pergunta quanto quer, vai dar o que puder. Seja bem curta e direta, não comente sobre valores exatos.`, `assistente do Magnata, um agente esportivo.`)
            .then(response=>this.say(response));

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('5000', 'transfer', this, 5000);
        this.game.board.createAction('10000', 'transfer', this, 10000);
    }

    transfer(oEL, iAmount){
        const anyAmount = (iAmount > this.wallet.balance) ? Math.random() * this.wallet.balance : Math.random() * iAmount;
        if(this.game.util.transfer(this, this.game.agent, anyAmount)){
            //this.wallet.pay(iAmount);
            //this.game.agent.receive(iAmount);
            this.debt += anyAmount;

            this.game.board.resetComm();
            this.getChat(`Explica que fez uma transferencia de ${anyAmount.toFixed(2)}, mas precisa de volta logo. Seja bem curta e direta.`, ` assistente do Magnata, um agente esportivo. Você adora o cara.`)
            .then(response=>this.say(response));

        } else {
            this.game.board.resetComm();
            this.game.board.say(`${this.name}`, `Não vai dar, não tenho esse dinheiro agora...`);
        }

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('Continuar', 'chat', this);
        this.game.board.createAction('Sair', 'showPlaces', this.game.board);
    }
    
}
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
        this.getChat(`O teu chefe pede dinheiro. Pergunta quanto quer, você só tem ${this.wallet.balance}. Seja bem curta e direta.`, `assistente do Magnata, um agente esportivo.`)
            .then(response=>this.say(response));

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('5000', 'pix5k', this);
        this.game.board.createAction('10000', 'pix10k', this);

        this.pix5k = function(){
        this.game.util.transfer(this, this.game.agent, 5000);
        this.game.board.resetComm();
        //this.game.board.say(`${this.name}`, "Pronto, já fiz e agora?");
        this.getChat(`Explica que que já fez uma transferencia que ele pediu. Seja bem curta e direta.`, `assistente do Magnata, um agente esportivo.`)
            .then(response=>this.say(response));

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('Continuar', 'chat', this);
        this.game.board.createAction('Sair', 'showOptions', this.game.board);
        };
        this.pix10k = function(){
        this.game.agent.receive(10000);
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "Feito!");

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('Continuar', 'chat', this);
        this.game.board.createAction('Sair', 'showOptions', this.game.board);
        };
    }
}
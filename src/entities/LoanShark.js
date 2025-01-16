import { NPC } from './NPC.js';

// the LoanShark will lend money to the player and eventually tell him some gossip
export class LoanShark extends NPC {
    constructor(name, sPlace, oGame, iInterest, iCreditLimit, iCreditScore, iDebt) {
        super(name, sPlace, oGame);
        this.creditLimit = iCreditLimit || 1000;
        this.creditScore = iCreditScore || 1;
        this.debt = iDebt || 0;
        this.interest = iInterest || 0.10;
        this.lastRecalc = '';
        return this;
    }
    setData(){
        this.saveState({creditLimit: this.creditLimit,
                        creditScore: this.creditScore,
                        debt: this.debt,
                        interest: this.interest,
                        balance: this.wallet.balance,
                        lastRecalc: this.lastRecalc == '' ? this.game.timer.getCurrentDate() : this.lastRecalc});
    }
    getData(){
        const oData = this.loadState();
        if(oData){
            this.creditLimit = oData.creditLimit || 0;
            this.creditScore = oData.creditScore || 1;
            this.debt = oData.debt || 0;
            this.interest = oData.interest || 0;
            this.wallet.receive(oData.balance || 0);
            this.lastRecalc = oData.lastRecalc;
        }
    }
    setLimit(iAmount){
        if(iAmount > 0){
        this.creditLimit = iAmount;
        this.log(`Seu limite agora é ${iAmount}`);
        }
        return this;
    }
    recalculate(){
        if(this.debt == 0){
            return;
        }
        const currentDate = dayjs(this.game.timer.getCurrentDate());
        const lastRecalcDate = dayjs(this.lastRecalc == '' ? currentDate : this.lastRecalc);
        const diff = currentDate.diff(lastRecalcDate, 'days');

        if(diff > 0){
            this.debt += Math.floor((((this.interest/30) * diff) * this.debt));
            this.lastRecalc = currentDate;
        }
    }
    chat(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, `Me conta, o que você quer? Vai pagar meus ${this.debt}?`);

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Preciso de grana', 'borrow', this);
        if(this.debt > 0){
        this.game.board.createAction('Não, deixa assim', 'showOptions', this.game.board);
        this.game.board.createAction('Quero pagar', 'repay', this, 0);
        } else {
        this.game.board.createAction('Só passei para dar oi', 'showOptions', this.game.board);
        }
    }
    repay(){
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, `Quanto você vai pagar?`);

        this.game.board.createAction('<', 'chat', this);

        if(this.debt >= 5000){
        this.game.board.createAction('5000', 'processPayment', this, 5000);
        }
        if(this.debt >= 10000){
        this.game.board.createAction('10000', 'processPayment', this, 10000);
        }
    }
    borrow(){
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, `De quanto você precisa? Você já me deve ${this.debt}`);

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('5000', 'processCredit', this, 5000);
        this.game.board.createAction('10000', 'processCredit', this, 10000);
    }
    processPayment (oEl, iAmount){
        if(this.game.util.transfer(this.game.agent, this, iAmount)){
            this.debt -= iAmount;

            this.creditScore = this.creditScore * 1.05;
            this.creditLimit += iAmount * 0.5;
            
            this.game.board.resetComm();
            this.game.board.say(`${this.name}`, `Ótimo, que bom que posso confiar em você!`);

            this.game.board.createAction('<', 'showOptions', this.game.board);
            this.game.board.message(`Obrigado! Agora confio mais em você (${this.creditScore.toFixed(2)})`);
            this.game.board.setStatus();
        } else {
            this.game.board.resetComm();
            this.game.board.say(`${this.name}`, `Ha! não tem grana, como vai pagar?`);

            this.game.board.createAction('<', 'showOptions', this.game.board);
            this.game.board.createAction('Sair correndo', 'showPlaces', this.game.board);
            this.game.board.setStatus();
        }
    }
    processCredit (oEl, iAmount){
        if(this.game.util.transfer(this, this.game.agent, iAmount)){
        //this.wallet.pay(iAmount);
        //this.game.agent.receive(iAmount);
        this.debt += iAmount;

        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, `Ponto, já passei para a sua conta.`);

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('Continuar', 'chat', this);
        this.game.board.createAction('Sair', 'showOptions', this.game.board);
        this.game.board.message(`Tem 15% de juros ao mês. Precisa pagar em 30 dias!`);

        } else {
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, `Não vai dar, não tenho esse dinheiro agora...`);
        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('Continuar', 'chat', this);
        this.game.board.createAction('Sair', 'showPlaces', this.game.board);
        }
    }
}
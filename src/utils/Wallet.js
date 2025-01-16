export class Wallet{
    constructor(oOwner){
        this.balance = 0;
        this.owner = oOwner;
        return this;
    }
    pay(iAmount){
        const iResult = this.balance - iAmount;
        if(iResult >= 0 && iAmount > 0){
        this.balance -= iAmount;
        return this.balance;
        } else {
        return false;
        }
    }
    receive(iAmount){
        if(iAmount > 0){
        this.balance += iAmount;
        }

        return this.balance;
    }
    checkBalance(){
        return this.balance;
    }
    message(sMessage, oSender){
        this.owner.message(sMessage, oSender);
    }
}
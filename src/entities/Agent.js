import { Entity } from './Entity.js';

export class Agent extends Entity{
    constructor(iCapacity, sLocation, oGame){
        super('Agent', '', oGame);
        this.capacity = iCapacity;
        this.usedCapacity = 0;
        this.storage = {};
        this.health = 100;
        this.location = sLocation;
        this.dead = false;
        this.contacts = [];
    }
    setData(){
        this.saveState({health: this.health,
                        capacity: this.capacity,
                        balance: this.wallet.balance});
    }
    getData(){
        const oData = this.loadState();
        if(oData){
        this.health = oData.health || 0;
        this.capacity = oData.capacity || 10;
        this.wallet.receive(oData.balance || 0);
        }
    }
    increaseCapacity(iCap){
        if(iCap > 0 && !this.dead){
        this.capacity += iCap;
        }
        return this.capacity;
    }
    setHealth(iVal){
        this.health = iVal;
    }
    heal(iVal){
        const iHealth = this.health + iVal;
        if(iHealth <= 100 && iVal > 0 && !this.dead){
        this.health += iVal;
        } else if (iHealth > 100){
        this.health = 100;
        }
        return this.health;
    }
    damage(iVal){
        const iHealth = this.health - iVal;
        if(iHealth > 0 && iVal > 0 && !this.dead){
        this.health -= iVal;
        } else if (iHealth < 0){
        this.health = 0;
        this.die();
        }
        return this.health;
    }
    updateStatus(){
        this.game.board.setStatus();
    }
    die(){
        this.dead = true;
        this.health = 0;
        this.game.dead();
        return true;
    }
    goBroke(){
        this.dead = true;
        this.health = 0;
        this.game.broke();
        return true;
    }
    buy(sProduct, iQuantity, iPrice){
        const iRoom = this.capacity - this.usedCapacity;

        if(iRoom > iQuantity &&  iQuantity > 0 && this.pay(iQuantity * iPrice)){
        this.usedCapacity += iQuantity;
        const avgPrice = (this.storage[sProduct].price * this.storage[sProduct].quantity) + (iPrice * iQuantity);
        this.storage[sProduct].quantity += iQuantity;
        this.storage[sProduct].price = avgPrice;
        return true;
        } else if (iRoom < iQuantity){
        this.error = "We don't have room for that!";
        }  else if (iQuantity < 0){
        this.error = "Amount is negative!";
        } else {
        this.error = "Not enough money for that purchase!";
        }
        return false;
    }
    sell(sProduct, iQuantity, iPrice){
        const iResult = this.storage[sProduct].quantity - iQuantity;
        if(iQuantity > 0 && iPrice > 0 && iResult >= 0){
        this.usedCapacity -= iQuantity;
        this.receive(iQuantity*iPrice);
        return true
        } else if (iQuantity <= 0){
        this.error = "The quantity has to be more than zero!";
        } else if (iPrice <= 0){
        this.error = "The price has to be more than zero!";
        } else if (iResult){
        this.error = "We don't have that quantity of " + sProduct + "!";
        }
        return false;
    }
    message(sMessage, oSender){
        this.game.message(sMessage, oSender);
    }
    spend(iAmount, sReason = " em Uber!"){
        const sRand = 1 + (40 - Math.floor(Math.random()*80))/100;
        const sResult = Math.floor(iAmount * sRand);
        
        if(iAmount > 0){
        this.pay(Math.floor(sResult));
        this.game.board.spent(`<span class="money">${sResult}</span>`, sReason);
        }
    }
}
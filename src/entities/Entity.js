export class Entity{
    constructor(sName, sPlace, oGame){
        this.id = sName;
        this.name = sName;
        this.place = sPlace;
        this.game = oGame;
        this.wallet = new Wallet(this);

        this.register();
    }
    register(){
        this.game.entities.register(this);
    }
    log(sMess){
        console.log(`${this.name}: ${sMess}`);
    }
    setData(){
        console.log(`${this.name}: setdData rror!`);
    }
    saveState(oData){
        this.game.db.set(this.id, oData);
        //console.log(oData);
    }
    getData(){
        console.log(`${this.name}: getData error!`);
    }
    loadState(){
        return this.game.db.get(this.id) || false;
    }
    receive(iAmount){
        const bSuccess = this.wallet.receive(iAmount);
        this.log(`Received ${(bSuccess !== false) ? iAmount : 'nothing'}!`);

        return this;// this allows the receive() method to be chainable, and doesn't affect the result, since it is a boolean and there is no need to return it.
    }
    pay(iAmount){
        const bSuccess = this.wallet.pay(iAmount);
        this.log(`Paid ${(bSuccess !== false) ? iAmount : 'nothing'}!`);

        return bSuccess;
    }
}
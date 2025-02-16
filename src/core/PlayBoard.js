export class PlayBoard{
    constructor(sId, oOwner){
        this.id = sId;
        this.game = oOwner;
        this.db = this.game.db;
        this.util = this.game.util;
        this.el = $('<div id="' + sId + '_board" class="gameBoard"/>');
        $('body').append(this.el);

        this.commActions = '.commActions';

        this.page = [];
        this.action = [];

        this.setup();
        return this;
    }
    setup(){
        const sMainPage = $(`<div class="firm">
                                <div>Magnata: Carpe diem!</div>
                            </div>
                            <div class="status">
                                <div><h3>Data</h3><span class="statusDate"></span></div>
                                <div><h3>Lugar</h3><span class="statusLocation">🗲</span></div>
                                <div><h3>Dividas</h3><span class="statusDebt money">🗲</span></div>
                                <div><h3>Saúde</h3><span class="statusHealth"></span></div>
                            </div>
                            <div class="values">
                                <div class="warehouse">
                                    <div class="stockValue floatLeft">Contratos</div>
                                </div>
                                <div class="stock">
                                    <div class="stockValue floatLeft">Jogadores <span class="stockCapacity"></span></div>
                                    <div class="stockValue floatRight">Promesas <span class="stockPromises">🗲</span></div>
                                </div>
                                <div class="balance">
                                    <div class="stockValue floatLeft">Cash: <span class="balanceCash money"></span></div>
                                    <div class="stockValue floatRight">Banco: <span class="balanceBank money">🗲</span></div>
                                </div>
                            </div>
                            <div class="comm">
                                <div class="commMessage">...</div>
                                <div class="commActions"></div>
                                <div class="commSay"></div>
                            </div>
                            `);

        $(this.el).append(sMainPage);
    }
    moveTo(x,y){
        $(this.el).css("left", x).css("top", y);
    }
    resize(x,y){
        $(this.el).css("width", x).css("height", y);
    }
    addPage(sId){
        this.page[sId] = new Page(sId, this);
        return this.page[sId];
    }
    spent(iAmount, sType){
        $(this.el).append(`<div class="spent">${sType}: ${iAmount}</div>`);
    }
    createAction(sTitle, fAction, oEntity, sVal = 0, iFee = 0){
        const oAction = new Magnata.Place(sTitle, false, false);
        const oAgent = this.game.agent;

        if(sTitle == '<'){
            $(oAction.el).addClass('returnButton');
        }

        $(oAction.el).click(()=>{ oAgent.spend(iFee);
                                console.log(iFee, "fee");
                                oEntity[fAction](this.commActions, sVal, iFee);
                                });     
        $(this.commActions).append(oAction.el);
        return oAction.el;
    }
    createInput(sTitle, fAction, oEntity, sVal = 0){
        const oAction = new Magnata.Place(sTitle, false, false);
        //const oComm = this.commActions;
        $(oAction.el).click(()=>oEntity[fAction](this.commActions, sVal));
        $(this.commActions).append(oAction.el);
        return oAction.el;
    }
    resetComm(){
        $('.commMessage').empty();
        $('.commActions').empty();
        $('.commSay').empty();
    }
    say(sWho, sMessage){
        $('.commMessage').remove();
        $('.comm').prepend(`<div class="commMessage">${sWho}: ${sMessage}</div>`);
    }
    message(sMessage){
        $(this.commActions).append(`<div class="commSay">${sMessage}</div>`);
    }
    arrive(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.say("Assistente", "Você está em " + sPlace.id);
        //this.util.loadAgentData();
        this.game.entities.getData();
        this.setStatus();
        this.showOptions();
        if(typeof this.game.currentPlace.fare != 'undefined'){
        this.game.agent.spend(this.game.currentPlace.fare, this.game.currentPlace.id);
        }
        return this.game.places;
    }
    setStatus(){
        this.setCity();
        this.setHealth();
        this.setBalance();
        this.setDebt();
        this.updateDate();
        this.game.entities.setData();
    }
    updateDate(){
        $('.statusDate').text(this.game.timer.getCurrentDate().format('DD/MM/YYYY'));
        const aSharks = this.game.entities.map(entity=>(typeof entity.debt != 'undefined') ? entity.recalculate() : void(0));
    }
    setCity(){
        $(".statusLocation").text(this.game.currentPlace.city.id);
    }
    setDebt(){
        const aSharks = this.game.entities.filter(npc=>npc.debt != undefined);
        let iDebt = 0;
        aSharks.forEach(shark=>iDebt+=shark.debt);
        $(".statusDebt").text(iDebt.toLocaleString('pt-BR'));
    }
    setHealth(){
        const health = this.game.agent.health;
        let sStatus = 'Perfeita';
        if(health < 20){
        sStatus = "Crítica";
        } else if(health >= 20 && health < 50){
        sStatus = "Ruim";
        } else if(health >= 50 && health < 85){
        sStatus = "Boa";
        }
        $(".statusHealth").text(sStatus + ": " + this.game.agent.health);
    }
    setBalance(){
        $(".balanceCash").text(this.game.agent.wallet.balance.toLocaleString('pt-BR'));
        $(".balanceBank").text((0).toLocaleString('pt-BR'));
    }
    findContacts(oPlace){
        for (const [key, contact] of Object.entries(oPlace.contacts)) {
        if(true){
            this.createAction(`Falar com ${key}`, contact.action.name, contact);
        }
        }
    }
    showOptions(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.resetComm();
        this.say("Assistente", "O que vai fazer agora?");

        this.createAction('<', 'showPlaces', this);

        this.findContacts(this.game.currentPlace);

        if(this.game.currentPlace.airport){
        this.createAction('Viajar', 'showCities', this);
        }
        
    }
    showPlaces(oElement){
        this.resetComm();
        this.say("Motorista", "Qual o seu destino?");
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace.id;

        this.createAction('<', 'showOptions', this);

        $(oElement).prepend('<div style="float:left"></div>');
        for (const [key, place] of Object.entries(this.game.cities[sCity].places)) {
        if(place.id != sPlace){
            $(oElement).append(place.getButton());
        }
        }

        return $(oElement);
    }
    showCities(oElement){
        this.resetComm();
        this.say("Assistente", "Onde você quer viajar?");
        const sCity = this.game.currentPlace.city.id;
        $(oElement).html("");
        $(oElement).prepend('<div style="float:left"></div>');

        this.createAction('<', 'showOptions', this);

        for (const [key, city] of Object.entries(this.game.cities)) {
        if(sCity != city.id && typeof city.getButton == 'function'){
            $(oElement).append(city.getButton());
        }
        }

        return this.game.cities;
    }
    die(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.resetComm();
        $(this.commActions).append('<div style="width:100%;height:70%;text-align:center;font-size:2rem;color:#fff;margin-top:8px">Você morreu!</div>');
    }
    /* these must be functions:
    magnata.board.addAction("showOptions"); // shows options on a place
    magnata.board.addAction("showPlaces"); // asks to go to another place
    magnata.board.addAction("showCities"); // asks to travel
    magnata.board.addAction("chatToContact"); // chats to a contact
    magnata.board.addAction("checkOffer"); // ask a contact for offer
    magnata.board.addAction("buyPlayer"); // buys a player
    magnata.board.addAction("sellPlayer"); // sells a player
    magnata.board.addAction("receiveMessage"); // receives a message
    magnata.board.addAction("pay"); // gives money to a contact
    magnata.board.addAction("receive"); // asks money from a contact
    magnata.board.addAction("deposit"); // deposits money in the bank
    magnata.board.addAction("withdraw"); // withdraws money from the bank
    magnata.board.addAction("fight"); // fights with a contact
    magnata.board.addAction("run"); // runs from a contact
    magnata.board.addAction("heal"); // improves health
    magnata.board.addAction("die"); // ends game with health zero
    magnata.board.addAction("abandon"); // asks to abandon the game
    */
}
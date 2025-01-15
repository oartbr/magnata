class Util{
    constructor(oOwner){
        this.game = oOwner;
    }
    checkElementExists(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            setTimeout(() => this.checkElementExists(selector, callback), 2000);
        }
    }
    searchPlace(oRef){
        for (const [key, place] of Object.entries(this.game.places)) {
            if(place.reference == oRef){
            return place;
            };
        }
        return false;
    }
    getRandomPlace(sCity){
        const aSelected = [];
        for (const [key, place] of Object.entries(this.game.cities[sCity].places)) {
            aSelected.push(place.reference);
        }

        return aSelected[Math.floor(Math.random() * aSelected.length)];
    }
    loadAgentData(){
        const oAgentData = this.game.db.get('Agent');
        this.game.agent.setHealth(oAgentData.health);
        this.game.agent.receive(oAgentData.balance);
        this.game.agent.capacity = oAgentData.capacity;
    }
    transfer(oPayer, oReceiver, iAmount){
        if(oPayer.pay(iAmount) !== false){
            oReceiver.receive(iAmount);
            this.game.board.setStatus();
            return true;
        }
        return false;
    }
}

class Collection extends Array{
    constructor(sId, oGame){
        super();
        this.id = sId;
        this.game = oGame;
        this.oMap = {};
    }
    register(oEntity){
        this.push(oEntity);
        this.oMap[oEntity.constructor.name.toLowerCase()] = oEntity.constructor;
    }
    setMap(oMap){
        this.oMap = oMap;
    }
    getData(){
        this.map(item=>item.getData());
    }
    setData(){
        this.map(item=>item.setData());
    }
}

class PlayBoard{
    constructor(sId, oOwner){
        this.id = sId;
        this.game = oOwner;
        this.db = this.game.db;
        this.util = this.game.util;
        this.el = $('<div id="' + sId + '_board" class="gameBoard"/>');
        $('#titlecard').append(this.el);

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
                                <div><h3>Data</h3><span class="statusDate">🗲</span></div>
                                <div><h3>Lugar</h3><span class="statusLocation">🗲</span></div>
                                <div><h3>Dividas</h3><span class="statusDebt money">🗲</span></div>
                                <div><h3>Saúde</h3><span class="statusHealth">🗲</span></div>
                            </div>
                            <div class="values">
                                <div class="warehouse">
                                    <div class="stockValue floatLeft">Contratos</div>
                                </div>
                                <div class="stock">
                                    <div class="stockValue floatLeft">Jogadores <span class="stockCapacity">🗲</span></div>
                                    <div class="stockValue floatRight">Promesas <span class="stockPromises">🗲</span></div>
                                </div>
                                <div class="balance">
                                    <div class="stockValue floatLeft">Cash: <span class="balanceCash money">🗲</span></div>
                                    <div class="stockValue floatRight">Banco: <span class="balanceBank money">🗲</span></div>
                                </div>
                            </div>
                            <div class="comm">
                                <div class="commMessage">...</div>
                                <div class="commActions">🗲</div>
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
        const oAction = new Place(sTitle, false, false);
        const oAgent = this.game.agent;
        $(oAction.el).click(()=>{ oAgent.spend(iFee);
                                console.log(iFee, "fee");
                                oEntity[fAction](this.commActions, sVal, iFee);
                                });     
        $(this.commActions).append(oAction.el);
        return oAction.el;
    }
    createInput(sTitle, fAction, oEntity, sVal = 0){
        const oAction = new Place(sTitle, false, false);
        //const oComm = this.commActions;
        $(oAction.el).click(()=>oEntity[fAction](this.commActions, sVal));
        $(this.commActions).append(oAction.el);
        return oAction.el;
    }
    resetComm(){
        $('.commMessage').empty();
        $('.commActions').empty();
    }
    say(sWho, sMessage){
        $('.commMessage').remove();
        $('.comm').prepend(`<div class="commMessage">${sWho}: ${sMessage}</div>`);
    }
    message(sMessage){
        $(this.commActions).append(`<div style="float: left;margin-top: 5px;width:100%;height:100%;text-align:left;font-size:0.85rem">${sMessage}</div>`);
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
        console.log("setDebt", iDebt);
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

class Page{
    constructor(sId, oBoard){
        this.id = sId;
        this.board = oBoard;
    }
}

class Action{
    constructor(sId, oPage){
        this.id = sId;
        this.page = oPage;
    }
}

class Place{
    constructor(sId, sReference, sLocation, oOwner){
        this.id = sId;
        this.location = sLocation;
        this.city = oOwner;
        this.reference = sReference;
        this.contacts = [];
        this.movementFee = 40;
        this.movementMessage = 'Uber';

        //this.el = $('<div id="' + sId + 'Button" style="color: #0f0; z-index: 999; cursor: pointer; padding: 0px 3px ;margin: 3px;float: left; border: 1px solid #0f0; font-size: 0.9rem "> ' + sId + ' </div>');
        //$(this.el).click(()=>this.getHere());
        this.getButton();
        this.attachToGame();

        return this;
    }
    getHere(){
        const bAirTravel = typeof this.city != 'undefined' && this.city.game.currentPlace.airport === true && this.airport === true;        
        if(this.location) {
            this.reference ? this.city.game.agent.spend(bAirTravel ? this.city.movementFee : this.movementFee, bAirTravel ? this.city.movementMessage : this.movementMessage) : '';
            this.city.game.board.setStatus();
            bAirTravel ? this.city.game.timer.trip(24) : this.city.game.timer.trip(6);
            window.location.href = this.location;
        }
    }
    getButton(){
        this.el = $('<div id="' + this.id + 'Button" class="actionButton" style="color: #0f0; z-index: 999; cursor: pointer; padding: 0px 3px ;margin: 3px;float: left; border: 1px solid #0f0; font-size: 0.9rem "> ' + this.id + ' </div>');
        $(this.el).click(()=>this.getHere());
        return this.el;
    }
    attr(sName, val){
        this[sName] = val;
        return this;
    }
    attachToGame(){
        if(this.reference && this.location){
        this.city.game.addPlace(this.reference, this);
        }
    }
    addContact(oEntity){
        this.contacts[oEntity.name] = oEntity;
    }
    removeContact(oEntity){
        this.contacts.splice(oEntity.name, 1);
    }
}

class City{
    constructor(sId, sLocation, oOwner){
        this.id = sId;
        this.location = sLocation;
        this.game = oOwner;
        this.places = [];
        this.airport = '';
        this.movementFee = 900;
        this.getButton();
        this.airlines = ['Latam', 'Gol', 'Azul', 'Avianca'];
        return this;
    }
    getButton(){
        this.el = $('<div id="' + this.id + 'Button" style="color: #0f0; z-index: 999; cursor: pointer; padding: 0px 3px ;margin: 3px;float: left; border: 1px solid #0f0; font-size: 0.9rem "> ' + this.id + ' </div>');
        $(this.el).click(()=>this.landHere());
        return this.el;
    }
    addAirport(sId, sReference, sLocation){
        this.movementMessage = this.airlines[Math.floor(Math.random() * this.airlines.length)];
        this.airport = new Place(sId, sReference, sLocation, this).attr("airport", true);
        this.reference = sReference;
        this.places[sId] = this.airport;
        return this;
    }
    addPlace(sId, sReference, iFare, sLocation){
        this.places[sId] = new Place(sId, sReference, sLocation, this);
        this.places[sId].fare = iFare;
        return this;
    }
    landHere(){
        //this.game.agent.spend(this.movementFee, " em Passagens!");
        //this.game.board.setStatus();
        this.airport.el.click();
    }
}

class Product{
    constructor(sID, sName){
        this.id = sId;
        this.name = sName;
        return this;
    }
    setPriceRange(iMin, iMax, bSpikes){
        this.min = iMin;
        this.max = iMax;
        this.spickes = true;
    }
    setIllegal(){
        this.illegal = true;
    }
}

class Entity{
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

class Agent extends Entity{
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

class Wallet{
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

// NPCs start here!
// this is the base class for all entities in the game
// the idea is to connect all entities with chatGPT to interact on a natural way
class NPC extends Entity{
    constructor(sName, sPlace, oGame) {
        super(sName, sPlace, oGame);
        return this;
    }
    setAction(sAction){
        this.action = this[sAction];
        return this;
    }
    async getChat(prompt) {
        const apiKey = "API_KEY"; // to-do list... get the OpenAI API key
        const apiUrl = "https://api.openai.com/v1/chat/completions";

        const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
        }),
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }
    async interact(agentInput) {
        const prompt = `
        You are ${this.name}, an NPC located in ${this.place}.
        The agent says: "${agentInput}".
        Respond in a way that reflects your character's personality and role.
        `;

        const chatGPTResponse = await this.getChat(prompt);
        return `${this.name} says: "${chatGPTResponse}"`;
    }
    goTo(newPlace) {
        this.game.moveNPC(this, newPlace);
        return `${this.name} foi para ${newPlace}.`;
    }
    recalculate(iDays){
        return iDays;
    }
}

// the player has attributes like skill level, market value, and loyalty.
class Player extends NPC {
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

// a team owner is focused on financial interests and team management.
class TeamOwner extends NPC {
    constructor(name, sPlace, oGame, teamName) {
        super(name, sPlace, oGame);
        this.teamName = teamName;
        return this;
    }
    setData(){
        this.saveState({teamName: this.teamName,
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
    negotiateTransfer(playerName, offer) {
        if (offer > 500000) {
        this.wealth += offer;
        return `${this.name}, owner of ${this.teamName}, accepts the transfer deal for ${playerName}.`;
        } else {
        return `${this.name} rejects the offer. "That’s not enough for ${playerName}!"`;
        }
    }
    invest(amount) {
        if (amount > this.wealth) {
        return `${this.name} cannot invest ${amount}. Insufficient funds.`;
        } else {
        this.wealth -= amount;
        return `${this.name} invests ${amount} in ${this.teamName}.`;
        }
    }
    chat(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "Precisamos de um goleiro!");

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Mostrar jogadores', 'showOptions', this);
        this.game.board.createAction('Prometer para depois', 'showOptions', this);
    }                       
}

// the manager represents a rival who competes for player deals.
class Manager extends NPC {
    constructor(name, sPlace, oGame, reputation) {
        super(name, sPlace, oGame);
        this.reputation = reputation;
        return this;
    }
    setData(){
        this.saveState({reputation: this.reputation,
                        balance: this.wallet.balance});
    }
    getData(){
        const oData = this.loadState();
        if(oData){
        this.reputation = oData.reputation || 0;
        this.wallet.receive(oData.balance || 0);
        }
    }
    sabotage(playerName) {
        return `${this.name} tries to sabotage your deal with ${playerName}.`;
    }
    negotiateDeal(playerName, offer) {
        if (this.reputation > 7) {
        return `${this.name} outbids you and secures the deal for ${playerName}.`;
        } else {
        return `${this.name} fails to secure the deal due to low reputation.`;
        }
    }
    chat(){
        const sCity = this.game.currentPlace.city.id;
        const sPlace = this.game.currentPlace;
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "Tem algum jogador que preste?");

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Mostrar jogadores', 'showOptions', this);
        this.game.board.createAction('Perguntar por trocas', 'showOptions', this);

    }               
}

// the fixer will chase the player if they doesn't pay their debts
class Fixer extends NPC {
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
        this.game.board.say(`${this.name}`, "Cara, tu deve grana e vai pagar de qualquer jeito.");

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Correr', 'die', this.game.board);
        this.game.board.createAction('Pagar', 'pay', this);
    }
}

// an Assistant can offer general help
class Assistant extends NPC {
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
        this.game.board.say(`${this.name}`, "Diga chefe, como te ajudo?");

        this.game.board.createAction('<', 'showOptions', this.game.board);
        this.game.board.createAction('Quem ligou?', 'showOptions', this);
        this.game.board.createAction('Traz café', 'showOptions', this);
        this.game.board.createAction('Faz um pix', 'fazerPix', this);
    }
    fazerPix(){
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "De quanto você precisa?");

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('5000', 'pix5k', this);
        this.game.board.createAction('10000', 'pix10k', this);

        this.pix5k = function(){
        this.game.util.transfer(this, this.game.agent, 5000);
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "Pronto, já fiz e agora?");

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('Continuar', 'chat', this);
        this.game.board.createAction('Sair', 'showOptions', this.game.board);
        };
        this.pix10k = function(){
        this.game.agent.receive(10000);
        this.game.board.resetComm();
        this.game.board.say(`${this.name}`, "Prontinho chefe!");

        this.game.board.createAction('<', 'chat', this);
        this.game.board.createAction('Continuar', 'chat', this);
        this.game.board.createAction('Sair', 'showOptions', this.game.board);
        };
    }
}

// the spy will bring insiders information from the market
class Spy extends NPC {
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

// the LoanShark will lend money to the player and eventually tell him some gossip
class LoanShark extends NPC {
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

/* OLD character
* Replace with NPC-based before using them
*
* */
class Lender{
    constructor(oOwner, sPlace){
        this.balance = 0;
        this.interest = 0.05;// this will be the monthly interest rate
        this.limit = 0;// this is the starting limit a new player will have
        this.owner = oOwner;
        this.location = sPlace;
        return this;
    }
    borrow(iAmount){
        const iResult = this.balance + iAmount;
        if(iResult < this.limit && iAmount > 0){
        this.balance += iAmount;
        this.owner.wallet.receive(iAmount);
        return this.balance;
        } else {
        return false;
        }
    }
    pay(iAmount){
        if(iAmount > 0 && iAmount <= this.balance && this.owner.wallet.balance >= iAmount){
        this.balance -= iAmount;
        this.owner.wallet.pay(iAmount);
        } else if (iAmount > 0 && iAmount > this.balance && this.owner.wallet.balance >= iAmount){
        this.owner.wallet.pay(this.balance);
        this.balance = 0;
        }
        return this.balance;
    }
    checkBalance(){
        return Math.floor(this.balance);
    }
    recalculate(iDays){
        const interestRate = (this.interest / 30 ) * iDays;
        this.balance = this.balance * (1 + interestRate);
        return this.balance;
    }
    setLimit(iVal){
        this.limit = iVal;
    }
    message(sMessage, oSender){
        this.owner.message(sMessage, oSender);
    }
}

/* OLD character
* Replace with NPC-based before using them
*
* */
class Pirate extends Wallet{
    constructor(oOwner, sPlace){
        super(oOwner);
        this.patienceIndex = 0.1;
        this.statusList = ['calm', 'nervous', 'attacking', 'crazy'];
        this.status = 0;// the pirate starts calm...
        this.fee = 0;
        this.location = sPlace;
    }
    recalculate(iDays){
        const patience = (this.patienceIndex / 30 ) * iDays;
        const startingBalance = this.balance;
        if(this.fee == 0 ) {
        this.fee = patience * startingBalance;
        }
        this.balance = this.balance - this.fee;
        if(this.balance <= 0 && startingBalance > 0){
        this.status = 1;
        this.announce("Pirate Liu wants to see you.");
        } else if (this.balance <= 0 && this.status > 0){
        this.status = 2;
        this.announce("Pirate Liu wants his money or else.");
        }

        return this.balance;
    }
    announce(sMessage){
        this.owner.message(sMessage, this);
    }
    reset(){
        this.fee = 0;
    }
}

class TimeKeeper {
    constructor(sId, oGame, fCallBack) {
        this.id = sId;
        this.startDate = new Date(2015, 1, 28); // February 28th, 2015
        this.currentDate = new Date(2015, 1, 28);
        this.game = oGame;
        this.counters = new Collection('timers', this);
        this.callback = fCallBack;
        return this;
    }
    // Method to handle a trip within the city (1/4 day)
    trip(iHours) {
        this.currentDate = dayjs(this.currentDate).add(iHours, 'hours').toDate();
        this.updateCounters(iHours / 24);
        this.saveState();
        this.callback();
    }
    // Method to add a counter
    addCounter(name) {
        if (!this.counters[name]) {
            this.counters[name] = 0;
        }
    }
    // Method to update counters (e.g., for calculating debts' interests)
    updateCounters(increment) {
        for (let counter in this.counters) {
            this.counters[counter] += increment;
        }
    }
    // Method to get the current date
    getCurrentDate() {
        const formattedDate = dayjs(this.currentDate);
        return formattedDate;
    }
    // Method to get the value of a specific counter
    getCounterValue(name) {
        return this.counters[name] || 0;
    }
    saveState(){
        this.game.db.set(this.id, {
            startDate: this.startDate,
            currentDate: this.currentDate,
        });
    }
    loadState(){
        const oData = this.game.db.get(this.id) || false;
        if (oData && oData.currentDate) {
            for (let key in oData) {
                this[key] = oData[key];
            }
        }
        this.callback();
    }
}

class Storage{
    /*
    * this object works as a repository for any data
    * it saves the data to the local storage every time a new value is set
    * the idea is to use it as a data management object within other objects
    * this.storage = new Storage(this.jobID, this.jobID); //Define the storage bin
    * this.storage.set(sId, sStatus); //Include content on the bin
    * this.storage.get(sId); //Reads the bin's content with sId
    */
    constructor(sBinID, oOwner){
        this.owner = oOwner;
        this.binID = sBinID;
        this.content = JSON.parse(localStorage.getItem(this.binID)) || {};
        this.started = (this.content) ? true : false;
        return this;
    }
    load(){
        this.content = JSON.parse(localStorage.getItem(this.binID)) || {};
        return this;
    }
    save(){
        localStorage.setItem(this.binID, JSON.stringify(this.content));
        this.load();
    }
    get(id){
        try{
        const oContent = JSON.parse(this.content[id]);
        } catch (e){
        //console.log("Error, content not a valid json.");
        }
        const sContent = this.content[id];
        return (typeof oContent == 'object') ? oContent : sContent;
    }
    set(id, content){
        this.load();
        this.content[id] = content;
        this.save();
    }
    // Function to encode a string to Base64
    encodeId(text) {
        return btoa(text);
    }
    // Function to decode a Base64 string
    decodeId(encodedText) {
        return atob(encodedText);
    }
}
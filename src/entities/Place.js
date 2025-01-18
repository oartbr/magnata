export class Place{
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
        this.el = $('<div id="' + this.id + 'Button" class="actionButton ">' + this.id + '</div>');
        this.el = $(`<div id="${this.id}_Button" class="actionButton ${this.id == '<' ? 'returnButton' : 'placeButton'}">${this.id}</div>`);
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
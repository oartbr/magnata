export class City{
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
        this.el = $('<div id="' + this.id + 'Button"  class="actionButton cityButton"> ' + this.id + ' </div>');
        $(this.el).click(()=>this.landHere());
        return this.el;
    }
    addAirport(sId, sReference, sLocation){
        this.movementMessage = this.airlines[Math.floor(Math.random() * this.airlines.length)];
        this.airport = new Magnata.Place(sId, sReference, sLocation, this).attr("airport", true);
        this.reference = sReference;
        this.places[sId] = this.airport;
        return this;
    }
    addPlace(sId, sReference, iFare, sLocation){
        this.places[sId] = new Magnata.Place(sId, sReference, sLocation, this);
        this.places[sId].fare = iFare;
        return this;
    }
    landHere(){
        //this.game.agent.spend(this.movementFee, " em Passagens!");
        //this.game.board.setStatus();
        this.airport.el.click();
    }
}
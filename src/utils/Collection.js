export class Collection extends Array{
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
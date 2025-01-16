export class Storage{
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
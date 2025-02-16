export class StreetView{
    constructor(sId){
        this.id = sId;
        return this;
    }

    setAnchor(oAnchor){
        this.anchor = oAnchor;
        return this;
    }

    async setUp(){
        this.view = $(`<div id="streetView"></div>`);
        console.log(this.location);
        $(this.anchor).append(this.view);
        this.panorama = await new google.maps.StreetViewPanorama(
            document.getElementById("streetView"), {
                position: this.location.location,
                pov: { heading: this.location.pov.heading, pitch: this.location.pov.pitch },
                zoom: this.location.zoom,
            }
        );
        this.info = this.panorama.location.shortDescription;
        this.setMiniMap();
    }

    setLocation(sUrl){
        this.location = this.getLoc(sUrl);
        return this;
    }

    async relocate(sUrl, oCaller){
        this.location = this.getLoc(sUrl);
        this.panorama.setPosition(this.location.location);
        this.panorama.setPov(this.location.pov);
        this.panorama.setZoom(this.location.zoom);
        
        this.panorama.addListener("status_changed", () => {
            if (this.panorama.getStatus() === "OK") {
                if (oCaller) {
                    this.info = this.panorama.location.shortDescription;
                    oCaller.arrive();
                    return;
                }
            }
        });
    }

    setMiniMap() {
        this.miniMapEl = $(`<div id="miniMap"></div>`);
        $(this.anchor).append(this.miniMapEl);
        this.miniMap = new google.maps.Map(document.getElementById("miniMap"), {
            center: this.location.location,
            zoom: 18,
            mapTypeId: "roadmap",
            disableDefaultUI: true
        });
        new google.maps.Marker({
            position:  this.location.location,
            map: this.miniMap,
            title: "You are here"
        });
    }

    getLoc(url) {
        const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),3a,(\d+\.?\d*)y,(\d+\.?\d*)h,(\d+\.?\d*)t/;
        const match = url.match(regex);
    
        if (!match) {
            throw new Error("Invalid Street View URL");
        }
    
        const [_, lat, lng, fov, heading, pitch] = match;
    
        return {
            location: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            },
            pov: {
                heading: parseFloat(heading)/100,
                pitch: parseFloat(pitch)/100,
                zoom: parseFloat(fov)/100
            },
            zoom: parseFloat(fov)/100
        };
    }
}
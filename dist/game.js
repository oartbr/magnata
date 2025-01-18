$(function() { 
  window.game = (function (){
    function Game(){

      console.log("Vai Game!");
      this.setUp();
    }
    Game.prototype = {
      setUp: function(){
        this.util = new Magnata.Util(this);
        this.db = new Magnata.Storage('Game', this);
        this.entities = new Magnata.Collection('entities', this);
        this.entities.setMap({manager: Magnata.Manager,
                              player: Magnata.Player,
                              teamowner: Magnata.TeamOwner,
                              fixer: Magnata.Fixer,
                              spy: Magnata.Spy,
                              loanshark: Magnata.LoanShark,
                              assistant: Magnata.Assistant,
                            });

        this.agent = new Magnata.Agent(10, 'Praça', this);
        this.board = new Magnata.PlayBoard("Game", this);
        this.timer = new Magnata.TimeKeeper('timer', this, this.board.updateDate);
        this.timer.loadState();

        this.ref = $("#titlecard div:first-child div:first-child").offset() + $("#titlecard div:first-child div:first-child").height() + 20;
        //this.board.moveTo("20px",280 + "px");
        //this.board.resize("392px","280px");

        this.cities = new Magnata.Collection('cities', this);
        this.places = new Magnata.Collection('places', this);

        this.currentPlace = {};
        this.home = {};
      },
      addCity: function(sName, sLocation){
        this.cities[sName] = new Magnata.City(sName, sLocation, this);
        this.home = (this.home.id == undefined) ? this.cities[sName] : this.home;
        return this.cities[sName];
      },
      addPlace: function(sName, oPlace){
        this.places[sName] = oPlace;
      },
      dead: function(){
        this.finish("Você morreu!");

      },
      finish: function(sMessage){
        console.log(sMessage);
      },
      message: function(sMessage, oSender){
        console.log(sMessage, oSender);
      },
      recalculate: function(iDays){
        this.entities.map(entity=>entity.recalculate(iDays));
      },
      addEntity: function(oEntity, sType){
        oEntity.type = sType;
        this.entities.push(oEntity);
      },
      addNPC: function(sName, sPlace, sType){
        const NPCClass = this.entities.oMap[sType.toLowerCase()];
        if (!NPCClass) {
          throw new Magnata.Error(`Unknown NPC type: ${sType}`);
        };
        if(sPlace == 'anywhere'){
          sPlace = this.util.getRandomPlace(this.home.id);// this means that the entity can be anywhere!
        }

        const oNPC = new NPCClass(sName, sPlace, this);
        this.agent.contacts[sName] = oNPC;
        this.places[sPlace].addContact(oNPC);
        //this.addEntity(oNPC, sType);
        return oNPC;
      },
      moveNPC: function(oNPC, sPlace){
        this.places[oNPC.place].removeContact(oNPC);
        this.places[sPlace].addContact(oNPC);
        return oNPC;
      },
      arrive(){
        let sHere = $("#titlecard h1").text();
        sHere = sHere.replace(/^\s+|\s+$/g,'');
        let currentPlace = this.util.searchPlace(sHere);

        if(currentPlace != ''){
          this.currentPlace = currentPlace;
          this.board.arrive();
        } else {
          console.log("place not found, now what?");
          this.home.airport.el.click();
        }

      }

    }

    if(window.top == window.self){
      return new Game();
    }

  }());

  game.addCity("Porto Alegre")
        .addAirport("Aeroporto", "Porto Alegre–Salgado Filho International Airport",
                    "https://www.google.com/maps/@-29.990081,-51.1753389,3a,75y,89.72h,102.88t/data=!3m8!1e1!3m6!1sAF1QipN7X9BLB_AOajJxecuva5EcxparGTnhopVggF7C!2e10!3e11!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipN7X9BLB_AOajJxecuva5EcxparGTnhopVggF7C%3Dw900-h600-k-no-pi-12.877823474138125-ya11.720227139378395-ro0-fo100!7i8192!8i4096?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Estádio Beira-Rio", "Estádio Beira-Rio", 0,
                "https://www.google.com/maps/@-30.0651214,-51.2351769,3a,81.3y,14.21h,73.37t/data=!3m8!1e1!3m6!1sAF1QipP7Gw9-a0Jj0snhVqpwBpY79MOm-IVroZhricFo!2e10!3e11!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipP7Gw9-a0Jj0snhVqpwBpY79MOm-IVroZhricFo%3Dw900-h600-k-no-pi16.63185543366528-ya7.207325798815191-ro0-fo100!7i2508!8i1253?entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Marquês Parrilla", "1249 Av. Carlos Gomes", 150,
                "https://www.google.com/maps/@-30.0323045,-51.1796782,3a,41.2y,196.94h,82.86t/data=!3m7!1e1!3m5!1sNLzw98MscEzdQvmZ-DmMYA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D7.143786211494358%26panoid%3DNLzw98MscEzdQvmZ-DmMYA%26yaw%3D196.9432921817689!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Hotel Deville", "Hotel Deville Prime Porto Alegre", 0,
                "https://www.google.com/maps/@-29.9802276,-51.1790763,3a,75y,6.68h,92.77t/data=!3m8!1e1!3m6!1sAF1QipNdVBbP1xpvnoOJqIDLP4THC8bwUZOo5dYnUd8Y!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fp%2FAF1QipNdVBbP1xpvnoOJqIDLP4THC8bwUZOo5dYnUd8Y%3Dw900-h600-k-no-pi-2.769999999999996-ya42.55939453125001-ro0-fo100!7i12564!8i6282?entry=ttu&g_ep=EgoyMDI1MDExNC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Gremio Arena", "Gremio Arena", 0,
                "https://www.google.com/maps/@-29.9740137,-51.1945709,2a,75y,321.23h,103.63t/data=!3m8!1e1!3m6!1s3lu73F8odmv7QUUrUxgJ1g!2e0!3e2!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-13.629739326030347%26panoid%3D3lu73F8odmv7QUUrUxgJ1g%26yaw%3D321.2259959145414!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Cais Embarcadero","Wills Cais Embarcadero", 120,
                "https://www.google.com/maps/@-30.0314242,-51.2403792,3a,75y,355.62h,80.59t/data=!3m8!1e1!3m6!1sAF1QipP_cAg3gx-m1v3oK9BBVlFza4BOBp2TVW1OPHbK!2e10!3e12!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipP_cAg3gx-m1v3oK9BBVlFza4BOBp2TVW1OPHbK%3Dw900-h600-k-no-pi9.413520392540335-ya219.63770017050254-ro0-fo100!7i6080!8i3040?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Morro Santa Tereza", "75 R. Tvs", 0,
                "https://www.google.com/maps/@-30.0723358,-51.2327894,3a,61.5y,347.87h,92.65t/data=!3m7!1e1!3m5!1sWog5RGiJZVKnMqW6LLSC0w!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-2.6493919397229178%26panoid%3DWog5RGiJZVKnMqW6LLSC0w%26yaw%3D347.86513948326535!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D");

  game.addNPC("Zé Pequeno", "anywhere", "fixer").setAction('chat');
  game.addNPC("Dna Laura", "Wills Cais Embarcadero", "loanShark").setAction('chat').receive(1000);
  game.addNPC("Barreira", "Gremio Arena", "teamOwner").setAction('chat');
  game.addNPC("Valenzuela", "Estádio Beira-Rio", "manager").setAction('chat');
  game.addNPC("Aninha", "Hotel Deville Prime Porto Alegre", "assistant").setAction('chat').receive(100);
  game.addNPC("Banco Geral", "Porto Alegre–Salgado Filho International Airport", "loanShark").setLimit(20000).setAction('chat').receive(10000);

  game.addCity("São Paulo")
        .addAirport("Aeroporto", "São Paulo/Guarulhos–Governor André Franco Montoro International Airport",
                    "https://www.google.com/maps/@-23.4284264,-46.4799501,2a,75y,306.94h,87.16t/data=!3m7!1e1!3m5!1s32fRVAZLAlPespA4DBLvKw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D2.8354107499952477%26panoid%3D32fRVAZLAlPespA4DBLvKw%26yaw%3D306.93895222463135!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("MorumBIS", "MorumBIS", 0,
                "https://www.google.com/maps/@-23.5994377,-46.7204674,3a,75y,155.51h,93.65t/data=!3m7!1e1!3m5!1soePyAjqOSlsssbA83srqwQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-3.648817966072926%26panoid%3DoePyAjqOSlsssbA83srqwQ%26yaw%3D155.5113731371494!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Fogo de Chão", "Fogo de Chão Center Norte", 250,
                "https://www.google.com/maps/@-23.5173,-46.6183874,3a,75y,43.45h,93.04t/data=!3m7!1e1!3m5!1sAF1QipOqY4rUMj8IPj8cfkafaQNwBZYwqyvfK0CZc2yr!2e10!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipOqY4rUMj8IPj8cfkafaQNwBZYwqyvfK0CZc2yr%3Dw900-h600-k-no-pi-3.0406755363489566-ya43.44750711370506-ro0-fo100!7i10954!8i5477?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Hospital A. Einstein", "203 Rua Ruggero Fasano", 0,
                "https://www.google.com/maps/@-23.6001336,-46.7162448,3a,75y,235.61h,85.23t/data=!3m7!1e1!3m5!1sj3gjRRF-FpoKuAQi6pDvSw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D4.769661266880675%26panoid%3Dj3gjRRF-FpoKuAQi6pDvSw%26yaw%3D235.60724656885043!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("SBT", "Osasco, State of São Paulo", 0,
                "https://www.google.com/maps/@-23.4737833,-46.7743299,3a,75y,235.18h,90.69t/data=!3m7!1e1!3m5!1s3uJjWSbESRvfIJSxASKksg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-0.6910452423293947%26panoid%3D3uJjWSbESRvfIJSxASKksg%26yaw%3D235.17764549404342!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Ibirapuera", "Parque Ibirapuera", 0,
                "https://www.google.com/maps/@-23.5863268,-46.6561618,3a,75y,14.54h,87.85t/data=!3m7!1e1!3m5!1szG3KXmYuc3fTtppdw4mksA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D2.149878054221446%26panoid%3DzG3KXmYuc3fTtppdw4mksA%26yaw%3D14.543328815070716!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Faria Lima", "1572 Av. Brig. Faria Lima", 0,
                "https://www.google.com/maps/@-23.5714482,-46.690719,3a,85y,243.22h,121.16t/data=!3m7!1e1!3m5!1si_783AwR8sXkXL-UohVenA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-31.16471950127209%26panoid%3Di_783AwR8sXkXL-UohVenA%26yaw%3D243.2184816096697!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Bar Skye", "Skye", 500,
                "https://www.google.com/maps/@-23.5814894,-46.6665461,3a,90y,15.03h,79.49t/data=!3m8!1e1!3m6!1sAF1QipOTBV6WhwzApmAvuv_dh9eXo9FIz163TBZ4-mul!2e10!3e11!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipOTBV6WhwzApmAvuv_dh9eXo9FIz163TBZ4-mul%3Dw900-h600-k-no-pi10.512435826930513-ya16.026567159933222-ro0-fo100!7i8704!8i4352?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D");

  game.addNPC("Seu Laerte", "1572 Av. Brig. Faria Lima", "loanShark").setLimit(2000).setAction('chat').receive(100000);

  game.addCity("Rio de Janeiro")
        .addAirport("Aeroporto", "Santos Dumont Airport",
                    "https://www.google.com/maps/@-22.9128501,-43.1667023,2a,75y,178.98h,106.71t/data=!3m8!1e1!3m6!1shocLlCGR-p-VEQyCksbN7g!2e0!3e2!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-16.7107724794936%26panoid%3DhocLlCGR-p-VEQyCksbN7g%26yaw%3D178.98224276555513!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("Maracanã", "Maracanã", 0,
                "https://www.google.com/maps/@-22.9127772,-43.2301363,2a,75y,4.11h,82.43t/data=!3m8!1e1!3m6!1sC7Jyx9JGw2-UPa4xo7z0QA!2e0!3e2!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D7.568215855794705%26panoid%3DC7Jyx9JGw2-UPa4xo7z0QA%26yaw%3D4.111574112961819!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D")
        .addPlace("São Januario", "São Januário Stadium", 0,
                "https://www.google.com/maps/@-22.8913576,-43.228641,3a,75y,17.89h,98.21t/data=!3m7!1e1!3m5!1s54uNKfjKtEOBScjXNap9LQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-8.20953612248779%26panoid%3D54uNKfjKtEOBScjXNap9LQ%26yaw%3D17.890400762728973!7i13312!8i6656?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D");

  game.util.checkElementExists("#titlecard h1", function(){
    game.arrive(); 
  });

})
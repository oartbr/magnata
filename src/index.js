// polyfills.js
import process from 'process/browser';
window.process = process;


// these are the basic utils for the game
export { Collection } from './utils/Collection.js';
export { Storage } from './utils/Storage.js';
export { Util } from './utils/Util.js';
export { Wallet } from './utils/Wallet.js';

// these are the basic objects to work together with the board
export { Action } from './components/Action.js';
export { Page } from './components/Page.js';

// these are third party services
export { StreetView } from './services/StreetView.js';

// these objects drive the game
export { PlayBoard } from './core/PlayBoard.js';
export { TimeKeeper } from './core/TimeKeeper.js';

// these are the root objects for the entities
export { City } from './entities/City.js';
export { Place } from './entities/Place.js';
export { Entity } from './entities/Entity.js';
export { NPC } from './entities/NPC.js';

// these are the characters of the game... is it possible to build them without actual classes?
export { Agent } from './entities/Agent.js';
export { Assistant } from './entities/Assistant.js';
export { Fixer } from './entities/Fixer.js';
export { LoanShark } from './entities/LoanShark.js';
export { Manager } from './entities/Manager.js';
export { Player } from './entities/Player.js';
export { Spy } from './entities/Spy.js';
export { TeamOwner } from './entities/TeamOwner.js';
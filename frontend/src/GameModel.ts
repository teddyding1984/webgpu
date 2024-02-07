import Transition from "./transitions/Transition";
import GoOutside from "./transitions/GoOutside";
import StartGame from "./transitions/StartGame";
import {Vector2, Vector3} from "math.gl";
import Main from "./Main";
import GoInside from "./transitions/GoInside";
import Trigger from "./trigers/Trigger";
import HitTextTrigger from "./trigers/HitTextTrigger";
import Drawing from "./drawing/Drawing";
import GoRightRoom from "./transitions/GoRightRoom";
import GoLeftRoom from "./transitions/GoLeftRoom";
import {FloorHitTrigger} from "./trigers/FloorHitTrigger";
import OutlinePass from "./renderPasses/OutlinePass";
import Renderer from "./lib/Renderer";
import CharacterHandler from "./CharacterHandler";
import DoorGoOutsideTrigger from "./trigers/DoorGoOutsideTrigger";
import DoorGoInsideTrigger from "./trigers/DoorGoInsideTrigger";
import DoorInsideTrigger from "./trigers/DoorInsideTrigger";
import GoWorkTrigger from "./trigers/GoWorkTrigger";
import GameCamera from "./GameCamera";
import TextHandler from "./TextHandler";
import UI from "./lib/UI/UI";
import SoundHandler from "./SoundHandler";
import GameUI from "./ui/GameUI";
import RenderSettings from "./RenderSettings";
import GoGraveTrigger from "./trigers/GoGraveTrigger";
import GoHunterTrigger from "./trigers/GoHunterPants";
import SitTrigger from "./trigers/SitTrigger";
import ReadMail from "./transitions/ReadMail";
import FindHunterPants from "./transitions/FindHunterPants";
import TextInfo from "./transitions/TextInfo";
import BookCaseTrigger from "./trigers/BookCaseTrigger";
import MillTrigger from "./trigers/MillTrigger";
import Room from "./Room";
import Outside from "./Outside";
import UIUtils from "./lib/UI/UIUtils";
import SelectItem from "./lib/UI/math/SelectItem";
import StartMill from "./transitions/StartMill";
import MakeTriangle from "./transitions/MakeTriangle";
import GoGrave from "./transitions/GoGrave";
import FlowerPotHitTrigger from "./trigers/FlowerPotHitTrigger";
import FlowerHitTrigger from "./trigers/FlowerHitTrigger";

export enum StateGold {
    START,
    LOCKED_DOOR,
    START_MILL,
    FINISH_KEY,
    FIND_NOTE,
    GET_SHOVEL,
    GET_GOLD,
}

export enum StateFasion {
    START,
    READ_MAIL,
    MAKE_TRIANGLE,
    FINISH_WEBSITE,
    READ_MAIL_MAILBOX,
    GET_FASION_PANTS,
}

export enum StateHighTech {
    START,
    GROW_FLOWER,
    PICK_FLOWER,

}

export enum StateHunter {
    START,
    HAVE_PANTS,

}


export enum LaptopState {
    MAIL,
    NONE,
    TRIANGLE,

}

export enum MillState {
    OFF,
    ON,
    DONE,

}

export const Transitions =
    {
        GO_OUTSIDE: new GoOutside(),
        START_GAME: new StartGame(),
        GO_INSIDE: new GoInside(),
        GO_RIGHT_ROOM: new GoRightRoom(),
        GO_LEFT_ROOM: new GoLeftRoom(),
        READ_MAIL: new ReadMail(),
        FIND_HUNTER_PANTS: new FindHunterPants(),
        TEXT_INFO: new TextInfo(),
        START_MILL: new StartMill(),
        MAKE_TRIANGLE: new MakeTriangle(),
        GO_GRAVE: new GoGrave(),


    }

export enum UIState {
    GAME_DEFAULT,
    OPEN_MENU,
    INVENTORY_DETAIL,
    PRELOAD_DONE,
    PRELOAD,
    HIDE_MENU,


}


export enum Scenes {
    OUTSIDE,
    ROOM,
    PRELOAD,
}

class GameModel {
    public stateGold: StateGold = StateGold.START
    public stateFashion: StateFasion = StateFasion.START
    public stateHunter = StateHunter.START
    public millState = MillState.OFF;
    public laptopState = LaptopState.MAIL;
    public renderer: Renderer;
    public roomCamOffset: number = 0;
    public isLeftRoom = false;
    public currentScene: Scenes = Scenes.PRELOAD
    // public floorHitIndicator: FloorHitIndicator;
    public yMouseCenter: number = 1;
    public yMouseScale: number = 1;
    public sceneHeight = 2.5;
    public main: Main;
    mouseUpThisFrame: boolean = false;
    mouseDownThisFrame: boolean = false;
    mousePos: Vector2 = new Vector2();
    mouseMove: boolean = false;
    public characterPos: Vector3 = new Vector3(0, 0, 0);
    public characterScreenPos: Vector3 = new Vector3(0, 0, 0);
    dayNight: number = 0;
    lockView: boolean = false;
    public drawingByLabel: { [label: string]: Drawing } = {};
    public hitStateChange: boolean = false;
    public hitObjectLabelPrev: string = "";
    hitWorldPos: Vector3;
    hitWorldNormal: Vector3;
    outlinePass: OutlinePass;
    characterHandler: CharacterHandler;
    gameCamera: GameCamera;
    frustumCull = true;
    textHandler: TextHandler;
    catchMouseDown: boolean = false;
    sound: SoundHandler;
    gameUI: GameUI;
    screenWidth: number;
    screenHeight: number;
    public pantsFound: number = 0;
    public currentPants: number = 0;
    uiOpen = false;
    //debugstuff
    devSpeed: boolean = false;
    debug: boolean = false;
    startOutside: boolean = false;
    room: Room;
    outside: Outside;
    lastClickLabels: Array<string> = [];
    private floorLabels: string[];
    private triggers: Array<Trigger> = []
    private currentTransition: Transition;
    private laptopSelect: Array<SelectItem>;
    private millSelect: Array<SelectItem>;
    private highTechSelect: Array<SelectItem>;

    constructor() {


        this.prepUI()
    }

    private _stateHighTech = StateHighTech.START

    get stateHighTech(): StateHighTech {
        return this._stateHighTech;
    }

    set stateHighTech(value: StateHighTech) {
        if (value == StateHighTech.START) {
            this.renderer.modelByLabel["glowFlower"].visible = false
            this.renderer.modelByLabel["glowFlower"].enableHitTest = false
            this.renderer.modelByLabel["glowFlowerStem"].visible = false
            this.renderer.modelByLabel["pot"].enableHitTest = true
            this.renderer.modelByLabel["Bush3"].enableHitTest = true
        } else if (value == StateHighTech.GROW_FLOWER) {
            this.renderer.modelByLabel["glowFlower"].visible = true
            this.renderer.modelByLabel["glowFlower"].enableHitTest = true
            this.renderer.modelByLabel["glowFlowerStem"].visible = true
            this.renderer.modelByLabel["pot"].enableHitTest = false
            this.renderer.modelByLabel["Bush3"].enableHitTest = false
        } else {
            this.renderer.modelByLabel["glowFlower"].visible = false
            this.renderer.modelByLabel["glowFlower"].enableHitTest = false
            this.renderer.modelByLabel["glowFlowerStem"].visible = true
            this.renderer.modelByLabel["pot"].enableHitTest = false
            this.renderer.modelByLabel["Bush3"].enableHitTest = false
        }

        this._stateHighTech = value;
    }

    private _hitObjectLabel: string = "";

    get hitObjectLabel(): string {
        return this._hitObjectLabel;
    }

    set hitObjectLabel(value: string) {

        if (value == this._hitObjectLabel) {
            return;
        }
        if (this.lastClickLabels.includes(value)) {
            if (this.floorLabels.includes(value)) {

            } else {
                return;
            }


        }
        if (value != "") {
            this.lastClickLabels = []
        }

        this.hitStateChange = true;
        this.hitObjectLabelPrev = this._hitObjectLabel;
        this._hitObjectLabel = value;
        if (this.debug) UI.logEvent("Hit", value);

    }

    setMillState(state: MillState) {
        this.millState = state;
        this.room.mill.setState(state);
    }

    setLaptopState(state: LaptopState) {
        this.laptopState = state;
        this.room.laptopScreen.setState(state);
    }

    update() {

        this.screenWidth = this.renderer.width / this.renderer.pixelRatio;
        this.screenHeight = this.renderer.height / this.renderer.pixelRatio;

        if (this.currentTransition) {
            if (this.mouseDownThisFrame) this.currentTransition.onMouseDown()

        } else if (this.mouseDownThisFrame) {
            this.textHandler.hideHitTrigger()
        }
        this.gameUI.updateMouse(this.mousePos, this.mouseDownThisFrame, this.mouseUpThisFrame)
        this.gameUI.update()
        if (!this.currentTransition) {
            //checkUI

            for (let t of this.triggers) {
                t.check();
            }
        }
        if (this.textHandler) this.textHandler.update();
        this.hitStateChange = false;
    }


    public setScene(scenes: Scenes) {
        this.main.setScene(scenes);
        this.currentScene = scenes;
    }

    setTransition(t: Transition, data: string = "") {
        this.hitObjectLabel = ""
        this.catchMouseDown = true;
        this.currentTransition = t;
        this.outlinePass.setModel(null);

        this.gameUI.cursor.hide()
        this.setUIState(UIState.HIDE_MENU)
        t.set(this.transitionComplete.bind(this), data);
    }

    transitionComplete() {

        this.mouseDownThisFrame = false
        this.catchMouseDown = false;
        this.currentTransition = null;
        this.setUIState(UIState.GAME_DEFAULT)
    }


    getDrawingByLabel(label: string) {
        return this.drawingByLabel[label];
    }

    getCharacterScreenPos() {
        this.characterScreenPos.from(this.characterPos)

        this.gameCamera.getScreenPos(this.characterScreenPos)
        this.characterScreenPos.scale(0.5)
        this.characterScreenPos.add([0.5, 0.5, 0])
        this.characterScreenPos.scale([this.screenWidth, this.screenHeight, 1])
        return this.characterScreenPos;
    }

    initText() {
        this.textHandler.init()
        for (let d of this.textHandler.hitTriggers) {

            this.triggers.push(new HitTextTrigger(d.scene, d.object))
        }
    }


    setUIState(state: UIState, data: any = null) {
        this.gameUI.setUIState(state, data);

        if (state == UIState.OPEN_MENU || state == UIState.INVENTORY_DETAIL) {
            RenderSettings.openMenu()
            this.uiOpen = true;

        } else if (state == UIState.GAME_DEFAULT) {
            RenderSettings.closeMenu()
            this.uiOpen = false;
        }
    }

    usePants(id: number) {
        this.currentPants = id;
        this.characterHandler.setPants(id)
    }

    makeTriggers() {
        this.triggers.push(new FlowerHitTrigger(Scenes.OUTSIDE, ["glowFlower"]));
        this.triggers.push(new FlowerPotHitTrigger(Scenes.OUTSIDE, ["pot", "Bush3"]));
        this.triggers.push(new GoHunterTrigger(Scenes.OUTSIDE, "hunterPants"));
        this.triggers.push(new GoGraveTrigger(Scenes.OUTSIDE, "cross"));
        this.triggers.push(new DoorGoOutsideTrigger(Scenes.ROOM, "door_HO"));
        this.triggers.push(new DoorGoInsideTrigger(Scenes.OUTSIDE, "door"));
        this.triggers.push(new DoorInsideTrigger(Scenes.ROOM, "_HitCenterDoor"));
        this.triggers.push(new SitTrigger(Scenes.ROOM, "chair"));
        this.triggers.push(new GoWorkTrigger(Scenes.ROOM, "labtop"));
        this.triggers.push(new MillTrigger(Scenes.ROOM, ["mill", "millBed", "millControle", "millHead"]));
        this.triggers.push(new BookCaseTrigger(Scenes.ROOM, "bookCaseDoor"));
        this.triggers.push(new FloorHitTrigger(Scenes.ROOM, ["_HitRightRoom", "_HitLeftRoomCenter", "_HitLeftRoomRight", "_HitLeftRoomLeft"]))
        this.triggers.push(new FloorHitTrigger(Scenes.OUTSIDE, ["_HitGround"]))

        for (let t of this.triggers) {
            t.init()
        }
        this.floorLabels = ["_HitGround", "_HitRightRoom", "_HitLeftRoomCenter", "_HitLeftRoomRight", "_HitLeftRoomLeft"]
        this.stateHighTech = StateHighTech.START;
    }

    prepUI() {
        this.laptopSelect = UIUtils.EnumToSelectItem(LaptopState)
        this.millSelect = UIUtils.EnumToSelectItem(MillState)
        this.highTechSelect = UIUtils.EnumToSelectItem(StateHighTech)

    }

    onUI() {
        UI.pushWindow("GameModel")
        UI.separator("GameState")
        let sht = UI.LSelect("HighTechPants", this.highTechSelect, this._stateHighTech)
        if (sht != this._stateHighTech) this.stateHighTech = sht
        UI.separator("objects")

        let ls = UI.LSelect("labtop", this.laptopSelect, this.laptopState)
        if (ls != this.laptopState) this.setLaptopState(ls);

        let ms = UI.LSelect("mill", this.millSelect, this.millState)
        if (ms != this.millState) this.setMillState(ms);

        UI.popWindow()
    }

}

export default new GameModel()


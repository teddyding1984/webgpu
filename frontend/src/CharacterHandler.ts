import {Vector3} from "math.gl";
import Renderer from "./lib/Renderer";
import Camera from "./lib/Camera";
import AnimationMixer from "./lib/animation/AnimationMixer";
import Object3D from "./lib/core/Object3D";


import gsap from "gsap";
import Timeline from "gsap";

import GameModel, {Scenes} from "./GameModel";
import GLFTLoader from "./GLFTLoader";

import UI from "./lib/UI/UI";
import Material from "./lib/core/Material";
import Model from "./lib/model/Model";
import Timer from "./lib/Timer";


export default class CharacterHandler {
    characterRot: number = 0;
    body: Model;
    /// public floorHitIndicator: FloorHitIndicator;
    private renderer: Renderer;
    private camera: Camera;
    private animationMixer: AnimationMixer;
    private characterRoot: Object3D;
    private root: Object3D
    // @ts-ignore
    private tl: Timeline;
    private scene: number = 0;
    private isWalking: boolean = false;
    private targetPos: Vector3 = new Vector3();
    private targetRot: number = 0;
    private neck: Object3D;
    private head: Object3D;
    private pants: Material;
    private walkingSpeed: number = 0.72;
    private charScale: number = 1;

    constructor(renderer: Renderer, camera: Camera, glft: GLFTLoader, animationMixer: AnimationMixer) {

        this.renderer = renderer;
        this.camera = camera;
        this.animationMixer = animationMixer;
        this.characterRoot = glft.root;
        this.body = glft.modelsByName["body"];
        //      this.body.mesh.max.scale(100);
        //    this.body.mesh.min.scale(100);
//console.log(  this.body.mesh.max, this.body.mesh.min)
        this.body.mesh.max.set(30, 30, 0)
        this.body.mesh.min.set(-30, -30, -220)
        /* let m =new Model(renderer,"testSphere")
         m.mesh =new Sphere(renderer)
         this.body.parent.addChild(m)

         m.castShadow=false;
         m.material =new Material(renderer,"testSpherer",new GBufferShader(renderer,"eee"))
 */

        this.pants = glft.materialsByName["pants"]
      // this.head =glft.objectsByName["Ctrl_Head"]
        this.animationMixer.setAnimation("idle");
        this.characterRoot.setPosition(GameModel.characterPos.x, GameModel.characterPos.y, GameModel.characterPos.z)


    }

    setRoot(r: Object3D, scene: number) {
        this.scene = scene;
        this.root = r;
        this.root.addChild(this.characterRoot)

    }

    update() {

        this.animationMixer.update();
        if (GameModel.currentScene == Scenes.ROOM) {
            this.charScale = 1.05;
        } else {
            this.charScale = 1.00;
        }
        //  this.head.setEuler(Timer.time*7,0,0);


        this.characterRoot.setScale(this.charScale, this.charScale, this.charScale)
        this.characterRoot.setPosition(GameModel.characterPos.x, GameModel.characterPos.y, GameModel.characterPos.z)
        this.characterRoot.setEuler(0, this.characterRot, 0)


    }

    public walkTo(target: Vector3, targetRot = 0, completeCall: () => any = () => {
    }, keepWalking: boolean = false) {

        this.targetRot = targetRot;
        this.targetPos.from(target);
        this.targetPos.y = 0;
        if (this.tl) this.tl.clear()
        this.tl = gsap.timeline({
            onComplete: () => {

                completeCall()
            }
        });

        if (this.isWalking == false) {
            this.startWalking(keepWalking)
        } else {
            this.continueWalking(keepWalking)
        }
    }

    public onUI() {

        return;
        UI.separator("animations")
        if (UI.LButton("dance")) this.setAnimation("dance")
        if (UI.LButton("sit")) this.setAnimation("sit")
        UI.separator("underpants")


    }

    public setPants(id: number) {
        let name = "";
        if (id == 1) {
            name = "Army"
        }
        this.pants.uniforms.setTexture("colorTexture", this.renderer.texturesByLabel["textures/pants" + name + "_Color.png"])
        this.pants.uniforms.setTexture("normalTexture", this.renderer.texturesByLabel["textures/pants" + name + "_Normal.png"])
        this.pants.uniforms.setTexture("mraTexture", this.renderer.texturesByLabel["textures/pants" + name + "_MRA.png"])


    }

    public setAnimation(name: string,speed:number=0.5,delay:number=0) {
        if (this.tl) this.tl.clear()
        this.tl = gsap.timeline();
        this.tl.call(() => {
            this.animationMixer.setAnimation(name, 0);
            this.isWalking = false
        }, [], delay)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration:speed, ease: "none"}, delay)
    }

    public startWalking(keepWalking: boolean = false) {
        let pos = 0
        let dist = GameModel.characterPos.distance(this.targetPos);
        let dir = this.targetPos.clone().subtract(GameModel.characterPos)
        let angle = Math.atan2(dir.x, dir.z);



        this.tl.call(() => {
            this.animationMixer.setAnimation("walking", 0)  , this.isWalking = true
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "power1.inOut"}, pos)
        this.tl.to(this, {"characterRot": angle, duration: 0.5, ease: "none"}, pos)

        pos += 0.3;
        let duration = dist * this.walkingSpeed;
        this.tl.to(GameModel.characterPos, {
            "x": this.targetPos.x,
            "y": this.targetPos.y,
            "z": this.targetPos.z,
            duration: duration,
            ease: "none"
        }, pos)

        if (keepWalking) return;

        pos += duration;
        let nextAnime = "idle"

        this.tl.call(() => {
            this.animationMixer.setAnimation(nextAnime, 0);
            this.isWalking = false
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "none"}, pos)
        this.tl.to(this, {"characterRot": this.targetRot, duration: 0.5, ease: "power1.inOut"}, pos)
    }

    startTyping() {
        this.setAnimation("typing")
    }

    sit() {
        this.setAnimation("sit")
    }

    continueWalking(keepWalking: boolean = false) {
        let pos = 0
        let dist = GameModel.characterPos.distance(this.targetPos);
        let dir = this.targetPos.clone().subtract(GameModel.characterPos)
        let angle = Math.atan2(dir.x, dir.z);


        this.tl.to(this, {"characterRot": angle, duration: 0.5, ease: "power1.inOut"}, pos)

        let duration = dist * this.walkingSpeed;
        this.tl.to(GameModel.characterPos, {
            "x": this.targetPos.x,
            "y": this.targetPos.y,
            "z": this.targetPos.z,
            duration: duration,
            ease: "none"
        }, pos)

        if (keepWalking) return;

        pos += duration;
        let nextAnime = "idle"

        this.tl.call(() => {
            this.animationMixer.setAnimation(nextAnime, 0);
            this.isWalking = false
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "none"}, pos)
        this.tl.to(this, {"characterRot": this.targetRot, duration: 0.5, ease: "none"}, pos)
    }

    pullPants() {
        this.animationMixer.setAnimation("pullPants", 0);
        this.animationMixer.mixValue=1;
        this.setAnimation("idle",0.4,0.2);
    }

    setIdleAndTurn() {


        this.setAnimation("idle",0.5,0.0);
        this.tl.to(this, {"characterRot":0, duration: 0.5, ease: "power1.inOut"},0.0)
    }
}

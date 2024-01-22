import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import {preloadImages} from "./PreloadData";
import TextureLoader from "./lib/textures/TextureLoader";
import ModelRenderer from "./lib/model/ModelRenderer";
import GameModel from "./GameModel";


 class ImagePreloader{


    constructor() {

    }

    load(renderer:Renderer,preloader:PreLoader) {
        let delay=100;
        for(let img of preloadImages){
            if(GameModel.devSpeed)delay =0;
            let name = "textures/"+img+".png";
            if(renderer.texturesByLabel[name]== undefined){

                new TextureLoader(renderer,preloader,"textures/"+img+".png",{mipLevelCount:6},delay);
            }

            delay+=16;
        }

    }


}
export default new ImagePreloader()

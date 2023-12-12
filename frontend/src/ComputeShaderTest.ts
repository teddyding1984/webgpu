import Renderer from "./lib/Renderer";
import UniformGroup from "./lib/core/UniformGroup";
import Texture from "./lib/textures/Texture";
import {TextureDimension} from "./lib/WebGPUConstants";

export default class ComputeShaderTest{
    private renderer: Renderer;
    private passEncoder: GPUComputePassEncoder;
    private computePipeline: GPUComputePipeline;
private numComps=10;

    private uniformGroup: UniformGroup;
    private texture: Texture;
    private pipeLineLayout: GPUPipelineLayout;

    constructor(renderer:Renderer) {
        this.renderer =renderer;
        this.uniformGroup =new UniformGroup(this.renderer,"testCompute","test")
        this.uniformGroup.addUniform("x",1);
        this.texture =new Texture(renderer,"ComputeTexture",{width:1024,height:1024,usage:  GPUTextureUsage.COPY_DST |
                GPUTextureUsage.STORAGE_BINDING |
                GPUTextureUsage.TEXTURE_BINDING})
        this.texture.make()
        this.uniformGroup.addTexture("outputTexture",this.texture,"float",TextureDimension.TwoD,GPUShaderStage.COMPUTE);
        console.log(this.uniformGroup.getShaderText(0));
    }


    public add(){
return;
        let descriptor:GPUComputePassDescriptor={}
        this.passEncoder = this.renderer.commandEncoder.beginComputePass(
            descriptor
        );
        this.passEncoder.setPipeline(this.getPipeLine());
        this.passEncoder.setBindGroup(0, this.uniformGroup.bindGroup);
        this.passEncoder.dispatchWorkgroups(Math.ceil(1024 / 64),1024,1);

        this.passEncoder.end();
    }
getPipeLine(){
    this.pipeLineLayout = this.renderer.device.createPipelineLayout({
        label: "Compute_pipelineLayout_" ,
        bindGroupLayouts: [this.uniformGroup.bindGroupLayout],
    });
       // if( this.computePipeline)return  this.computePipeline;
        this.computePipeline = this.renderer.device.createComputePipeline({
        layout: this.pipeLineLayout ,
        compute: {
            module: this.renderer.device.createShaderModule({
                code: this.getShaderCode(),
            }),
            entryPoint: 'main',
        },
    });
    return this.computePipeline;


}

    private getShaderCode() {
        return /* wgsl */ `

struct Test
{
    x : f32,
}
@group(0) @binding(0)  var<uniform> test : Test ;
@group(0) @binding(1)  var outputText: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8, 1)
        fn main(
        @builtin(workgroup_id) WorkGroupID : vec3<u32>,
        @builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
           
         
 textureStore(outputText, WorkGroupID.xy, vec4(1.0,0.0,1.0, 1.0));
        }
`;
    }
}

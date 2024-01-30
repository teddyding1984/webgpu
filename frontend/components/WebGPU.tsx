import React from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import Head from 'next/head'
import Main from "../src/Main";


export default class WebGPU extends React.Component {
    private main: Main;

    componentDidMount() {

        let canvas = document.getElementById("webgpu") as HTMLCanvasElement;
        this.main = new Main(canvas);

    }

    render() {
        return (<div>
            <Head>
                <title>webgpu</title>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
            </Head>
                <GoogleAnalytics gaId="G-B1CYW0MX02" />


            <canvas id="webgpu"></canvas>

        </div>

        )
    }


}

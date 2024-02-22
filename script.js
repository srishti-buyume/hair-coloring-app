import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0"; // Loading the package like this using a CDN URL is not recommended for the production build of the app, download/build the package locally


const { ImageSegmenter, SegmentationMask, FilesetResolver } = vision;
let imageSegmenter;
let labels;
let runningMode = "VIDEO";

// LOAD SEGMENTATION MODEL WITH SPECIFIED PARAMETERS 
const createImageSegmenter = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"); // Again this CDN URL is only for demo purpose, load the package locally when building the app
    imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "./models/hair1_mt.tflite",
            delegate: "GPU"
        },
        runningMode: runningMode,
        outputCategoryMask: true,
        outputConfidenceMasks: true
    });
    labels = imageSegmenter.getLabels();
    console.log("labels", labels)
};


// MAIN FUNCTION FOR ALL HAIR COLORING FEATURE
function hairColoring() 
{
    let video = document.getElementById("webcam");
    let canvasElement = document.getElementById("canvas1");
    let canvasElement2 = document.getElementById("canvas2");
    const canvasCtx = canvasElement.getContext("2d", { willReadFrequently: true })
    const canvasCtx2 = canvasElement2.getContext("2d", { willReadFrequently: true })
    let enableWebcamButton;
    let webcamRunning = false;
    let legendColors = [ [0, 0, 0, 0], [182, 47, 47, 120] ];  


    // Run hair coloring on live webcam feed
    function callbackForVideo(result) {
        console.log("Result", result)
        canvasElement.style.display = 'block';
        canvasElement2.style.display = 'block';
        let imageData = canvasCtx.getImageData(0, 0, video.videoWidth, video.videoHeight).data;
        const mask = result.categoryMask.getAsUint8Array();
        for (let i in mask) {
            if(labels[mask[i]] == "hair"){
            const legendColor = legendColors[1];
            imageData[i * 4 + 0] = (legendColor[0] + imageData[i * 4 + 0]) / 2;
            imageData[i * 4 + 1] = (legendColor[1] + imageData[i * 4 + 1]) / 2;
            imageData[i * 4 + 2] = (legendColor[2] + imageData[i * 4 + 2]) / 2;
            imageData[i * 4 + 3] = (legendColor[3] + imageData[i * 4 + 3]) / 2;
            }
        }
        const uint8Array = new Uint8ClampedArray(imageData.buffer);
        const dataNew = new ImageData(uint8Array, video.videoWidth, video.videoHeight);
        canvasCtx.imageSmoothingEnabled = true;
        canvasCtx.putImageData(dataNew, 0, 0);
        if (webcamRunning === true) {
            window.requestAnimationFrame(predictWebcam);
        }   
    }


    // Run hair coloring for image input
    function callbackForImage(result) {  
        console.log("Result", result)  
        const cxt = canvasClick.getContext("2d");
        const { width, height } = result.categoryMask;
        let imageData = cxt.getImageData(0, 0, width, height).data;
        canvasClick.width = width;
        canvasClick.height = height;
        const mask = result.categoryMask.getAsUint8Array();
        for (let i in mask) {  
            // console.log("class", labels[mask[i]])
            if(labels[mask[i]] === "hair"){
            const legendColor = legendColors[1];
            imageData[i * 4 + 0] = (legendColor[0] + imageData[i * 4 + 0]) / 2;
            imageData[i * 4 + 1] = (legendColor[1] + imageData[i * 4 + 1]) / 2;
            imageData[i * 4 + 2] = (legendColor[2] + imageData[i * 4 + 2]) / 2;
            imageData[i * 4 + 3] = (legendColor[3] + imageData[i * 4 + 3]) / 2;
            }
        }
        const uint8Array = new Uint8ClampedArray(imageData.buffer);
        const dataNew = new ImageData(uint8Array, width, height);
        canvasClick.imageSmoothingEnabled = true;
        cxt.putImageData(dataNew, 0, 0);

        const p = event.target.parentNode.getElementsByClassName("classification")[0];
        p.classList.remove("removed");
        const endTime = performance.now();
        const inferenceTime = endTime - startTime;
        console.log(`Total Processing Time: ${inferenceTime} ms`);
        p.innerText = "Inference Time:" + inferenceTime;
    }
    

    // Get Image DOM Elements
    const imageContainers = document.getElementsByClassName("segmentOnClick");
    for (let i = 0; i < imageContainers.length; i++) {
        imageContainers[i]
            .getElementsByTagName("img")[0]
            .addEventListener("click", handleClick);
    }


    // Handle Image click event from User
    let canvasClick;
    let startTime ;
    async function handleClick(event) {
        startTime = performance.now();
        if (imageSegmenter === undefined) {
            return;
        }
        canvasClick = event.target.parentElement.getElementsByTagName("canvas")[0];
        canvasClick.classList.remove("removed");
        canvasClick.width = event.target.naturalWidth;
        canvasClick.height = event.target.naturalHeight;
        const cxt = canvasClick.getContext("2d");
        cxt.clearRect(0, 0, canvasClick.width, canvasClick.height);
        cxt.drawImage(event.target, 0, 0, canvasClick.width, canvasClick.height);
        event.target.style.opacity = 0;
        // if VIDEO mode is initialized, set runningMode to IMAGE
        if (runningMode === "VIDEO") {
            runningMode = "IMAGE";
            await imageSegmenter.setOptions({
                runningMode: runningMode
            });
        }
        console.log("img clicked")
        imageSegmenter.segment(event.target, callbackForImage);
        
    }



    // Check if webcam access is supported.
    function hasGetUserMedia() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    // Get segmentation from the webcam
    let lastWebcamTime = -1;
    async function predictWebcam() {
        if (video.currentTime === lastWebcamTime) {
            if (webcamRunning === true) {
                window.requestAnimationFrame(predictWebcam);
            }
            return;
        }
        lastWebcamTime = video.currentTime;
        canvasCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvasCtx2.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        if (imageSegmenter === undefined) {
            return;
        }
        if (runningMode === "IMAGE") {
            runningMode = "VIDEO";
            await imageSegmenter.setOptions({
                runningMode: runningMode
            });
        }
        let startTimeMs = performance.now();
        imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
    }


    // Enable the live webcam view and start imageSegmentation.
    async function enableCam(event) {
        if (imageSegmenter === undefined) {
            return;
        }
        if (webcamRunning === true) {
            webcamRunning = false;
            enableWebcamButton.innerText = "ENABLE LIVE TRY-ON";
        }
        else {
            webcamRunning = true;
            enableWebcamButton.innerText = "DISABLE LIVE TRY-ON";
        }
        const constraints = { video: true, audio: false};
        video = document.getElementById("webcam");
        video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
        video.addEventListener("loadeddata", predictWebcam);
        video.play();
        video.style.display = 'none';
    }


    // If webcam supported, add event listener to button.
    if (hasGetUserMedia()) {
        enableWebcamButton = document.getElementById("webcamButton");
        enableWebcamButton.addEventListener("click", enableCam);
    }
    else {
        console.warn("getUserMedia() is not supported by your browser");
    }


    //ADD CONTROLS FOR COLOR, OPACITY AND BLUR
    const hexToRgb = hex =>
        hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
            .substring(1).match(/.{2}/g)
            .map(x => parseInt(x, 16))

    function colVal() {
            let d = document.getElementById("color").value;
            let hex = hexToRgb(d);
            hex[3] = 140; // alpha/opacity value 0-255
            console.log(hex);
            legendColors[1] = hex;
        }

    function blurVal() {
        let x = document.getElementById("blur").value;
        console.log(x);
        document.getElementById('canvas1').style.filter = 'blur('+x+'px)';
    }

    function opVal() {
        let z = document.getElementById("opacity").value;
        console.log(z);
        // document.getElementById('canvas1').style.opacity = 0.3//z;
    }

    document.getElementById("color").addEventListener("input", colVal);
    document.getElementById("blur").addEventListener("input", blurVal);
    document.getElementById("opacity").addEventListener("input", opVal);

}



createImageSegmenter();
hairColoring();
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0"; 

const {ImageSegmenter, FaceLandmarker, FilesetResolver } = vision;
let imageSegmenter;
let labels;
let faceLandmarker;
let runningMode = "VIDEO";
// let faceBlushVal = "False";
// let lipColorVal = "False";
// let eyeShadowVal = "False";
let eyeLinerVal = false;
let enableMakeup = false;


// LOAD SEGMENTATION MODEL WITH SPECIFIED PARAMETERS 
const createImageSegmenter = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"); // Again this CDN URL is only for demo purpose, load the package locally when building the app
    imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "./models/yolov5_with_metadata.tflite",
            delegate: "GPU"
        },
        runningMode: runningMode,
        outputCategoryMask: true,
        outputConfidenceMasks: true
    });
    labels = imageSegmenter.getLabels();
};




const createFaceLandmarker = async () => {
    const ultron = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(ultron, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "IMAGE",
        numFaces: 1
    });
};



// MAIN FUNCTION FOR ALL MAKEUP FEATURE
function makeupTryon() 
{
    let video = document.getElementById("webcam");
    let canvasElement = document.getElementById("canvas1");
    const canvasCtx = canvasElement.getContext("2d", { willReadFrequently: true })
    const ctx = canvasElement.getContext("2d", { willReadFrequently: true })
    let enableWebcamButton;
    let webcamRunning = false;
    let legendColors = [ [0, 0, 0, 0], [90, 30, 31, 100] ]; 
    console.log("color", legendColors[1], legendColors[1][0])


    // Run hair coloring on live webcam feed
    function callbackForVideo(landmarks) {
        canvasElement.style.display = 'block';

        const landmarkLips1= [
            landmarks[0][61],landmarks[0][40],landmarks[0][39],landmarks[0][37],landmarks[0][0],landmarks[0][267],landmarks[0][269],landmarks[0][270],landmarks[0][409],
            landmarks[0][306],landmarks[0][415], landmarks[0][310],landmarks[0][311],landmarks[0][312],landmarks[0][13],landmarks[0][82],landmarks[0][81],landmarks[0][42],
            landmarks[0][183],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],
            landmarks[0][61],landmarks[0][61], landmarks[0][61]
            ];
          const landmarkLips2= [
              landmarks[0][61], landmarks[0][146],landmarks[0][91], landmarks[0][181],
              landmarks[0][84], landmarks[0][17], landmarks[0][314],landmarks[0][405], landmarks[0][321], landmarks[0][375], landmarks[0][306], 
              landmarks[0][409], landmarks[0][324], landmarks[0][318], landmarks[0][402],landmarks[0][317], 
              landmarks[0][14], landmarks[0][87], landmarks[0][178], landmarks[0][88],landmarks[0][95], landmarks[0][61]
            ];
         
          ctx.imageSmoothingEnabled = true;
      
          const baseColor = { r: legendColors[1][0], g: legendColors[1][1], b: legendColors[1][2], a: 0.4 } ; //change alpha change for opacity
          ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
          ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
      
          ctx.beginPath();
          ctx.lineWidth= 0.9;
          landmarkLips1.forEach(point => { ctx.arc(point.x * canvasElement.width, point.y * canvasElement.height, 0, 0, Math.PI * 2) }); 
          landmarkLips2.forEach(point => { ctx.arc(point.x * canvasElement.width, point.y * canvasElement.height, 0, 0, Math.PI * 2) }); 
          ctx.fill();
          ctx.stroke(); 
          ctx.closePath();

        if (webcamRunning === true) {
            window.requestAnimationFrame(predictWebcam);
        }   
    }


    // Run hair coloring for image input
    function callbackForImage(landmarks, canvas) {  
        if(enableMakeup) {
        
        const landmarkLips1= [
            landmarks[0][61],landmarks[0][40],landmarks[0][39],landmarks[0][37],landmarks[0][0],landmarks[0][267],landmarks[0][269],landmarks[0][270],landmarks[0][409],
            landmarks[0][306],landmarks[0][415], landmarks[0][310],landmarks[0][311],landmarks[0][312],landmarks[0][13],landmarks[0][82],landmarks[0][81],landmarks[0][42],
            landmarks[0][183],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],landmarks[0][61],
            landmarks[0][61],landmarks[0][61], landmarks[0][61]
            ];
          const landmarkLips2= [
              landmarks[0][61], landmarks[0][146],landmarks[0][91], landmarks[0][181],
              landmarks[0][84], landmarks[0][17], landmarks[0][314],landmarks[0][405], landmarks[0][321], landmarks[0][375], landmarks[0][306], 
              landmarks[0][409], landmarks[0][324], landmarks[0][318], landmarks[0][402],landmarks[0][317], 
              landmarks[0][14], landmarks[0][87], landmarks[0][178], landmarks[0][88],landmarks[0][95], landmarks[0][61]
            ];
         
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
      
          const baseColor = { r: legendColors[1][0], g: legendColors[1][1], b: legendColors[1][2], a: 0.4} ; //{ r: 90, g: 30, b: 31, a: 0.6 };
          ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
          ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
      
          ctx.beginPath();
          ctx.lineWidth= 0.9;
          landmarkLips1.forEach(point => { ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2) }); //upper lip
        //   landmarkLips2.forEach(point => { ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2) }); //lower lip
          ctx.fill(); // Lip Filling
          ctx.stroke();  // Lip Lining
          ctx.closePath();


          ctx.beginPath();
          ctx.lineWidth= 0.9;
        //   landmarkLips1.forEach(point => { ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2) }); //upper lip
          landmarkLips2.forEach(point => { ctx.arc(point.x * canvas.width, point.y * canvas.height, 0, 0, Math.PI * 2) }); //lower lip
          ctx.fill(); // Lip Filling
          ctx.stroke();  // Lip Lining
          ctx.closePath();
    
        } //if

        else {
            console.log("no makeup")
        }
           
    }
  


    // UTILITY FUNCTIONS TO HANDLE IMAGE/VIDEO DATA, MAKEUP/HAIR TRYON ETC.

    // Get Image DOM Elements
    const imageContainers = document.getElementsByClassName("segmentOnClick");
    for (let i = 0; i < imageContainers.length; i++) {
        imageContainers[i]
            .getElementsByTagName("img")[0]
            .addEventListener("click", handleClick);
    }


    // Handle Image click event from User
    let canvasClick;
    async function handleClick(event) {
        if (imageSegmenter === undefined) {
            return;
        }
        if (faceLandmarker === undefined) {
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
        if (runningMode === "VIDEO" || runningMode === "LIVE_STREAM") {
            runningMode = "IMAGE";
            await imageSegmenter.setOptions({
                runningMode: runningMode
            });
            await faceLandmarker.setOptions({
                runningMode: runningMode
            });
        }
        const faceLandmarkerResult = faceLandmarker.detect(event.target);
        callbackForImage(faceLandmarkerResult.faceLandmarks, canvasClick);
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
        if (imageSegmenter === undefined) {
            return;
        }
        if (runningMode === "IMAGE") {
            runningMode = "VIDEO";
            await imageSegmenter.setOptions({
                runningMode: runningMode
            });
            await faceLandmarker.setOptions({
                runningMode: "IMAGE"
            });
        }
        const faceLandmarkerResult = faceLandmarker.detect(video);
        callbackForVideo(faceLandmarkerResult.faceLandmarks);
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





    // Function to handle the "Enable/Disable Landmark" button click
    function toggleLandmark() {
        enableMakeup = !enableMakeup;
        const button = document.getElementById("makeupButton");
        button.innerText = enableMakeup ? "Disable Makeup" : "Enable Makeup";
    }

    // Add a click event listener to the "Enable/Disable Landmark" button
    document.getElementById("makeupButton").addEventListener("click", toggleLandmark);



    //ADD CONTROLS FOR COLOR, OPACITY AND BLUR
    const hexToRgb = hex =>
        hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
            .substring(1).match(/.{2}/g)
            .map(x => parseInt(x, 16))

    function colVal() {
            let d = document.getElementById("color").value;
            let hex = hexToRgb(d);
            hex[3] = 120;
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
        document.getElementById('canvas1').style.opacity = 0.3//z;
    }

 



    document.getElementById("color").addEventListener("input", colVal);
    document.getElementById("blur").addEventListener("input", blurVal);
    document.getElementById("opacity").addEventListener("input", opVal);

}



createImageSegmenter();
createFaceLandmarker();
makeupTryon();
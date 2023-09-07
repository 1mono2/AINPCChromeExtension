import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const extensionField = document.createElement("div");
extensionField.id = "my-extension-field";
const inputWrapper = document.createElement("div");
inputWrapper.id = "my-extension-input-wrapper";

const inputElement = document.createElement("input");
inputElement.id = "my-extension-input";
inputElement.type = "text";
inputElement.placeholder = "テキストを入力...";

const submitButton = document.createElement("button");
submitButton.id = "my-extension-submit";
submitButton.textContent = "送信";

inputWrapper.appendChild(inputElement);
inputWrapper.appendChild(submitButton);
extensionField.appendChild(inputWrapper);
document.body.appendChild(extensionField);

// animation button for test
// const animationButton = document.createElement("button");
// animationButton.id = "playAnimation";
// animationButton.textContent = "アニメーションを再生";
// const animationStopButton = document.createElement("button");
// animationStopButton.id = "stopAnimation";
// animationStopButton.textContent = "アニメーションを停止";

// inputWrapper.appendChild(animationButton);
// inputWrapper.appendChild(animationStopButton);

submitButton.addEventListener("click", function () {
    const inputValue = inputElement.value;

    // background scriptにメッセージを送信
    // chrome.runtime.sendMessage({ type: "sendTextToAPI", text: inputValue }, function (response) {

    //     if (response.error) {
    //         console.error('Error occurred:', response.error);
    //         return;
    //     }
    //     if (!response.audio) {
    //         console.error('Error occurred: response.audio is null');
    //         return;
    //     }
    //     const audio = new Audio(response.audio);
    //     audio.play();

    //     // TODO: ユーザーの音声入力を受け付ける。Webサイトの情報を入れる。3Dモデルを実装する。
    // });

    chrome.runtime.sendMessage({ type: "sendTextToAPI", text: inputValue });

});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type == "responseSendTextToAPI") {
        if (message.error) {
            console.error('Error occurred:', message.error);
            return;
        }
        if (!message.audio) {
            console.error('Error occurred: response.audio is null');
            return;
        }
        const audio = new Audio(message.audio);
        audio.addEventListener('ended', function () {
            console.log('Audio playback has ended.');
            mouthEnabled = false;
        });
        mouthEnabled = true;
        audio.play();
    }
});

// シーンの作成
const scene = new THREE.Scene();

// カメラの作成
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 1.4, 0.5);
camera.lookAt(0, 1.2, 0);

// レンダラーの作成
const rendererField = document.createElement("div");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
rendererField.appendChild(renderer.domElement);
extensionField.appendChild(rendererField);

// ライトの追加
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);


// ウィンドウのサイズ変更時にレンダラーとカメラのサイズを調整
window.addEventListener('resize', function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});



let mixer = null;
let mesh = null;
const actions = {};
//const loader = new FBXLoader();
const loader = new GLTFLoader();
const modelPath = chrome.runtime.getURL('content/model/tsumugi6.glb');
loader.load(modelPath, (object) => {

    const model = object.scene;
    // シーンにモデルを追加
    scene.add(model);


    // アニメーションミキサーの作成
    mixer = new THREE.AnimationMixer(model);

    // アニメーションを取得

    object.animations.forEach((clip) => {
        console.log(clip.name);
        actions[clip.name] = mixer.clipAction(clip);

    });
    actions["Humanoid Bone|mixamo.com|Layer0"].play();

    // morph target animation
    scene.traverse((node) => {
        if (node.name === "Circle005") {
            // nodeにはmorphTargetInfluencesという配列があります。
            // この配列の各要素は、対応するmorphTargetの影響度を示します。
            mesh = node;
            console.log("Body found");
        }
    });

}, (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, (error) => {
    console.error('An error happened', error);
});

let clock = new THREE.Clock();

let direction = 1;  // 1: 瞬き開始, -1: 瞬き終了
let blinkInterval = 5;  // 2秒ごとに瞬き
let timeSinceLastBlink = 0;
const blinkSpeed = 8; // この値を調整して、瞬きの速度を変更する

let mouthDirection = 1;  // 1: 瞬き開始, -1: 瞬き終了
const mouthSpeed = 6; // この値を調整して、瞬きの速度を変更する
let mouthEnabled = false;

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);

    let delta = clock.getDelta();
    if (mixer) mixer.update(delta);


    timeSinceLastBlink += delta;

    // ここで瞬きのアニメーションを更新
    if (mesh && mesh.morphTargetInfluences && timeSinceLastBlink > blinkInterval) {

        mesh.morphTargetInfluences[0] += delta * blinkSpeed * direction;

        if (mesh.morphTargetInfluences[0] >= 1) {
            direction = -1;  // 瞬き終了
        }

        if (mesh.morphTargetInfluences[0] <= 0) {
            direction = 1;  // 瞬き開始
            timeSinceLastBlink = 0;  // タイマーをリセット
        }
    }

    /// mouth animation
    if (mesh && mesh.morphTargetInfluences) {

        // mouthEnabled が true の場合は通常のアニメーションを実行
        if (mouthEnabled) {
            mesh.morphTargetInfluences[8] += delta * mouthSpeed * mouthDirection;

            if (mesh.morphTargetInfluences[8] >= 1) {
                mouthDirection = -1;
            }

            if (mesh.morphTargetInfluences[8] <= 0) {
                mouthDirection = 1;
            }
        }
        // mouthEnabled が false の場合は口を閉じる
        else {
            if (mesh.morphTargetInfluences[8] > 0) {
                mesh.morphTargetInfluences[8] -= delta * mouthSpeed;
                if (mesh.morphTargetInfluences[8] < 0) {
                    mesh.morphTargetInfluences[8] = 0;
                }
            }
        }
    }

    renderer.render(scene, camera);
}
animate();


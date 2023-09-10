const OPENAI_APIKEY = window._ENV.OPENAI_APIKEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const VOICEVOX_API_URL = "http://localhost:50021";
const VOICEVOX_SPEAKER_ID = 8;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

    if (request.type === "sendTextToAPI") {
        const userPrompt = request.text;


        console.log("Get userPrompt: " + userPrompt);
        // callGPT(userPrompt)
        //     .then(responseText => callVoicevox(responseText))
        //     .then(audio => {

        //         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //             chrome.tabs.sendMessage(tabs[0].id, { type: "responseSendTextToAPI", audio: audio });
        //         }

        //         );
        //     })
        //     .catch(e => {
        //         console.error('Error occurred:', e);
        //         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //             chrome.tabs.sendMessage(tabs[0].id, { type: "responseSendTextToAPI", error: e.message });
        //         });

        //     });

        callVoicevox(userPrompt)
            .then(audio => {

                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "responseSendTextToAPI", audio: audio });
                }

                );
            })
            .catch(e => {
                console.error('Error occurred:', e);
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "responseSendTextToAPI", error: e.message });
                });

            });

    };
});

const systemPrompt = "私は3Dモデルのアバターのアシスタントです。名前は春日部ツムギです。スカイランドベンチャーズというベンチャーキャピタルのホームページの案内役をやっています。" +
    "私はこのホームページのことのみ答えます。それ以外の一般的な話題には回答しません。回答が長くなりそうなものは要約します。それ以上の情報を知りたい場合は、さらに質問してください。以下、スカイランドベンチャーズのホームページの情報です。" +
    "スカイランドベンチャーズでは、これまで120社を超えるシードスタートアップへ投資を行っており、投資先企業は以下の通りです。()内はその会社の領域。Web3分野:Pictoria (AI Vtuber),Kekkai(Wallet Security Plugin), NFTGO(Tool for NFT),Taiko(type1 zkEVM L2),Wallchain(Web3 Cashback powered by MEV),desoul(Solution powered by SBT),Wall of Death(Listen and Earn Music Player),fondi(Metaverse for learning English),Zenesis(VR × NFT art),Yae Labs(Web 3 × Metaverse),Reality Coin(3D metaverse map),Cool Connect(NFT art)Murasaki(NFT & GameFi),Alyawmu(NFT Consulting),AZITO(Web3 Metaverse on Ethereum),nanameue(Community App),Sentrei.inc(Web3 reputation protocol),他の分野:Adavito(Collection EC),Aica(Online Lesson),Aidemy(AI Solution),alife(Website Builder),ANYCOLOR(Virtual Liver Management),AppBrew(Community App),Arii(Game Media),Astool(Media App),At Game(Community App),Audiostock(Music EC),Babel(Video MCN),Behavior(Online Workspace),Branding Engineer(HR TECH),Capex(AI Interactive Technology),Carat(HR TECH),Ceremony(Media),Chief(Web Meeting Tool),Cluster(Virtual SNS),COSPA Technologies(Consulting)," +
    "CRAFTA(Digital Media),DATA VIZ LAB(Data Analytics Consulting),DOKI DOKI(Voice SNS),Enowa(AGRITECH),FNAP(FANTECH),First Automation(Robot Industry SaaS),Four Hundred Franc(Financial Web Service),GITAI(Space Robot),hachidori(Chatbot SaaS),Hachimenroppi(Fresh Foods EC),Holotch(Hologram Live),HOLO-X(Customer Service),Jiraffe(CtoC Marketplace),J-Tama's(HR TECH),Kaimaku(Media),Kakekomu(Marketplace),Kaumo(Media EC),Kindler(Cosme App),MEDIX(Video Production),METRICA(AI Medical Platform),LEAN BODY(Fitness Subscription),Liaro(AI solution),LUCO(Vtuber Platform),M&A Cloud(M&A platform),Mental Health Technologies(Mental Health Service),modecas(Service EC),Nain(Earphone Development),one visa(VISA Application SaaS),Option(Virtual Workspace),PATRA(Apparel EC),Popshoot(Bitcoin App),PortFolder(Portfolio SNS),Posiwill(Career Coaching),Potlach(Professional Community),Potluck(Lunch Subscription),PoliPoli(Politics DX),Prema(Marketplace),ProReach(HR TECH),ROXX(Reference Check SaaS),Shelfy(Construction SaaS),staiding ovation(Fashion & Technology),Strainer(Digital Media),Strobo(Home TECH),taliki(Social Issues Incubation),Tech Connect(VR Space),TranSe(Video School),Travel Book(Digital Media),Translimit(Gaming),Tripi(Travel Media),UNIVRS(VR Gaming),VAZ(Youtuber Management),AGELESS(Job matching for elderly people),Knowhere(Sports DX)" +
    "**スカイランドベンチャーズ株式会社** (Skyland Ventures) は“The Seed Maker. & Unlearning.”をミッションに掲げ[[1]](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%A9%E3%83%B3%E3%83%89%E3%83%99%E3%83%B3%E3%83%81%E3%83%A3%E3%83%BC%E3%82%BA#cite_note-1)、学生起業から25歳前後まで中心とした若手起業家を対象に投資を行うシード[ベンチャーキャピタル](https://ja.wikipedia.org/wiki/%E3%83%99%E3%83%B3%E3%83%81%E3%83%A3%E3%83%BC%E3%82%AD%E3%83%A3%E3%83%94%E3%82%BF%E3%83%AB)ファンド[[2]](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%A9%E3%83%B3%E3%83%89%E3%83%99%E3%83%B3%E3%83%81%E3%83%A3%E3%83%BC%E3%82%BA#cite_note-2)。## 沿革[[編集](https://ja.wikipedia.org/w/index.php?title=%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%A9%E3%83%B3%E3%83%89%E3%83%99%E3%83%B3%E3%83%81%E3%83%A3%E3%83%BC%E3%82%BA&action=edit&section=1)]- 2012年8月　スカイランドベンチャーズを現代表の木下慶彦が設立[[3]](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%A9%E3%83%B3%E3%83%89%E3%83%99%E3%83%B3%E3%83%81%E3%83%A3%E3%83%BC%E3%82%BA#cite_note-%E5%90%8D%E5%89%8D%E3%81%AA%E3%81%97-3)- 2013年12月　1号ファンドである「Skyland Ventures 1号投資事業有限責任組合」が5億円の調達を完了する[[3]](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%A9%E3%83%B3%E3%83%89%E3%83%99%E3%83%B3%E3%83%81%E3%83%A3%E3%83%BC%E3%82%BA#cite_note-%E5%90%8D%E5%89%8D%E3%81%AA%E3%81%97-3)- 2015年12月 9億円規模の2号ファンド「Skyland Ventures2号投資事業有限責任組合」を設立" +
    "[[4]](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%A9%E3%83%B3%E3%83%89%E3%83%99%E3%83%B3%E3%83%81%E3%83%A3%E3%83%BC%E3%82%BA#cite_note-4)- 2018年3月　9.5億円規模の3号ファンド「Skyland Ventures3号投資事業有限責任組合」を設立[[5]](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%A9%E3%83%B3%E3%83%89%E3%83%99%E3%83%B3%E3%83%81%E3%83%A3%E3%83%BC%E3%82%BA#cite_note-5)- 2022年4月 50億円規模のWeb3特化型ファンド「Skyland Ventures4号投資事業有限責任組合」を設立"

async function callGPT(userPrompt) {
    const TIMEOUT = 100000; // 例：100秒

    // タイムアウト用のPromiseを生成
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), TIMEOUT);
    });

    try {
        const requestOptions = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + OPENAI_APIKEY
            },
            "body": JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }]
            })
        }
        // Call api
        const response = await Promise.race([
            fetch(OPENAI_API_URL, requestOptions),
            timeoutPromise
        ]);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        // disclosing text for response i got.
        const json = await response.json();
        const responseText = json.choices[0].message.content.trim();
        return responseText;
    } catch (e) {
        console.error('Error occurred:', e);
        throw e;
    }
}

async function callVoicevox(text) {
    const TIMEOUT = 100000; // 例：10秒

    // タイムアウト用のPromiseを生成
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), TIMEOUT);
    });


    try {
        const queryJson = await createQuery(text);
        const blob = await createVoice(queryJson);
        // BlobをDataURLに変換する
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = function () {
                resolve(reader.result);
            }
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }


    async function createQuery(text) {
        try {
            const requestOptions = {
                "method": "POST",
                "headers": {
                    "Content-Type": 'application/json'
                },

            }
            console.log(text);
            // Call api
            const response = await Promise.race([
                fetch(VOICEVOX_API_URL + "/audio_query?" + `speaker=${VOICEVOX_SPEAKER_ID}&text=${encodeURIComponent(text)}`, requestOptions),
                timeoutPromise
            ]);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }

            // disclosing text for response i got.
            const queryJson = await response.json();
            if (queryJson.accent_phrases == null) throw new Error("accent_phrases is null");
            console.log(queryJson);
            return queryJson;
        } catch (e) {
            console.error('Error occurred:', e);
            throw e;
        }



    }

    async function createVoice(queryJson) {
        try {
            const requestOptions = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify({
                    ...queryJson
                })
            }
            // Call api
            const response = await Promise.race([
                fetch(VOICEVOX_API_URL + "/synthesis?" + `speaker=${VOICEVOX_SPEAKER_ID}`, requestOptions),
                timeoutPromise
            ]);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }

            // disclosing text for response i got.
            const blob = await response.blob();

            if (blob == null || blob.type !== "audio/wav") {
                console.error('Error occurred: blob is null or blob type is not audio/wav');
                throw new Error("blob is null or blob type is not audio/wav");
            }
            console.log(blob);

            return blob;
        } catch (e) {
            console.error('Error occurred:', e);
            throw e;
        }
    }

}
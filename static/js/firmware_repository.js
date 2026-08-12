const SERVER = "https://fota-demo-v2-0.onrender.com";

async function loadLatestFirmware(){

    try{

        const response = await fetch(
            SERVER + "/latest_firmware"
        );

        if(!response.ok){
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        console.log("Latest:", data);

        const div = document.getElementById("latestFirmwareList");

        div.innerHTML = "";

        ["SGW","BCM"].forEach(ecu=>{

            const info = data[ecu] || {};

            div.innerHTML += `
                <div class="latestItem">
                        
                    <h3>${ecu}</h3>
                        
                    <p><b>Version</b> : ${info.version || "--"}</p>
                        
                    <p><b>File</b> : ${info.file || "--"}</p>
                        
                    <p><b>Uploaded</b> : ${info.uploaded_at || "--"}</p>
                        
                    ${
                        info.download_url
                        ? `<a href="#"
                             onclick="downloadFirmware('${info.path}')">
                             Download Firmware
                           </a>`
                        : `<span style="color:#94a3b8">
                             No firmware uploaded
                           </span>`
                    }
                
                </div>
                `;

        });

    }catch(e){

        console.error(e);

        document.getElementById("latestFirmwareList").innerHTML =
            "<p style='color:red'>Unable to load latest firmware.</p>";

    }

}

async function uploadFirmware(){

    const ecu = document.getElementById("ecu").value;
    const version = document.getElementById("version").value.trim();
    const file = document.getElementById("firmwareFile").files[0];

    if(!version || !file){
        alert("Fill all fields");
        return;
    }

    const formData = new FormData();

    formData.append("ecu", ecu);
    formData.append("version", version);
    formData.append("file", file);

    try{

        const response = await fetch(

            SERVER +
            "/upload_firmware?ecu=" +
            encodeURIComponent(ecu) +
            "&version=" +
            encodeURIComponent(version),

            {
                method:"POST",
                body:formData
            }

        );

        const result = await response.json();

        console.log(result);

        if(result.status === "success"){

            alert("Firmware uploaded successfully.");

            loadLatestFirmware();
            loadHistory();

        }else{

            alert(result.message || JSON.stringify(result));

        }

    }catch(err){

        console.error(err);
        alert("Upload failed.");

    }

}

function downloadFirmware(path){

    window.open(
        SERVER +
        "/download_firmware?path=" +
        encodeURIComponent(path),
        "_blank"
    );

}

async function loadHistory(){

    const response =
        await fetch(
            SERVER +
            "/firmware_history"
        );

    const list =
        await response.json();

    const sgw =
        document.getElementById(
            "sgwFirmwareList"
        );

    const bcm =
        document.getElementById(
            "bcmFirmwareList"
        );

    sgw.innerHTML = "";
    bcm.innerHTML = "";

    list.forEach(item=>{

        const html = `

        <div class="historyItem">

            <div class="historyLeft">

                <b>${item.file}</b>

                <span>

                    Version :
                    ${item.version}

                </span>

            </div>

            <div class="historyRight">

                <button
                    class="downloadBtn"
                    onclick="downloadFirmware('${item.path}')">

                    Download

                </button>

            </div>

        </div>

        `;

        if(item.ecu === "SGW"){

            sgw.innerHTML += html;

        }else{

            bcm.innerHTML += html;

        }

    });

}

function refreshHistory(){

    loadLatestFirmware();

    loadHistory();

}

refreshHistory();

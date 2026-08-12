const SERVER = "https://fota-demo-v2-0.onrender.com";

async function uploadFirmware(file, ecu, version) {

    const formattedVersion = Number(version).toFixed(1);

    const extension = file.name.split(".").pop();

    const renamedFile = new File(
        [file],
        `${ecu}_v${formattedVersion}.${extension}`,
        {
            type: file.type
        }
    );

    const formData = new FormData();

    formData.append(
        "file",
        renamedFile
    );

    const response = await fetch(
        SERVER + "/upload",
        {
            method: "POST",
            body: formData
        }
    );

    return await response.json();
}

async function createCampaign() {

    const campaignId =
        document.getElementById(
            "campaignId"
        ).value.trim();

    const vin =
        document.getElementById(
            "vin"
        ).value.trim();

    const campaignName =
        document.getElementById(
            "campaignName"
        ).value.trim();

    const enableSGW =
        document.getElementById(
            "enableSGW"
        ).checked;

    const enableBCM =
        document.getElementById(
            "enableBCM"
        ).checked;

   let sgwVersion =
    document.getElementById(
        "sgwVersion"
    ).value.trim();

    let bcmVersion =
        document.getElementById(
            "bcmVersion"
        ).value.trim();
    
    if (sgwVersion && !sgwVersion.includes(".")) {
    sgwVersion = Number(sgwVersion).toFixed(1);
    }
    
    if (bcmVersion && !bcmVersion.includes(".")) {
        bcmVersion = Number(bcmVersion).toFixed(1);
    }

    const sgwFile =
        document.getElementById(
            "sgwFirmware"
        ).files[0];

    const bcmFile =
        document.getElementById(
            "bcmFirmware"
        ).files[0];

    if (!campaignId) {

        alert("Enter Campaign ID");

        return;
    }

    if (!vin) {

        alert("Enter VIN");

        return;
    }

    if (!campaignName) {

        alert("Enter Campaign Name");

        return;
    }

    if (!enableSGW && !enableBCM) {

        alert("Select at least one ECU");

        return;
    }

    if (enableSGW) {

        if (!sgwVersion) {

            alert("Enter SGW Target Version");

            return;
        }

        if (!sgwFile) {

            alert("Select SGW Firmware");

            return;
        }
    }

    if (enableBCM) {

        if (!bcmVersion) {

            alert("Enter BCM Target Version");

            return;
        }

        if (!bcmFile) {

            alert("Select BCM Firmware");

            return;
        }
    }

    let sgwFirmware = "";
    let bcmFirmware = "";

    try {

        if (enableSGW) {

            const upload =
                await uploadFirmware(
                    sgwFile,
                    "SGW",
                    sgwVersion
                );

            if (upload.status !== "success") {

                alert("Failed to upload SGW firmware");

                return;
            }

            sgwFirmware = upload.file;
        }

        if (enableBCM) {

            const upload =
                await uploadFirmware(
                    bcmFile,
                    "BCM",
                    bcmVersion
                );

            if (upload.status !== "success") {

                alert("Failed to upload BCM firmware");

                return;
            }

            bcmFirmware = upload.file;
        }

        const params =
            new URLSearchParams();

        params.append(
            "campaign_id",
            campaignId
        );

        params.append(
            "vin",
            vin
        );

        params.append(
            "campaign_name",
            campaignName
        );

        params.append(
            "sgw_target_version",
            enableSGW ? sgwVersion : ""
        );

        params.append(
            "bcm_target_version",
            enableBCM ? bcmVersion : ""
        );

        params.append(
            "sgw_firmware",
            sgwFirmware
        );

        params.append(
            "bcm_firmware",
            bcmFirmware
        );

        const response =
            await fetch(
                SERVER +
                "/campaign?" +
                params.toString(),
                {
                    method: "POST"
                }
            );

        const result =
            await response.json();

        if (
            result.status === "sent"
        ) {

            alert(
                "Campaign Created Successfully"
            );

            window.location =
                "CampaignHistory.html";
        }
        else {

            alert(
                result.message ||
                result.status
            );
        }

    }
    catch (e) {

        alert(
            "Error : " + e
        );

        console.error(e);
    }
}

function autoGenerateCampaignFields() {

    const vin =
        document.getElementById("vin").value;

    if (!vin)
        return;

    const now = new Date();

    const date =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const time =
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0");

    document.getElementById("campaignId").value =
        `CMP_${vin}_${date}_${time}`;

    document.getElementById("campaignName").value =
        `${vin} - Firmware Update`;
}

async function loadCurrentVersions() {

    const vin = document.getElementById("vin").value;

    if (!vin) {

        document.getElementById("currentSGW").innerText = "--";
        document.getElementById("currentBCM").innerText = "--";
        return;
    }

    autoGenerateCampaignFields()

    const response = await fetch(
        SERVER + "/registered_tbm/" + vin
    );

    const tbm = await response.json();

    document.getElementById("currentSGW").innerText =
    tbm.sgw_version;

    document.getElementById("currentBCM").innerText =
        tbm.bcm_version;

    // Auto-fill next target versions

    document.getElementById("sgwVersion").value =
        nextVersion(tbm.sgw_version);

    document.getElementById("bcmVersion").value =
        nextVersion(tbm.bcm_version);
    }

async function loadVINs() {

    const response = await fetch(SERVER + "/tbms");
    const data = await response.json();

    const select = document.getElementById("vin");

    select.innerHTML =
        '<option value="">Select Connected VIN</option>';

    data.online_tbms.forEach(vin => {

        const option = document.createElement("option");

        option.value = vin;
        option.textContent = vin;

        select.appendChild(option);

    });
}

function nextVersion(version) {

    if (!version || version === "--")
        return "";

    const value = parseFloat(version);

    if (isNaN(value))
        return "";

    return (value + 1.0).toFixed(1);

}

window.onload = () => {
    loadVINs();
};

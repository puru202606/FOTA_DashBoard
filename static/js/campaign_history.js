const SERVER = "https://fota-demo-v2-0.onrender.com";

async function loadCampaigns() {

    try {

        const response =
            await fetch(
                SERVER + "/campaigns",
                {
                    cache: "no-store"
                }
            );

        const campaigns =
            await response.json();

        const campaignList =
            document.getElementById(
                "campaignList"
            );
        
        campaignList.innerHTML = "";

        const search =
            document.getElementById(
                "searchCampaign"
            ).value
            .toLowerCase();
            const filteredCampaigns = campaigns.filter(c => {

                return !search ||

                    c.campaign_id.toLowerCase().includes(search) ||

                    c.vin.toLowerCase().includes(search);

            });

            document.getElementById("campaignCount").innerText =
                filteredCampaigns.length;

            document.getElementById("runningCount").innerText =
                filteredCampaigns.filter(c => c.status !== "completed").length;

            document.getElementById("completedCount").innerText =
                filteredCampaigns.filter(c => c.status === "completed").length;

        filteredCampaigns.reverse().forEach(c => {

            let sgw = "-";
            let bcm = "-";

            if (
                c.target_ecu == "SGW"
            ) {

                sgw =
                    c.sgw_target_version;

            }
            else if (
                c.target_ecu == "BCM"
            ) {

                bcm =
                    c.bcm_target_version;

            }
            else {

                sgw =
                    c.sgw_target_version;

                bcm =
                    c.bcm_target_version;
            }

            campaignList.innerHTML += `

                <div class="campaignCard">

                    <div class="campaignHeader">

                        <span class="statusBadge status-${c.status.toLowerCase()}">

                            ${c.status}

                        </span>

                        <button
                            class="deleteBtn"
                            onclick="deleteCampaign('${c.campaign_id}')">

                            Delete

                        </button>

                    </div>

                    <div class="campaignBody">

                        <div class="campaignInfo">

                            <h3>${c.campaign_name}</h3>

                            <p>
                                <b>Campaign ID</b><br>
                                ${c.campaign_id}
                            </p>

                            <p>
                                <b>VIN</b><br>
                                ${c.vin}
                            </p>

                        </div>

                        <div class="campaignVersions">

                            <p>
                                <b>Target ECU</b><br>
                                ${c.target_ecu}
                            </p>

                            <p>
                                <b>SGW Version</b><br>
                                ${sgw}
                            </p>

                            <p>
                                <b>BCM Version</b><br>
                                ${bcm}
                            </p>

                        </div>

                        <div class="campaignStatus">

                            <p>
                                Deployment Progress
                            </p>

                            <div class="progressBar">

                                <div class="progressFill ${c.status.toLowerCase()}">

                                </div>

                            </div>

                            <span>

                                ${
                                    c.status === "completed"
                                    ? "100%"
                                    : c.status === "running"
                                    ? "60%"
                                    : c.status === "downloading"
                                    ? "35%"
                                    : "0%"
                                }
                            
                            </span>
                            
                        </div>
                            
                    </div>
                            
                </div>
                            
                `;

        });

    }
    catch (e) {

        console.error(e);

        alert(
            "Unable to load campaigns."
        );

    }

}

async function deleteCampaign(id) {

    if (
        !confirm(
            "Delete Campaign " +
            id +
            " ?"
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(

                SERVER +
                "/campaign/" +
                id,

                {
                    method: "DELETE"
                }

            );

        const result =
            await response.json();

        if (
            result.status ==
            "deleted"
        ) {

            loadCampaigns();

        }
        else {

            alert(
                "Delete failed"
            );

        }

    }
    catch (e) {

        alert(e);

    }

}

document
.getElementById(
    "searchCampaign"
)
.addEventListener(

    "input",

    loadCampaigns

);

loadCampaigns();

setInterval(

    loadCampaigns,

    3000

);

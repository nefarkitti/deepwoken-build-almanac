
let data = [
    
]

const buildTable = document.getElementById("buildTable")
const popup = document.getElementById("reset-popup")
const error = document.getElementById("errorText")

const buildName = document.getElementById("buildName")
const buildLink = document.getElementById("buildLink")
const modebtn = document.getElementById("modebtn")

function loadBuild(id) {

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `https://api.deepwoken.co/build?id=${id}`); //MNYlcSP8
    xhr.send();
    xhr.responseType = "json";
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const res = xhr.response;
            console.log(res);
            return res
        } else {
            console.log(`Error: ${xhr.status}`);
            return "ERROR"
        }
    }
}

let mode = "normal"
modebtn.innerHTML = `delete mode`

function modeChange() {
    if (mode == "normal") {
        mode = "delete"
        modebtn.innerHTML = `add mode`
        document.getElementById("addBuild").style.display = `none`
    } else {
        modebtn.innerHTML = `delete mode`
        mode = "normal"
        document.getElementById("addBuild").style.display = ``
    }
}

function handleBuildClick(id) {
    if (mode == "normal") {
        window.open("https://deepwoken.co/builder?id=${build.url}", '_blank')
    } else {
        //delete build
        let buildElement = document.getElementById(`build-${id}`)
        let foundSame = false
        let foundBuild
        data.forEach(build => {
            if (build.url == id) {
                foundBuild = build
                foundSame = true
                data.splice(data.indexOf(foundBuild), 1)
                buildElement.remove()
                save()
                loadBuilds()
                return
            }
        })

    }
}

function loadBuilds() {
    buildTable.innerHTML = `<div class="loading"><img src="loading.png"></div>`

    let index = 0

    if (data.length <= 0) {
        console.log("no builds to load!")
        buildTable.innerHTML = `<span onclick="showBuildPopup()" class="addBuild"><i class="fa-solid fa-plus"></i> Add new build</span>`
        return 0
    }
    data.forEach(build => {

        const xhr = new XMLHttpRequest();
        xhr.open("GET", `https://api.deepwoken.co/build?id=${build.url}`); //MNYlcSP8
        xhr.send();
        xhr.responseType = "json";
        xhr.onload = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {

                if (index == 0) {
                    buildTable.innerHTML = ``
                }

                const buildData = xhr.response;
                console.log(buildData);

                const div = document.createElement("div")
                div.id = `build-${build.url}`
                div.classList.add("build")

                // i love webjs!
                div.setAttribute("onclick", `handleBuildClick("${build.url}")`)
                div.title = buildData.content.stats.buildName
        
                const span = document.createElement("span")
                span.classList.add("build-name")
                if (buildData.content.preShrine) {
                    console.log("hi")
                    let soo = document.createElement("b")
                    soo.style.overflow = `clip`
                    soo.innerHTML = `<i class='fa-solid fa-torii-gate'></i> `
                    span.appendChild(soo)
                }
                const bname = document.createElement("b")
                bname.innerText = build.name
                bname.style.marginLeft = `2px`
                span.appendChild(bname)

                div.appendChild(span)

                let tags = document.createElement("div")
                tags.classList.add("tags")
                
                let storeStat = ["Strength", "Fortitude", "Agility", "Intelligence", "Willpower", "Charisma"]
                let shorthand = ["STR", "FTD", "AGL", "INT", "WLL", "CHR"]
                let store = ["Thundercall", "Frostdraw", "Flamecharm", "Ironsing", "Shadowcast", "Galebreathe"]
                let stats = []
                let attunements = []

                store.forEach(attunement => {
                    if (buildData.content.attributes.attunement[attunement] >= 1){
                        attunements.push(attunement)
                    }
                })
                let STATKEYS = Object.keys(buildData.content.attributes.base)
                let STATVALUES = Object.values(buildData.content.attributes.base)
                for (let i = 0; i < storeStat.length; i++) {
                    let key = STATKEYS[i]
                    let val = STATVALUES[i]
                    stats.push({
                        "name": key,
                        "value": val
                    })
                }

                if (attunements.length <= 0) {
                    tags.innerHTML += `<img src="attunements/no-attunement.png">`
                } else {
                    attunements.forEach(attune => {
                        tags.innerHTML += `<img src="attunements/${attune.toLowerCase()}.png">`
                    })
                }
                
                stats.forEach(stat => {
                    if (stat.value >= 75) {
                        let short = shorthand[storeStat.indexOf(stat.name)]
                        tags.innerHTML += `<span class="${stat.name.toLowerCase()}">${short}</span>`
                        console.log(stat.name)
                    }
                })

                let legendaryTalents = [
                    "Neural Overload",
                    "Conditioned Runner",
                    "Collapsed Lung",
                    "Reinforced Armor",
                    "Ghost",
                    "Dazing Finisher",
                    "Ether Overdrive [FLM]",
                    "Ether Overdrive [ICE]",
                    "Ether Overdrive [LTN]",
                    "Ether Overdrive [SDW]",
                    "Ether Overdrive [WND]",
                    "Brick Wall",
                    "Not A Scratch",
                    "Unyielding Frost",
                    "Phoenix Flames",
                    "The Floor Is Lava",
                    "Volcanic Glass",
                    "Million Ton Piercer",
                    "A World Without Song",
                    "Possession",
                    "Shared Demise",
                    "Another Man's Trash",
                    "Audacity",
                    "Command: Live"
                ]
                console.log("TALENTS")
                console.log(buildData.content.talents)
                buildData.content.talents.forEach(talent => {
                    if (legendaryTalents.includes(talent)) {
                        tags.innerHTML += `<span class="talent">${talent}</span>`
                    }
                })

                div.appendChild(tags)

                let extra = document.createElement("span")
                extra.classList.add("extra")
                extra.innerHTML = `${buildData.content.stats.meta.Race} ${buildData.content.stats.meta.Oath}`
        
                div.appendChild(extra)

                let extra2 = document.createElement("span")
                extra2.classList.add("extra")

                if (buildData.content.stats.buildAuthor.length >= 1) {
                    extra2.innerText = `by ${buildData.content.stats.buildAuthor}`
                } else {
                    extra2.innerText = `by Nobody!`
                }

                div.appendChild(extra2)

                buildTable.appendChild(div)
                index ++
/*
                setTimeout(() => {
                    document.getElementById(`build-${build.url}`).onclick = function() {
                        console.log("hisds")
                        window.open(`https://deepwoken.co/builder?id=${build.url}`, '_blank')
                    }
                }, 100 * index)*/


                if (index == data.length) {
                    buildTable.innerHTML += `
                    <span onclick="showBuildPopup()" class="addBuild" id="addBuild"><i class="fa-solid fa-plus"></i> Add new build</span>
                    `
                }

            } else {
                console.log(`Error: ${xhr.status}`);
                return "ERROR"
            }
        }

    })

}

function addBuild() {

    const name = buildName.value
    const link = buildLink.value

    if (name.length < 3) return;

    let url = new URL(link)
    if (url.hostname != "deepwoken.co") return;

    console.log(`adding build ${url.searchParams.get("id")}`)

    let id = url.searchParams.get("id")

    let foundSame = false
    data.forEach(build => {
        if (build.url == id) {
            foundSame = true
            return
        }
    })

    if (foundSame == true) return;

    data.push({
        "name": name,
        "url": id
    })

    closePopup()
    save()

    loadBuilds()
}

const funnies = ["Top Chime Silentheart Deto Petra's", "Best PvE", "Godseeker Shadow Crypt", "Blindseer LFT", "Railblade Edenkite Silentheart", "Markor’s Inheritor Blademaster", "Dawnwalker Gale", "El Primo Legion Kata", "Evanspear Chilling", "Frostdraw Stilleto"]
function showBuildPopup() {
    buildLink.value = ""
    buildName.value = ""
    buildName.placeholder = funnies[Math.ceil(Math.random() * funnies.length-1)]
    popup.style.display = `flex`
}
function closePopup() {
    popup.style.display = `none`
}

function load() {
    const getSave = localStorage.getItem("builds");
    try {
        if (getSave != null) {
            data = JSON.parse(getSave)
        }

        // load pages based on provided data
        loadBuilds()

    } catch {
        console.log("data didn't load properly, throw error and show error overlay.")
    }
}
function save() {
    data = data
    localStorage.setItem("builds", JSON.stringify(data))
}

//save()
load()
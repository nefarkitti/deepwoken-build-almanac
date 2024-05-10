
let data = [
]
let pinned = [
]

const buildTable = document.getElementById("buildTable")
const popup = document.getElementById("reset-popup")
const error = document.getElementById("errorText")
const statistics = document.getElementById("statistics")

const buildName = document.getElementById("buildName")
const buildLink = document.getElementById("buildLink")

buildTable.innerHTML = `<div class="loading"><img src="loading.png"></div>`

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
let modes = ["delete"/*, "pin"*/]

function applyMode(m) {

    const add = document.getElementById("addBuild")
    modes.forEach(item => {
        console.log(item)
        document.getElementById(`${item}btn`).style.backgroundColor = `#40504C`
    })

    if (m == "normal") {
        document.querySelectorAll(".build").forEach(build => {
            build.style.background = `none`
        })
        add.style.display = ``
    } else {
        const btn = document.getElementById(`${mode}btn`)
        btn.style.backgroundColor = `#2C3835`
        if (m == "delete") {
            document.querySelectorAll(".build").forEach(build => {
                build.style.background = `rgba(255, 127, 127, 0.4)`
            })
            add.style.display = `none`
        } else if (m == "pin") {
            document.querySelectorAll(".build").forEach(build => {
                build.style.background = `rgba(127, 255, 255, 0.4)`
            })
            add.style.display = `none`
        }
    }

}

function modeHandle(m) {

    if (data.length <= 0) return

    if (mode == "normal") {
        mode = m
        console.log(`CURRENT MODE: ${mode}`)
        applyMode(mode)
        return
    }
    if (mode == m) {
        mode = "normal"
        console.log(`CURRENT MODE: ${mode}`)
        applyMode(mode)
        return
    }
    if (mode != m) {
        mode = m
        console.log(`CURRENT MODE: ${mode}`)
        applyMode(mode)
        return
    }

}

document.querySelectorAll(".upperbtn").forEach(btn => {

    btn.setAttribute("onclick", `modeHandle("${btn.dataset.mode}")`)

})

function handleBuildClick(id) {
    if (mode == "normal") {
        window.open(`https://deepwoken.co/builder?id=${id}`, '_blank')
    } else {
        if (mode == "delete") {
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
        } else if (mode == "pin") {
            // pin build
            let buildElement = document.getElementById(`build-${id}`)
            let foundSame = false
            let foundBuild
            data.forEach(build => {
                if (build.url == id) {
                    foundBuild = build
                    foundSame = true
                    pinned.push(foundBuild)
                    data.splice(data.indexOf(foundBuild), 1)
                    buildElement.remove()
                    save()
                    loadBuilds()
                    return
                }
            })
        }

    }
}

let storeStat = ["Strength", "Fortitude", "Agility", "Intelligence", "Willpower", "Charisma"]
let shorthand = ["STR", "FTD", "AGL", "INT", "WLL", "CHR"]
let store = ["Thundercall", "Frostdraw", "Flamecharm", "Ironsing", "Shadowcast", "Galebreathe"]
let elmShorthand = ["LTN", "ICE", "FLM", "IRN", "SDW", "WND"]
let storeWPN = ["Heavy Wep.", "Medium Wep.", "Light Wep."]
let wpnShorthand = ["HVY", "MED", "LHT"]
let oaths = ["Arcwarder", "Blindseer", "Contractor", "Dawnwalker", "Fadetrimmer", "Jetstriker", "Linkstrider", "Oathless", "Saltchemist", "Silentheart", "Starkindred", "Visionshaper"]

function loadBuilds() {
    buildTable.innerHTML = `<div class="loading"><img src="loading.png"></div>`
    statistics.innerHTML = ``

    let index = 0

    modes.forEach(item => {
        console.log(item)
        document.getElementById(`${item}btn`).style.backgroundColor = `#40504C`
    })

    if (data.length <= 0) {
        console.log("no builds to load!")
        buildTable.innerHTML = `<span onclick="showBuildPopup()" class="addBuild" id="addBuild"><i class="fa-solid fa-plus"></i> Add new build</span>`
        mode = "normal"
        modeHandle("normal")
        return 0
    }

    let storeAvgStats = {
        "Heavy Wep.": 0,
        "Medium Wep.": 0,
        "Light Wep.": 0,

        "Strength": 0,
        "Fortitude": 0,
        "Agility": 0,
        "Intelligence": 0,
        "Willpower": 0,
        "Charisma": 0,

        "Flamecharm": 0,
        "Frostdraw": 0,
        "Thundercall": 0,
        "Galebreathe": 0,
        "Shadowcast": 0,
        "Ironsing": 0,

        "Arcwarder": 0,
        "Blindseer": 0,
        "Contractor": 0,
        "Dawnwalker": 0,
        "Fadetrimmer": 0,
        "Jetstriker": 0,
        "Linkstrider": 0,
        "Oathless": 0,
        "Saltchemist": 0,
        "Silentheart": 0,
        "Starkindred": 0,
        "Visionshaper": 0
    }

    function createBuild(build) {

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
                console.log(build.name.toUpperCase())
                console.log(buildData);

                storeAvgStats[buildData.content.stats.meta.Oath] += 1

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

                let stats = []
                let attunements = []
                let weapons = []

                store.forEach(attunement => {

                    storeAvgStats[attunement] += buildData.content.attributes.attunement[attunement]

                    if (buildData.content.attributes.attunement[attunement] >= 1) {
                        attunements.push(attunement)
                    }
                })
                storeWPN.forEach(weapon => {

                    storeAvgStats[weapon] += buildData.content.attributes.weapon[weapon]

                    if (buildData.content.attributes.weapon[weapon] >= 1) {
                        weapons.push(weapon)
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

                if (attunements.length >= 0) {
                    tags.innerHTML += `<img src="attunements/no-attunement.png">`
                } else {
                    attunements.forEach(attune => {
                        tags.innerHTML += `<img src="attunements/${attune.toLowerCase()}.png">`
                    })
                }

                if (weapons.length >= 1) {
                    weapons.forEach(weapon => {
                        tags.innerHTML += `<span class="weapon">${wpnShorthand[storeWPN.indexOf(weapon)]}</span>`
                    })
                }

                stats.forEach(stat => {

                    storeAvgStats[stat.name] += stat.value

                    //why doesnt this work??
                    //storeAvgStats[stat.name] = storeAvgStats[stat.name] + stat.value
                    if (stat.value >= 75) {
                        let short = shorthand[storeStat.indexOf(stat.name)]
                        tags.innerHTML += `<span class="${stat.name.toLowerCase()}">${short}</span>`
                        console.log(stat.name)
                    }

                })

                statistics.innerHTML = ``
                for (let i = 0; i < storeWPN.length; i++) {
                    const sp = document.createElement("span")
                    sp.classList.add("statline")

                    sp.innerHTML += `<span>avg. ${storeWPN[i].toUpperCase()}:</span><span>${Math.ceil(storeAvgStats[storeWPN[i]] / data.length)}</span>`

                    statistics.appendChild(sp)
                }
                statistics.innerHTML += `<hr>`
                for (let i = 0; i < storeStat.length; i++) {
                    const sp = document.createElement("span")
                    sp.classList.add("statline")

                    sp.innerHTML += `<span>avg. ${storeStat[i].toUpperCase()}:</span><span>${Math.ceil(storeAvgStats[storeStat[i]] / data.length)}</span>`

                    statistics.appendChild(sp)
                }
                statistics.innerHTML += `<hr>`
                for (let i = 0; i < store.length; i++) {
                    const sp = document.createElement("span")
                    sp.classList.add("statline")

                    sp.innerHTML += `<span>avg. ${store[i].toUpperCase()}:</span><span>${Math.ceil(storeAvgStats[store[i]] / data.length)}</span>`

                    statistics.appendChild(sp)
                }
                statistics.innerHTML += `<hr>`
                let mostUsedOath = ""
                let last = 0
                for (let i = 0; i < oaths.length; i++) {
                    let oath = oaths[i];
                    if (storeAvgStats[oath] >= last) {
                        mostUsedOath = oath
                        last = storeAvgStats[oath]
                    }
                }
                statistics.innerHTML += `
                <span class="statline">
                <span>Main Oath:</span><span>${mostUsedOath} (${Math.ceil((last / data.length) *100)}%)</span>
                </span>
                `

                statistics.innerHTML += `<span style="font-size: 10px;filter: opacity(40%);">* across all builds</span>`

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
                    "Ether Overdrive [MTL]",
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
                    "Command: Live",
                    "Alloyblood",
                    "Reshape and Remold"
                ]
                if (buildData.content.talents) {
                    buildData.content.talents.forEach(talent => {
                        if (legendaryTalents.includes(talent)) {
                            tags.innerHTML += `<span class="talent">${talent}</span>`
                        }
                    })
                }

                div.appendChild(tags)

                let extra = document.createElement("span")
                extra.classList.add("extra")
                extra.innerHTML = `<b>${buildData.content.stats.meta.Race} ${buildData.content.stats.meta.Oath}</b>`

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
                index++

                mode = "normal"

                if (index == data.length && mode == "normal") {
                    buildTable.innerHTML += `
                            <span onclick="showBuildPopup()" class="addBuild" id="addBuild"><i class="fa-solid fa-plus"></i> Add new build</span>
                            `
                }
                if (mode != "normal") {
                    const btn = document.getElementById(`${mode}btn`)
                    btn.style.backgroundColor = `#2C3835`
                }
                if (mode == "delete") {
                    document.querySelectorAll(".build").forEach(build => {
                        build.style.background = `rgba(255, 127, 127, 0.4)`
                    })
                    document.getElementById("addBuild").style.display = `none`
                }
                if (mode == "pin") {
                    document.querySelectorAll(".build").forEach(build => {
                        build.style.background = `rgba(127, 255, 255, 0.4)`
                    })
                    document.getElementById("addBuild").style.display = `none`
                }

            } else {
                console.log(`Error: ${xhr.status}`);
                return "ERROR"
            }
        }
    }

    data.forEach(build => {

        createBuild(build)

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

const funnies = [
    "Top Chime Silentheart Deto Petra's",
    "Best PvE", "Godseeker Shadow Crypt",
    "Blindseer LFT",
    "Railblade Edenkite Silentheart",
    "Markor’s Inheritor Blademaster",
    "Dawnwalker Gale",
    "El Primo Legion Kata",
    "Evanspear Chilling",
    "Frostdraw Stilleto",
    "Duke cosplay",
    "Ferryman cosplay",
    "Shadow Contractor Crypt",
    "Flame Shadow Hero Blade",
    "Bossraid Oni",
    "Silentheart Guns",
    "Godseeker Thundercall Stormseye"
]
function showBuildPopup() {
    buildLink.value = ""
    buildName.value = ""
    buildName.placeholder = funnies[Math.ceil(Math.random() * funnies.length - 1)]
    popup.style.display = `flex`
    buildTable.style.pointerEvents = `none`
}
function closePopup() {
    popup.style.display = `none`
    buildTable.style.pointerEvents = `all`
}

function load() {
    const getSave = localStorage.getItem("builds");
    const getPinned = localStorage.getItem("pinnedbuilds")
    try {
        if (getSave != null && getPinned != null) {
            data = JSON.parse(getSave)
            pinned = JSON.parse(getPinned)
        }

        // load pages based on provided data
        loadBuilds()

    } catch {
        console.log("data didn't load properly, throw error and show error overlay.")
    }
}
function save() {
    data = data
    pinned = pinned
    localStorage.setItem("builds", JSON.stringify(data))
    localStorage.setItem("pinnedbuilds", JSON.stringify(pinned))
}

//save()
load()

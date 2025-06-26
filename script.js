// there is definitely a better way to go about this
// point stands that it works
let data = [
]
let pinned = [
]
let checklistBuilds = []

const buildTable = document.getElementById("buildTable")
const pinnedTable = document.getElementById("pinnedTable")
const popup = document.getElementById("reset-popup")
const editpopup = document.getElementById("edit-popup")
const error = document.getElementById("errorText")
const statistics = document.getElementById("statistics")
const currentmode = document.getElementById("currentmode")
const buttons = document.getElementById("buttons")
const line = document.getElementById("line")
const notifs = document.getElementById("notif-container")

const buildName = document.getElementById("buildName")
const buildLink = document.getElementById("buildLink")
const buildAdd = document.getElementById("addBuild")
const searchBar = document.getElementById("searchbar")
const filter = document.getElementById("filter")

let EDITING
let COPYING = false
let CHECKLIST
let COPYINGURL
let CHECKLISTURL

let storeStat = ["Strength", "Fortitude", "Agility", "Intelligence", "Willpower", "Charisma"]
let shorthand = ["STR", "FTD", "AGL", "INT", "WLL", "CHR"]
let store = ["Flamecharm", "Frostdraw", "Thundercall", "Galebreathe", "Shadowcast", "Ironsing"]
let elmShorthand = ["LTN", "ICE", "FLM", "IRN", "SDW", "WND"]
let storeWPN = ["Heavy Wep.", "Medium Wep.", "Light Wep."]
let wpnShorthand = ["HVY", "MED", "LHT"]
let oaths = ["Arcwarder", "Blindseer", "Contractor", "Dawnwalker", "Fadetrimmer", "Jetstriker", "Linkstrider", "Oathless", "Saltchemist", "Silentheart", "Starkindred", "Visionshaper"]
let races = ["Adret", "Etrean", "Vesperian", "Canor", "Capra", "Celtor", "Chrysid", "Felinor", "Ganymede", "Gremor", "Khan", "Tiran"]

let currentIconPage = 0
let icons = [
    "unknown",
    "bolt",
    "boots",
    "chime",
    "cube",
    "death",
    "explosion",
    "eye",
    "fire",
    "fist",
    "frost",
    "genius",
    "handshake",
    "leaf",
    "lungs",
    "mountains",
    "potion",
    "saviour",
    "scratch",
    "shield",
    "skeleton",
    "spark",
    "sword",
    "throw",
    "wind"
]

buildTable.innerHTML = `<div class="loading"><img src="assets/loading-better-darker.png"></div>`
line.style.display = `none`
notifs.innerHTML = ``

let lightSchemeIcon = document.getElementById('favicon-light');
let darkSchemeIcon = document.getElementById('favicon-dark');

let matcher = window.matchMedia('(prefers-color-scheme: dark)');
matcher.addListener(onUpdate);
onUpdate();

function onUpdate() {
    if (matcher.matches) {
        lightSchemeIcon.remove();
        document.head.append(darkSchemeIcon);
    } else {
        document.head.append(lightSchemeIcon);
        darkSchemeIcon.remove();
    }
}

let rateLimit = false

searchBar.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        if (rateLimit == true) {
            return
        }
        rateLimit = true
        loadSearch()
    }
});

function changePage(inc, override) {
    console.log(`changing page by ${inc}`)
    currentIconPage += inc
    if (currentIconPage >= icons.length) {
        currentIconPage = 0
    }
    if (currentIconPage <= -1) {
        currentIconPage = icons.length - 1
    }

    if (override == true) {
        currentIconPage = inc
    }

    document.getElementById("iconPreview").src = `talent-icons/${icons[currentIconPage]}.png`
    document.getElementById("editiconPreview").src = `talent-icons/${icons[currentIconPage]}.png`

}

function loadSearch() {
    loadBuilds(searchBar.value, /*filter.value*/ "hi")
}

function createNotif(html) {
    let div = document.createElement("div")
    div.classList.add("notif")

    let span = document.createElement("span")
    span.innerHTML = html

    div.appendChild(span)

    notifs.appendChild(div)

    setTimeout(() => {
        div.style.transition = `1s`
        div.style.filter = `opacity(0%)`
    }, 2000);
    setTimeout(() => {
        div.remove()
    }, 3000);
}

function setCopy(bool, url) {
    COPYINGURL = url
    COPYING = bool
}
function setChecklist(bool, url) {
    CHECKLIST = bool
    CHECKLISTURL = url
}

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

currentmode.innerHTML = ``
buttons.style.display = `none`
pinnedTable.style.display = `none`

let mode = "normal"
let modes = ["delete", "pin", "edit"]

function applyMode(m) {

    currentmode.innerHTML = ``

    const add = document.getElementById("addBuild")
    modes.forEach(item => {
        console.log(item)
        document.getElementById(`${item}btn`).style.backgroundColor = `#40504C`
    })

    document.body.classList.remove("normal")
    document.body.classList.remove("edit")
    document.body.classList.remove("pin")
    document.body.classList.remove("delete")

    document.body.classList.add(m)

    if (m == "pin") {
        if (data.length <= 0) return;
    }
    if (m == "normal") {
        document.querySelectorAll(".build").forEach(build => {
            build.style.background = `rgba(0, 0, 0, 0.078)`
        })
        add.style.display = ``
    } else {
        //currentmode.innerHTML = `${m} mode`
        createNotif(`${m} mode!`)
        const btn = document.getElementById(`${mode}btn`)
        btn.style.backgroundColor = `#2C3835`
        if (m == "delete") {
            document.querySelectorAll(".build").forEach(build => {
                build.style.background = `rgba(255, 127, 127, 0.4)`
            })
            add.style.display = `none`
        } else if (m == "pin") {
            document.querySelectorAll(".build").forEach(build => {
                if (!build.dataset.pinned == 1) {
                    build.style.background = `rgba(127, 255, 255, 0.4)`
                }
            })
            add.style.display = `none`
        } else if (m == "edit") {
            document.querySelectorAll(".build").forEach(build => {
                build.style.background = `rgba(255, 127, 255, 0.4)`
            })
            add.style.display = `none`
        }
    }

}

function modeHandle(m) {

    if ((data.length + pinned.length) <= 0) return

    if (mode == "normal") {
        if (m == "pin") {
            if (data.length <= 0) return;
        }
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
        if (m == "pin") {
            if (data.length <= 0) return;
        }
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

    if (COPYING) {
        let element = document.getElementById(`build-${id}`)
        navigator.clipboard.writeText(`https://deepwoken.co/builder?id=${COPYINGURL}`);
        createNotif(`<i class="fa-regular fa-clipboard"></i> copied build <b>${element.dataset.buildname}</b> to clipboard!`)
        return console.log(`copied ${COPYINGURL}`)
    }
    if (CHECKLIST) {
        window.open(`https://nefarkitti.github.io/deepwoken-echo-checklist/?url=${id}`, `_blank`)
        createNotif(`<i class="fa-solid fa-list-check"></i> opening echo checklist...`)
        return
    }

    let buildElement = document.getElementById(`build-${id}`)
    if (mode == "normal") {
        window.open(`https://deepwoken.co/builder?id=${id}`, '_blank')
    } else {
        if (mode == "delete") {
            //delete build
            let foundSame = false
            let foundBuild
            if (buildElement.dataset.pinned == 1) {
                pinned.forEach(build => {
                    if (build.url == id) {
                        foundBuild = build
                        foundSame = true
                        pinned.splice(pinned.indexOf(foundBuild), 1)
                        buildElement.remove()
                        save()
                        loadBuilds()
                        return
                    }
                })
            } else {
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
        } else if (mode == "pin") {
            // pin build
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
        } else if (mode == "edit") {
            let buildData
            let pin = false
            if (buildElement.dataset.pinned == 1) {
                pinned.forEach(build => {
                    if (build.url == id) {
                        buildData = build
                        pin = true
                        return
                    }
                })
            } else {
                data.forEach(build => {
                    if (build.url == id) {
                        buildData = build
                        return
                    }
                })
            }
            if (buildData) {
                showEditPopup(buildData, pin)
            }
        }

    }
}

function modifyStatString(stat) {
    if (stat >= 1) {
        return `(${stat})`
    } else {
        return ""
    }
}

function showBuildStats(build, extraData, checklistData) {
    //console.log("yolo")
    let shrine = false
    let preShrineStats = {
        "Heavy Wep.": "",
        "Medium Wep.": "",
        "Light Wep.": "",

        "Flamecharm": "",
        "Frostdraw": "",
        "Thundercall": "",
        "Galebreathe": "",
        "Shadowcast": "",
        "Ironsing": "",

        "Strength": "",
        "Fortitude": "",
        "Agility": "",
        "Intelligence": "",
        "Willpower": "",
        "Charisma": ""
    }
    //console.log("shrine check")
    if (build.preShrine) {
        shrine = true
        Object.assign(preShrineStats, {
            "Heavy Wep.": `${modifyStatString(build.preShrine.weapon["Heavy Wep."])}`,
            "Medium Wep.": `${modifyStatString(build.preShrine.weapon["Medium Wep."])}`,
            "Light Wep.": `${modifyStatString(build.preShrine.weapon["Light Wep."])}`,

            "Flamecharm": `${modifyStatString(build.preShrine.attunement["Flamecharm"])}`,
            "Frostdraw": `${modifyStatString(build.preShrine.attunement["Frostdraw"])}`,
            "Thundercall": `${modifyStatString(build.preShrine.attunement["Thundercall"])}`,
            "Galebreathe": `${modifyStatString(build.preShrine.attunement["Galebreathe"])}`,
            "Shadowcast": `${modifyStatString(build.preShrine.attunement["Shadowcast"])}`,
            "Ironsing": `${modifyStatString(build.preShrine.attunement["Ironsing"])}`,

            "Strength": `${modifyStatString(build.preShrine.base["Strength"])}`,
            "Fortitude": `${modifyStatString(build.preShrine.base["Fortitude"])}`,
            "Agility": `${modifyStatString(build.preShrine.base["Agility"])}`,
            "Intelligence": `${modifyStatString(build.preShrine.base["Intelligence"])}`,
            "Willpower": `${modifyStatString(build.preShrine.base["Willpower"])}`,
            "Charisma": `${modifyStatString(build.preShrine.base["Charisma"])}`
        })
    }

    let rank = ""
    if (checklistData) {
        rank = checklistData.buildrank
    }
    statistics.innerHTML = `
    <span class="statline">
    <span>Oath </span>
    <span>${build.stats.meta.Oath}</span>
    </span>
    <span class="statline">
    <span>Race </span>
    <span>${build.stats.meta.Race}</span>
    </span>
    <span class="statline">
    <span>Rank </span>
    <span>${rank}</span>
    </span>

    <hr>

    <span class="statline">
    <span>Heavy Weapon </span>
    <span><span class="preshrine">${preShrineStats["Heavy Wep."]}</span> ${build.attributes.weapon["Heavy Wep."]}</span>
    </span>
    <span class="statline">
    <span>Medium Weapon </span>
    <span><span class="preshrine">${preShrineStats["Medium Wep."]}</span> ${build.attributes.weapon["Medium Wep."]}</span>
    </span>
    <span class="statline">
    <span>Light Weapon </span>
    <span><span class="preshrine">${preShrineStats["Light Wep."]}</span> ${build.attributes.weapon["Light Wep."]}</span>
    </span>

    <hr>

    <div id="build-attunements">
    <span class="statline">
    <span>Flamecharm </span>
    <span><span class="preshrine">${preShrineStats["Flamecharm"]}</span> ${build.attributes.attunement.Flamecharm}</span>
    </span>
    <span class="statline">
    <span>Frostdraw </span>
    <span><span class="preshrine">${preShrineStats["Frostdraw"]}</span> ${build.attributes.attunement.Frostdraw}</span>
    </span>
    <span class="statline">
    <span>Thundercall </span>
    <span><span class="preshrine">${preShrineStats["Thundercall"]}</span> ${build.attributes.attunement.Thundercall}</span>
    </span>
    <span class="statline">
    <span>Galebreathe </span>
    <span><span class="preshrine">${preShrineStats["Galebreathe"]}</span> ${build.attributes.attunement.Galebreathe}</span>
    </span>
    <span class="statline">
    <span>Shadowcast </span>
    <span><span class="preshrine">${preShrineStats["Shadowcast"]}</span> ${build.attributes.attunement.Shadowcast}</span>
    </span>
    <span class="statline">
    <span>Ironsing </span>
    <span><span class="preshrine">${preShrineStats["Ironsing"]}</span> ${build.attributes.attunement.Ironsing}</span>
    </span>
    </div>

    <span class="statline">
    <span>Strength </span>
    <span><span class="preshrine">${preShrineStats["Strength"]}</span> ${build.attributes.base.Strength}</span>
    </span>
    <span class="statline">
    <span>Fortitude </span>
    <span><span class="preshrine">${preShrineStats["Fortitude"]}</span> ${build.attributes.base.Fortitude}</span>
    </span>
    <span class="statline">
    <span>Agility </span>
    <span><span class="preshrine">${preShrineStats["Agility"]}</span> ${build.attributes.base.Agility}</span>
    </span>
    <span class="statline">
    <span>Intelligence </span>
    <span><span class="preshrine">${preShrineStats["Intelligence"]}</span> ${build.attributes.base.Intelligence}</span>
    </span>
    <span class="statline">
    <span>Willpower </span>
    <span><span class="preshrine">${preShrineStats["Willpower"]}</span> ${build.attributes.base.Willpower}</span>
    </span>
    <span class="statline">
    <span>Charisma </span>
    <span><span class="preshrine">${preShrineStats["Charisma"]}</span> ${build.attributes.base.Charisma}</span>
    </span>
    `

    let attunementsDiv = document.getElementById("build-attunements")
    attunementsDiv.innerHTML = ``

    let attuned = false
    store.forEach(attunement => {
        if (build.attributes.attunement[attunement] >= 1) {
            attuned = true
            attunementsDiv.innerHTML += `
            <span class="statline">
            <span>${attunement} </span>
            <span><span class="preshrine">${preShrineStats[attunement]}</span> ${build.attributes.attunement[attunement]}</span>
            </span>
            `
        }
    })
    if (attuned) {
        attunementsDiv.innerHTML += `<hr>`
    }

}
function hideBuildStats() {
    statistics.innerHTML = ``
}

function loadBuilds(searchParams, filterParams) {
    buildTable.innerHTML = `<div class="loading"><img src="assets/loading-better-darker.png"></div>`
    pinnedTable.innerHTML = ``
    statistics.innerHTML = ``
    currentmode.innerHTML = ``
    line.style.display = `none`
    buildAdd.style.display = `none`
    buttons.style.display = `none`

    let index = 0

    console.log(`loading displayed builds...`)

    modes.forEach(item => {
        console.log(item)
        document.getElementById(`${item}btn`).style.backgroundColor = `#40504C`
    })

    if ((data.length + pinned.length) <= 0) {
        console.log("no builds to load!")
        //buildTable.innerHTML = `<span onclick="showBuildPopup()" class="addBuild" id="addBuild"><i class="fa-solid fa-plus"></i> Add new build</span>`
        buildAdd.style.display = ``
        buttons.style.display = ``
        buildTable.innerHTML = `<i>Maybe try adding some builds...</i>`
        document.body.classList.remove("normal")
        document.body.classList.remove("edit")
        document.body.classList.remove("pin")
        document.body.classList.remove("delete")

        document.body.classList.add("normal")
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
        "Visionshaper": 0,

        "Adret": 0,
        "Etrean": 0,
        "Vesperian": 0,
        "Canor": 0,
        "Capra": 0,
        "Celtor": 0,
        "Chrysid": 0,
        "Felinor": 0,
        "Ganymede": 0,
        "Gremor": 0,
        "Khan": 0,
        "Tiran": 0
    }

    function createBuild(build, location, query, filter) {

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
                console.log(`--- LOADING BUILD "${build.name.toUpperCase()}" ---`)
                console.log(buildData);

                if (buildData.status == "failed") {
                    createNotif(`Failed to load ${build.name}`)
                    index++
                    return
                }

                storeAvgStats[buildData.meta.Oath] += 1
                storeAvgStats[buildData.meta.Race] += 1

                console.log(`FILTER: ${filter}`)

                function failload() {
                    console.log("no builds to load!")
                    //buildTable.innerHTML = `<span onclick="showBuildPopup()" class="addBuild" id="addBuild"><i class="fa-solid fa-plus"></i> Add new build</span>`
                    /*
                    buildTable.innerHTML = `<i>No builds found...</i>`*/
                    document.body.classList.remove("normal")
                    document.body.classList.remove("edit")
                    document.body.classList.remove("pin")
                    document.body.classList.remove("delete")

                    buildAdd.style.display = ``
                    buttons.style.display = ``

                    document.body.classList.add("normal")
                    mode = "normal"
                    modeHandle("normal")
                }

                /*if (filter && filter.length >= 1) {
                    console.log(`SEARCHING WITH FILTER ${filter}`)

                    console.log("checking attunement")
                    if (buildData.content.attributes.attunement[filter] || (buildData.content.preShrine && buildData.content.preShrine.attunement[filter])) {
                        console.log("attunement value exists!")
                        if (buildData.content.attributes.attunement[filter] >= 1 || (buildData.content.preShrine && buildData.content.preShrine.attunement[filter] >= 1)) {
                            // yea this exists
                            console.log("attunement check succeeded")
                        } else {
                            return console.log("attunement check failed");failload();
                        }
                    }

                    console.log("checking base")
                    console.log(buildData.content.attributes.base[filter])
                    if (buildData.content.attributes.base[filter] >= 0 || (buildData.content.preShrine && buildData.content.preShrine.base[filter] >= 0)) {
                        console.log("base value exists!")
                        if (buildData.content.attributes.base[filter] >= 1 || (buildData.content.preShrine && buildData.content.preShrine.base[filter] >= 1)) {
                            // yea this exists
                            console.log("base check succeeded")
                        } else {
                            return console.log("base check failed")
                        }
                    }

                    console.log("checking weapon")
                    if (buildData.content.attributes.weapon[filter] || (buildData.content.preShrine && buildData.content.preShrine.weapon[filter])) {
                        console.log("weapon value exists!")
                        if (buildData.content.attributes.weapon[filter] >= 1 || (buildData.content.preShrine && buildData.content.preShrine.weapon[filter] >= 1)) {
                            // yea this exists
                            console.log("weapon check succeeded")
                        } else {
                            return console.log("weapon check failed")
                        }
                    }
                }*/

                // get stat name with query
                // query is "heavy"
                // stat name is "Heavy Wep."

                function searchCheck() {

                    let bool = false
                    let points = 0

                    // allow for combinations of words?
                    let queryArr = query.split(" ").map(v => v.toUpperCase())

                    queryArr.forEach(quer => {
                        if (build.name.toUpperCase().indexOf(quer.toUpperCase()) > -1
                            || buildData.stats.meta.Oath.toUpperCase().indexOf(quer.toUpperCase()) > -1
                            || buildData.stats.meta.Race.toUpperCase().indexOf(quer.toUpperCase()) > -1) {
                            bool = true
                        }

                        const capWPN = storeWPN.map(wpn => wpn.toUpperCase());
                        for (let i = 0; i < capWPN.length; i++) {
                            if (capWPN[i].toUpperCase().indexOf(quer.toUpperCase()) > -1) {
                                if (buildData.attributes.weapon[storeWPN[i]] >= 1) {
                                    console.log("found weapon")
                                    bool = true
                                    points++
                                    break
                                }
                            }
                        }

                        const capATN = store.map(atn => atn.toUpperCase());
                        for (let i = 0; i < capATN.length; i++) {
                            if (capATN[i].toUpperCase().indexOf(quer.toUpperCase()) > -1) {
                                if (buildData.attributes.attunement[store[i]] >= 50|| (buildData.preShrine && buildData.preShrine.attunement[store[i]] >= 50)) {
                                    console.log("found attunement")
                                    bool = true
                                    points++
                                    break
                                }
                            }
                        }

                        const capATT = storeStat.map(att => att.toUpperCase());
                        for (let i = 0; i < capATT.length; i++) {
                            console.log(`${quer} VERSUS ${capATT[i]}`)
                            if (capATT[i].toUpperCase().indexOf(quer.toUpperCase()) > -1) {
                                if (buildData.content.attributes.base[storeStat[i]] >= 50|| (buildData.content.preShrine && buildData.content.preShrine.base[storeStat[i]] >= 50)) {
                                    console.log("found base")
                                    bool = true
                                    points++
                                    break
                                }
                            }
                        }
                    })

                    /*if (build.name.toUpperCase().indexOf(query.toUpperCase()) > -1
                    || buildData.content.stats.meta.Oath.toUpperCase().indexOf(query.toUpperCase()) > -1
                    || buildData.content.stats.meta.Race.toUpperCase().indexOf(query.toUpperCase()) > -1) {
                        bool = true
                    }

                    const capWPN = storeWPN.map(wpn => wpn.toUpperCase());
                    for (let i =0;i < capWPN.length; i++) {
                        if (capWPN[i].toUpperCase().indexOf(query.toUpperCase()) > -1) {
                            if (buildData.content.attributes.weapon[storeWPN[i]] >= 1) {
                                console.log("found weapon")
                                bool = true
                                break
                            }
                        }
                    }

                    const capATN = store.map(atn => atn.toUpperCase());
                    for (let i =0;i < capATN.length; i++) {
                        if (capATN[i].toUpperCase().indexOf(query.toUpperCase()) > -1) {
                            if (buildData.content.attributes.attunement[store[i]] >= 1) {
                                console.log("found attunement")
                                bool = true
                                break
                            }
                        }
                    }

                    const capATT = storeStat.map(att => att.toUpperCase());
                    for (let i =0;i < capATT.length; i++) {
                        console.log(`${query} VERSUS ${capATT[i]}`)
                        if (capATT[i].toUpperCase().indexOf(query.toUpperCase()) > -1) {
                            if (buildData.content.attributes.base[storeStat [i]] >= 1) {
                                console.log("found base")
                                bool = true
                                break
                            }
                        }
                    }*/

                    // i just cannot figure it out!

                    return bool
                }

                if (query && query.length >= 1) { // out of all the horrendous things ive done this might just take the cake
                    if (searchCheck() == true) {
                    } else {
                        failload()
                        return
                    }
                }

                const div = document.createElement("div")
                div.id = `build-${build.url}`
                div.dataset.buildid = build.url
                div.dataset.buildname = build.name
                div.classList.add("build")
                if (location == "pinned") {
                    div.dataset.pinned = 1
                }

                // i love webjs!
                div.setAttribute("onclick", `handleBuildClick("${build.url}")`)
                div.title = buildData.stats.buildName

                const holder = document.createElement("div")
                holder.classList.add("textcontainer")
                holder.classList.add("holder")

                const textContainer = document.createElement("div")
                textContainer.classList.add("textcontainer")

                let checklistLinked = false
                let checklistBuild = 0
                try {
                    checklistBuilds.builds.forEach(checkBuild => {
                        if (checkBuild.buildurl == `https://deepwoken.co/builder?id=${build.url}`) {
                            checklistBuild = checkBuild
                            let rankSpan = document.createElement("span")
                            rankSpan.classList.add("rankSpan")
                            rankSpan.innerHTML = checkBuild.buildrank
                            rankSpan.classList.add(`${checkBuild.buildrank.toLowerCase()}rank`)
                            div.appendChild(rankSpan)
                            checklistLinked = true
                        }
                    })
                } catch {
                    console.log("failed to load checklist build")
                }

                div.setAttribute("onmouseenter", `showBuildStats(${JSON.stringify(buildData)}, ${JSON.stringify(build)}, ${JSON.stringify(checklistBuild)})`)
                div.setAttribute("onmouseleave", `hideBuildStats()`)

                let soo = document.createElement("b")
                soo.style.overflow = `clip`

                const span = document.createElement("span")
                span.classList.add("build-name")
                if (location == "pinned") {
                    console.log("hi there")
                    soo.innerHTML += `<i class='fa-solid fa-thumbtack'></i> `
                }
                if (buildData.content.preShrine) {
                    soo.innerHTML += `<i class='fa-solid fa-torii-gate'></i> `
                }

                span.appendChild(soo)
                const bname = document.createElement("b")
                bname.innerText = build.name
                bname.style.marginLeft = `2px`
                span.appendChild(bname)

                textContainer.appendChild(span)

                let tags = document.createElement("div")
                tags.classList.add("tags")

                let stats = []
                let attunements = []
                let weapons = []


                storeWPN.forEach(weapon => {

                    //storeAvgStats[weapon] += buildData.content.attributes.weapon[weapon]

                    
                    if (buildData.attributes.weapon[weapon] >= 1) {
                        weapons.push(weapon)
                        console.log(`add ${weapon}`)
                    }
                })
                let STATKEYS = Object.keys(buildData.attributes.base)
                let STATVALUES = Object.values(buildData.attributes.base)
                for (let i = 0; i < storeStat.length; i++) {
                    let key = STATKEYS[i]
                    let val = STATVALUES[i]
                    stats.push({
                        "name": key,
                        "value": val
                    })
                }

                store.forEach(attunement => {

                    //storeAvgStats[attunement] += buildData.content.attributes.attunement[attunement]

                    //console.log(buildData.content.preShrine.attunement[attunement])
                    //console.log(attunement,buildData.content.attributes.attunement[attunement])
                    if (buildData.attributes.attunement[attunement] >= 1 || (buildData.content.preShrine && buildData.content.preShrine.attunement[attunement] >= 1)) {
                        console.log(`add ${attunement}`)
                        attunements.push(attunement)
                    }
                })

                if (attunements.length <= 0) {
                    tags.innerHTML += `<img title="No Attunement" src="attunements/no-attunement-better.png">`
                } else {
                    attunements.forEach(attune => {
                        tags.innerHTML += `<img title="${attune}" src="attunements/${attune.toLowerCase()}-better.png">`
                    })
                }

                if (weapons.length >= 1) {
                    weapons.forEach(weapon => {
                        tags.innerHTML += `<span class="weapon" title="${storeWPN[storeWPN.indexOf(weapon)]}">${wpnShorthand[storeWPN.indexOf(weapon)]}</span>`
                    })
                }

                stats.forEach(stat => {

                    //if (buildData.content.preShrine) {
                    //    storeAvgStats[stat.name] += buildData.content.preShrine.base[stat.name]
                    //} else {
                    //    storeAvgStats[stat.name] += stat.value
                    //}

                    //why doesnt this work??
                    //storeAvgStats[stat.name] = storeAvgStats[stat.name] + stat.value
                    //console.log(buildData.content.preShrine.base[stat.name])
                    if (stat.value >= 50 || (buildData.content.preShrine && buildData.content.preShrine.base[stat.name] >= 50)) {
                        let short = shorthand[storeStat.indexOf(stat.name)]
                        tags.innerHTML += `<span title="${stat.name}" class="${stat.name.toLowerCase()}">${short}</span>`
                        console.log(`add ${stat.name}`)
                        //console.log(stat.name, stat.value)
                    }

                })

                //statistics.innerHTML = ``
                /*for (let i = 0; i < storeWPN.length; i++) {
                    const sp = document.createElement("span")
                    sp.classList.add("statline")

                    sp.innerHTML += `<span>avg. ${storeWPN[i].toUpperCase()}:</span><span>${Math.ceil(storeAvgStats[storeWPN[i]] / (data.length + pinned.length))}</span>`

                    statistics.appendChild(sp)
                }
                statistics.innerHTML += `<hr>`
                for (let i = 0; i < storeStat.length; i++) {
                    const sp = document.createElement("span")
                    sp.classList.add("statline")

                    sp.innerHTML += `<span>avg. ${storeStat[i].toUpperCase()}:</span><span>${Math.ceil(storeAvgStats[storeStat[i]] / (data.length + pinned.length))}</span>`

                    statistics.appendChild(sp)
                }
                statistics.innerHTML += `<hr>`
                for (let i = 0; i < store.length; i++) {
                    const sp = document.createElement("span")
                    sp.classList.add("statline")

                    sp.innerHTML += `<span>avg. ${store[i].toUpperCase()}:</span><span>${Math.ceil(storeAvgStats[store[i]] / (data.length + pinned.length))}</span>`

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
                <span>Main Oath:</span><span>${mostUsedOath} (${Math.ceil((last / (data.length + pinned.length)) *100)}%)</span>
                </span>
                `
                let mostUsedRace = ""
                last = 0
                for (let i = 0; i < oaths.length; i++) {
                    let race = races[i];
                    if (storeAvgStats[race] >= last) {
                        mostUsedRace = race
                        last = storeAvgStats[race]
                    }
                }
                statistics.innerHTML += `
                <span class="statline">
                <span>Main Race:</span><span>${mostUsedRace} (${Math.ceil((last / (data.length + pinned.length)) *100)}%)</span>
                </span>
                `

                statistics.innerHTML += `<span style="font-size: 10px;filter: opacity(40%);">* across all builds</span>`*/

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
                            tags.innerHTML += `<span class="talent" title="${talent}">${talent}</span>`
                        }
                    })
                }

                textContainer.appendChild(tags)

                let extra = document.createElement("span")
                extra.classList.add("extra")
                extra.innerHTML = `<b style="font-weight: 600;">${buildData.stats.meta.Race} ${buildData.stats.meta.Oath}</b>`

                let extra3 = document.createElement("span")
                extra3.classList.add("extra")
                extra3.innerHTML = `<b style="font-weight: 600;font-style:normal;font-size:10px;">
                VIT ${buildData.stats.traits.Vitality} 
                ERU ${buildData.stats.traits.Erudition} 
                PRO ${buildData.stats.traits.Proficiency} 
                SNG ${buildData.stats.traits.Songchant}</b>`

                textContainer.appendChild(extra)
                textContainer.appendChild(extra3)

                let extra2 = document.createElement("span")
                extra2.classList.add("extra")

                if (buildData.stats.buildAuthor.length >= 1) {
                    extra2.innerText = `by ${buildData.stats.buildAuthor}`
                } else {
                    extra2.innerText = `by Nobody!`
                }

                textContainer.appendChild(extra2)

                const buttonHolder = document.createElement("div")
                buttonHolder.classList.add("container")

                const btn = document.createElement("span")
                btn.classList.add("copybtn")
                btn.classList.add("buttonstylized")
                btn.innerHTML = `<i class="fa-solid fa-copy"></i>`

                btn.setAttribute("onmouseenter", `setCopy(true, "${build.url}")`)
                btn.setAttribute("onmouseleave", `setCopy(false, "")`)
                btn.title = "Copy to clipboard"

                const btn2 = document.createElement("span")
                btn2.classList.add("copybtn")
                btn2.classList.add("buttonstylized")
                btn2.innerHTML = `<i class="fa-solid fa-list-check"></i>`
                btn2.title = "Open in checklist"

                btn2.setAttribute("onmouseenter", `setChecklist(true, "${build.url}")`)
                btn2.setAttribute("onmouseleave", `setChecklist(false, "")`)

                buttonHolder.appendChild(btn2)
                buttonHolder.appendChild(btn)

                if (build.icon && build.icon != "unknown") {

                    const img = document.createElement("img")
                    img.src = `talent-icons/${build.icon}.png`
                    img.classList.add("buildimage")

                    holder.appendChild(img)
                }
                holder.appendChild(textContainer)

                div.appendChild(holder)

                div.appendChild(buttonHolder)

                if (location == "pinned") {
                    pinnedTable.appendChild(div)
                } else {
                    buildTable.appendChild(div)
                }
                index++

                document.body.classList.remove("normal")
                document.body.classList.remove("edit")
                document.body.classList.remove("pin")
                document.body.classList.remove("delete")

                document.body.classList.add("normal")
                mode = "normal"

                line.style.display = `none`
                if (pinned.length >= 1) {
                    line.style.display = ``
                } else {
                    pinnedTable.style.display = `none`
                    line.style.display = `none`
                }

                if (index == (data.length + pinned.length) && mode == "normal") {
                    buildAdd.style.display = ``
                    buttons.style.display = ``
                    document.getElementById("galleryText").innerHTML = `Gallery (${data.length + pinned.length})`
                    rateLimit = false
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

                console.log(`--- FINISHED LOADING BUILD "${build.name.toUpperCase()}" ---`)

            } else {
                console.log(`Error: ${xhr.status}`);
                return "ERROR"
            }
        }
    }

    index = 0

    console.log(`BUILDS LENGTH ${data.length}`)
    console.log(`PINNED LENGTH ${pinned.length}`)

    if (pinned.length >= 1) {
        pinnedTable.style.display = ``

        pinned.forEach(build => {

            createBuild(build, "pinned", searchParams, filterParams)

        })
    }

    data.forEach(build => {

        createBuild(build, "build", searchParams, filterParams)

    })
}

const addbtns = document.getElementById("addbuildbuttons")

function addBuild() {

    const name = buildName.value
    const link = buildLink.value
    const icon = icons[currentIconPage]

    if (name.length < 3) return;

    let url = new URL(link)
    if (url.hostname != "deepwoken.co") return;

    console.log(`adding build ${url.searchParams.get("id")}`)

    let id = url.searchParams.get("id")

    console.log(`id for new build ${id}`)

    if (id == null) return;

    let foundSame = false
    data.forEach(build => {
        if (build.url == id) {
            foundSame = true
            return
        }
    })
    pinned.forEach(build => {
        if (build.url == id) {
            foundSame = true
            return
        }
    })

    if (foundSame == true) return;

    addbtns.innerHTML = `<div class="validation"><div class="loading"><img src="assets/loading-better-darker.png"></div><span>validating</span></div>`

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `https://api.deepwoken.co/build?id=${id}`); //MNYlcSP8
    xhr.send();
    xhr.responseType = "json";
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let buildData = xhr.response
            if (buildData.status == "success") {
                data.push({
                    "name": name,
                    "url": id,
                    "icon": icon,
                })

                closePopup()
                save()
                loadBuilds()
            } else {
                addbtns.innerHTML = `<span class="buttonstylized" onclick="addBuild()">Add</span>
                <span class="buttonstylized" onclick="closePopup()">Cancel</span>`
            }
        }
    }
}

// they were not funny.
function showBuildPopup() {
    buildLink.value = ""
    buildName.value = ""
    buildLink.style.display = ``
    buildName.placeholder = `${wpnShorthand[Math.ceil(Math.random() * wpnShorthand.length - 1)]} ${store[Math.ceil(Math.random() * store.length - 1)]} ${oaths[Math.ceil(Math.random() * oaths.length - 1)]}`

    currentIconPage = 0

    document.getElementById("iconPreview").src = `talent-icons/unknown.png`

    addbtns.innerHTML = `<span class="buttonstylized" onclick="addBuild()">Add</span>
    <span class="buttonstylized" onclick="closePopup()">Cancel</span>`
    popup.style.display = `flex`
    buildTable.style.pointerEvents = `none`
    document.getElementById("buttons").style.pointerEvents = `none`
    pinnedTable.style.pointerEvents = `none`
    buildTable.style.pointerEvents = `none`
}
function showEditPopup(dat, pin) {
    document.getElementById("pinner").style.display = `none`
    if (pin == true) {
        document.getElementById("pinner").style.display = ``
    }
    console.log(dat)

    if (dat.icon) {
        currentIconPage = icons.indexOf(dat.icon)
        document.getElementById("editiconPreview").src = `talent-icons/${dat.icon}.png`
        console.log("hi im the icon")
    } else {
        currentIconPage = 0
        document.getElementById("editiconPreview").src = `talent-icons/unknown.png`
    }

    document.getElementById("editbuildName").value = dat.name
    document.getElementById("editbuildName").placeholder = dat.name

    editpopup.style.display = `flex`
    buildTable.style.pointerEvents = `none`

    document.getElementById("buttons").style.pointerEvents = `none`

    pinnedTable.style.pointerEvents = `none`
    buildTable.style.pointerEvents = `none`

    EDITING = dat.url
}
function closePopup() {
    popup.style.display = `none`
    editpopup.style.display = `none`
    buildTable.style.pointerEvents = `all`
    document.getElementById("buttons").style.pointerEvents = `all`
    pinnedTable.style.pointerEvents = `all`
    buildTable.style.pointerEvents = `all`
}
function saveEdit() {
    if (document.getElementById("editbuildName").value.length < 3) return;
    let buildData
    data.forEach(build => {
        if (build.url == EDITING) {
            buildData = build
            console.log("found build to edit")
            return
        }
    })
    pinned.forEach(build => {
        if (build.url == EDITING) {
            buildData = build
            console.log("found build to edit")
            return
        }
    })
    if (buildData) {
        buildData.name = document.getElementById("editbuildName").value
        buildData.icon = icons[currentIconPage]
        closePopup()
        save()
        loadBuilds()
    }
}
function unPin() {
    let buildData
    pinned.forEach(build => {
        if (build.url == EDITING) {
            buildData = build
            return
        }
    })
    if (buildData) {
        data.push(buildData)
        pinned.splice(pinned.indexOf(buildData), 1)
        save()
        closePopup()
        loadBuilds()
    }
}

function load() {
    const getSave = localStorage.getItem("builds");
    const getPinned = localStorage.getItem("pinnedbuilds")
    const getChecklistBuilds = localStorage.getItem("buildtriumphsSaves")
    try {
        if (getSave != null && getPinned != null && getChecklistBuilds != null) {
            data = JSON.parse(getSave)
            pinned = JSON.parse(getPinned)
            checklistBuilds = JSON.parse(getChecklistBuilds)
        } else if (getChecklistBuilds == null) {
            let getChecklist = localStorage.setItem("buildtriumphsSaves", JSON.stringify(checklistBuilds))
            checklistBuilds = JSON.parse(getChecklist)
        }

        // load pages based on provided data
        loadBuilds()

    } catch (e) {
        console.log(e)
        console.log("data didn't load properly, throw error and show error overlay.")
        window.location.reload()
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

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

let EDITING
let COPYING = false
let CHECKLIST
let COPYINGURL
let CHECKLISTURL

buildTable.innerHTML = `<div class="loading"><img src="loading.png"></div>`
line.style.display = `none`
notifs.innerHTML = ``

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

    if (m == "normal") {
        document.querySelectorAll(".build").forEach(build => {
            build.style.background = `none`
        })
        add.style.display = ``
    } else {
        currentmode.innerHTML = `${m} mode`
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
        } else if (m == "edit") {
            document.querySelectorAll(".build").forEach(build => {
                build.style.background = `rgba(255, 127, 255, 0.4)`
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

let storeStat = ["Strength", "Fortitude", "Agility", "Intelligence", "Willpower", "Charisma"]
let shorthand = ["STR", "FTD", "AGL", "INT", "WLL", "CHR"]
let store = ["Thundercall", "Frostdraw", "Flamecharm", "Ironsing", "Shadowcast", "Galebreathe"]
let elmShorthand = ["LTN", "ICE", "FLM", "IRN", "SDW", "WND"]
let storeWPN = ["Heavy Wep.", "Medium Wep.", "Light Wep."]
let wpnShorthand = ["HVY", "MED", "LHT"]
let oaths = ["Arcwarder", "Blindseer", "Contractor", "Dawnwalker", "Fadetrimmer", "Jetstriker", "Linkstrider", "Oathless", "Saltchemist", "Silentheart", "Starkindred", "Visionshaper"]
let races = ["Adret","Etrean","Vesperian","Canor","Capra","Celtor","Chrysid","Felinor","Ganymede","Gremor","Khan","Tiran"]

function loadBuilds() {
    buildTable.innerHTML = `<div class="loading"><img src="loading.png"></div>`
    pinnedTable.innerHTML = ``
    statistics.innerHTML = ``
    currentmode.innerHTML = ``
    line.style.display =`none`
    buildAdd.style.display = `none`
    buttons.style.display = `none`

    let index = 0

    modes.forEach(item => {
        console.log(item)
        document.getElementById(`${item}btn`).style.backgroundColor = `#40504C`
    })

    if (data.length <= 0) {
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

    function createBuild(build, location) {

        const xhr = new XMLHttpRequest();
        xhr.open("GET", `https://api.deepwoken.co/build?id=${build.url}`); //MNYlcSP8
        xhr.send();
        xhr.responseType = "json";
        xhr.onload = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {

                if (index == 0) {
                    buildTable.innerHTML = ``
                }

                console.log(1)

                const buildData = xhr.response;
                console.log(build.name.toUpperCase())
                console.log(buildData);

                storeAvgStats[buildData.content.stats.meta.Oath] += 1
                storeAvgStats[buildData.content.stats.meta.Race] += 1

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
                div.title = buildData.content.stats.buildName

                let checklistLinked = false
                console.log("checklist builds")
                console.log(checklistBuilds.builds)
                checklistBuilds.builds.forEach(checkBuild=>{
                   if (checkBuild.buildurl == `https://deepwoken.co/builder?id=${build.url}`) {
                    let rankSpan = document.createElement("span")
                    rankSpan.classList.add("rankSpan")
                    rankSpan.innerHTML = checkBuild.buildrank
                    rankSpan.classList.add(`${checkBuild.buildrank.toLowerCase()}rank`)
                    div.appendChild(rankSpan)
                    checklistLinked = true
                   }
                })

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

                div.appendChild(span)

                let tags = document.createElement("div")
                tags.classList.add("tags")

                let stats = []
                let attunements = []
                let weapons = []

                store.forEach(attunement => {
                    
                    storeAvgStats[attunement] += buildData.content.attributes.attunement[attunement]

                    console.log(buildData.content.preShrine.attunement[attunement])
                    if (buildData.content.attributes.attunement[attunement] >= 1 || buildData.content.preShrine.attunement[attunement] >= 1) {
                        console.log(`add ${attunement}`)
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
                console.log(attunements)
                if (attunements.length <= 0) {
                    tags.innerHTML += `<img src="attunements/no-attunement-better.png">`
                } else {
                    attunements.forEach(attune => {
                        tags.innerHTML += `<img src="attunements/${attune.toLowerCase()}-better.png">`
                    })
                }

                if (weapons.length >= 1) {
                    weapons.forEach(weapon => {
                        tags.innerHTML += `<span class="weapon">${wpnShorthand[storeWPN.indexOf(weapon)]}</span>`
                    })
                }

                stats.forEach(stat => {

                    if (buildData.content.preShrine) {
                        storeAvgStats[stat.name] += buildData.content.preShrine.base[stat.name]
                    } else {
                        storeAvgStats[stat.name] += stat.value
                    }

                    //why doesnt this work??
                    //storeAvgStats[stat.name] = storeAvgStats[stat.name] + stat.value
                    if (stat.value >= 75 || buildData.content.preShrine.base[stat.name] >= 75) {
                        let short = shorthand[storeStat.indexOf(stat.name)]
                        tags.innerHTML += `<span class="${stat.name.toLowerCase()}">${short}</span>`
                        console.log(stat.name)
                    }

                })

                statistics.innerHTML = ``
                for (let i = 0; i < storeWPN.length; i++) {
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
                extra.innerHTML = `<b style="font-weight: 600;">${buildData.content.stats.meta.Race} ${buildData.content.stats.meta.Oath}</b>`

                let extra3 = document.createElement("span")
                extra3.classList.add("extra")
                extra3.innerHTML = `<b style="font-weight: 600;font-style:normal;font-size:10px;">
                VIT ${buildData.content.stats.traits.Vitality} 
                ERU ${buildData.content.stats.traits.Erudition} 
                PRO ${buildData.content.stats.traits.Proficiency} 
                SNG ${buildData.content.stats.traits.Songchant}</b>`

                div.appendChild(extra)
                div.appendChild(extra3)

                let extra2 = document.createElement("span")
                extra2.classList.add("extra")

                if (buildData.content.stats.buildAuthor.length >= 1) {
                    extra2.innerText = `by ${buildData.content.stats.buildAuthor}`
                } else {
                    extra2.innerText = `by Nobody!`
                }

                div.appendChild(extra2)

                const buttonHolder = document.createElement("div")
                buttonHolder.classList.add("container")

                const btn = document.createElement("span")
                btn.classList.add("copybtn")
                btn.classList.add("buttonstylized")
                btn.innerHTML = `<i class="fa-solid fa-copy"></i>`

                btn.setAttribute("onmouseenter", `setCopy(true, "${build.url}")`)
                btn.setAttribute("onmouseleave", `setCopy(false, "")`)

                const btn2 = document.createElement("span")
                btn2.classList.add("copybtn")
                btn2.classList.add("buttonstylized")
                btn2.innerHTML = `<i class="fa-solid fa-list-check"></i>`

                btn2.setAttribute("onmouseenter", `setChecklist(true, "${build.url}")`)
                btn2.setAttribute("onmouseleave", `setChecklist(false, "")`)

                buttonHolder.appendChild(btn2)
                buttonHolder.appendChild(btn)

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
                
                line.style.display =`none`
                if (pinned.length >= 1) {
                    line.style.display = ``
                } else {
                    pinnedTable.style.display = `none`
                    line.style.display =`none`
                }

                if (index == (data.length + pinned.length) && mode == "normal") {
                    buildAdd.style.display = ``
                    buttons.style.display = ``
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

    index = 0

    if (pinned.length >= 1) {
        pinnedTable.style.display = ``

        pinned.forEach(build => {

            createBuild(build, "pinned")
    
        })
    }

    data.forEach(build => {

        createBuild(build, "build")

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
    pinned.forEach(build => {
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
    "Blindseer Guns LFT",
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
    "Godseeker Thundercall Stormseye",
    "Spear Jetstriker",
    "Detonation Rapier",
    "new top 50 build",
    "IRONSING META",
    "FLAMECHARM META",
    "mantra spam #234",
    "Frost Mage"
]
function showBuildPopup() {
    buildLink.value = ""
    buildName.value = ""
    buildLink.style.display = ``
    buildName.placeholder = funnies[Math.ceil(Math.random() * funnies.length - 1)]
    popup.style.display = `flex`
    buildTable.style.pointerEvents = `none`
    document.getElementById("buttons").style.pointerEvents = `none`
}
function showEditPopup(dat, pin) {
    document.getElementById("pinner").style.display = `none`
    if (pin == true) {
        document.getElementById("pinner").style.display = ``
    }
    console.log(dat)
    document.getElementById("editbuildName").value = dat.name
    document.getElementById("editbuildName").placeholder = dat.name
    editpopup.style.display = `flex`
    buildTable.style.pointerEvents = `none`
    document.getElementById("buttons").style.pointerEvents = `none`
    EDITING = dat.url
}
function closePopup() {
    popup.style.display = `none`
    editpopup.style.display = `none`
    buildTable.style.pointerEvents = `all`
    document.getElementById("buttons").style.pointerEvents = `all`
}
function saveEdit() {
    if (document.getElementById("editbuildName").value.length < 3) return;
    let buildData
    data.forEach(build => {
        if (build.url == EDITING) {
            buildData = build
            return
        }
    })
    if (buildData) {
        buildData.name = document.getElementById("editbuildName").value
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
        if (getSave != null && getPinned != null) {
            data = JSON.parse(getSave)
            pinned = JSON.parse(getPinned)
            checklistBuilds = JSON.parse(getChecklistBuilds)
        } else if (getChecklistBuilds == null) {
            localStorage.setItem("buildtriumphsSaves", JSON.stringify(checklistBuilds))
        }

        // load pages based on provided data
        loadBuilds()

    } catch (e) {
        console.log(e)
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

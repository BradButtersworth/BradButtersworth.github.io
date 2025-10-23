//I made this

var canvas = document.getElementById("canvas");
var debug = document.getElementById("debug");

const editor = true;

const canvasSizeX = 120;
const canvasSizeY = 42;

const fps = 30;

const jumpPower = 1.75;

const plrHitboxX = 4;
const plrHitboxY = 1;

const keybinds = [
    ["a", "ArrowLeft"], // moveLeft
    ["d", "ArrowRight"], // moveRight
    ["w", "ArrowUp", "z", "c"], // jump
    [" ", "x"], // useItem
    ["s", "ArrowDown"] // dropItem
];

const keybindNames = [
    "moveLeft",
    "moveRight",
    "jump",
    "useItem",
    "dropItem"
];

const solidBlockTypes = [0, 3, 5, 6, 7, 8];
// Block types: -1: air, 0: normal block, 1: kills you, 2: go to next level, 3: glass (breaks), 4: checkpoint, 5: door, 6: box, 7: breaks when you jump, 8: goes up 1 and turns into 7 when you jump, 9: wall spikes
const blockTypeNames = ["normal block", "death block", "win block", "breakable block", "checkpoint", "door", "box", "no jump block", "up block", "wall spikes", "pressure plate"];

const nsfPlayer = createNsfPlayer();

var patched = true; // setting this to false allows some funny glitches to happen

var dead = false;

// frameId increments while paused; tickId does not.
var frameId = 0;
var tickId = 0;

var lastOnGround = -1000;
var lastJump = -1000;

var plrVelY = 0;

var dashDirec = 0;

var plrSprite = "( ..)\n \\*\\\n ..";
var facing = 1;

var holdingItem = false;

var mode = 0;
var placeTile = 0;
var placeTileType = 0;

var spawnX = 0;
var spawnY = 0;

var lastPressOfBtns = { // last frameId in which the buttons were pressed, only counting the first frame in the push
    moveLeft: -10000,
    moveRight: -10000,
    jump: -10000,
    useItem: -10000,
    dropItem: -10000
}

var lastWasDownOfBtns = { // last frameId in which the buttons were held down. If the button is currently pushed, it will equal frameId
    moveLeft: -10000,
    moveRight: -10000,
    jump: -10000,
    useItem: -10000,
    dropItem: -10000
}

var pressedBtns = {
    moveLeft: false,
    moveRight: false,
    jump: false,
    useItem: false,
    dropItem: false,
};

var paused = false;

var lavaY = 99999999;

var allEnemies = [];
var allItems = [];

const txtrs = {
    normalBlock: "#####\n;;;;;\n;;;;;",
    lava: [8, ".-~-,\n . *\nO", "~-.-~\no\n   o"],
    bubbles: [8, "\n .\n   .", "\n\n."],
    glass: "/**//\n//*/*\n*//*/",
    hammer: "|=|\n |",
    axeChopRight: " \\\\\n--,\n  ~",
    axeChopLeft: "//\n,--\n~",
    flag: "  |>\n  |\n  |",
    door: "\\---/\n| Z |\n/---\\",
    box: "|   |\n| Z |\n|___|",
    closedBox: "|===|\n| - |\n|___|",
    noJump: "/#*/#\n* X *\n\\   /",
    smearBlock: "#####\n|||'|\n'|'|'",
    upBlock: "#####\n* ^ *\n\\ ' /",
    leftWallSpikes: ">\n>\n>",
    rightWallSpikes: "    <\n    <\n    <",
    pressurePlate: "\n\n/===\\",
    dashItem: "d"
}

const blockPalettes = [
    [ // 0
        txtrs.normalBlock, // 0
        "%%%%%\nevil%\nblock", // 1
        "@@@@@\n@win@\nblock", // 2
        txtrs.lava, // 3
        txtrs.bubbles, // 4
        txtrs.glass, // 5
        txtrs.flag, // 6
        txtrs.door, // 7
        txtrs.box, // 8
        txtrs.closedBox, // 9
        txtrs.noJump, // 10
        txtrs.upBlock, // 11
        txtrs.leftWallSpikes, // 12
        txtrs.rightWallSpikes, // 13
        txtrs.pressurePlate, // 14
    ],
]

var levels = [

    { // 0
        tileHeight: 3,
        tileWidth: 5,
        rows: 14,
        music: 0,
        tileImgs: blockPalettes[0],
        tiles: [-13,0,-13,0,-13,0,-13,0,-13,0,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-13,0,-13,0,-13,0,-13,0,-12,4,3,-4,0,0,-2,0,-3,4,3,-4,0,0,0,-1,0,-2,0,4,3,-3,0,0,-7,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-5,0,0,0,0,0,0,0,0,0,-5,0,0,0,0,0,0,0,0,0,-5,0,0,0,0,0,0,0,0,0,-5,0,0,0,0,0,0,0,0,0,-5,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,0,0,0,0,0,0,-6,0,0,0,0,0,0,0,0,-6,0,0,0,0,0,0,0,0,-6,0,0,0,0,0,0,0,0,-6,0,0,0,0,0,0,0,0,-6,0,0,0,0,0,0,0,0,-6,0,0,0,0,0,0,0,0,-6,0,0,0,0,0,0,0,0,-5,8,0,0,0,0,0,0,0,0,7,7,7,7,7,7,0,0,0,0,0,0,0,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-12,6,0,-13,0,-13,0,-22,5,5,5,5,5,-9,5,5,5,5,5,-9,5,5,5,5,5,-9,5,5,5,5,5,-28,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-50,5,5,5,5,5,0,-8,8,8,8,8,8,0,-3,7,7,7,7,7,7,7,7,7,7,0,-13,0,-13,0,-13,0,-13,0,-13,0,-65,0,0,0,0,0,-9,0,-13,0,-13,0,-13,0,0,0,0,0,-10,4,3,-12,4,3,-12,4,3,-10,10,-1,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-9,10,-2,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-11,10,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-11,11,4,3,-6,10,-5,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-10,11,-1,4,3,-5,10,-6,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-7,0,0,0,0,0,0,0,0,0,-5,0,-13,0,0,0,0,0,0,0,0,0,-13,0,-13,0,0,0,0,0,0,0,0,-6,0,0,-5,0,-6,0,0,-12,0,0,-12,0,0,-12,0,0,-11,6,0,0,-6,11,-5,0,0,-13,0,-13,0,-13,0,-1,0,-11,0,-1,0,-11,0,-1,0,-5,10,-4,10,0,-1,0,-11,0,-1,0,-11,0,-1,0,-11,0,-1,0,-3,10,-7,0,-1,0,-11,0,-1,0,-10,10,0,-1,0,-7,10,-3,0,-1,0,-5,0,0,0,0,0,0,0,-1,0,-5,0,-5,0,-6,8,0,-5,0,7,7,7,7,7,7,7,0,-5,0,5,5,5,5,5,5,5,0,-5,0,-7,0,-5,0,-7,0,-5,0,-7,0,-5,0,-7,0,-2,0,0,0,0,-7,0,0,0,0,-2,0,-12,8,0,7,7,7,7,7,7,7,0,0,0,0,0,0,-8,0,-13,0,-12,6,0,-13,0,-13,0,0,0,0,0,0,-14,5,5,5,5,5,5,5,5,5,5,5,5,5,5,-14,5,5,5,5,5,5,5,5,5,5,5,5,5,5,-14,5,5,5,5,5,5,5,5,5,5,5,5,5,5,-27,0,-14,5,5,5,5,5,5,5,5,5,5,0,0,0,0,-25,0,0,0,-14,5,5,5,5,5,5,5,5,0,0,0,0,0,0,-21,0,0,0,0,0,0,0,-14,5,5,5,5,0,0,0,0,0,0,0,0,0,0,-112,5,5,5,5,5,5,5,5,5,5,5,5,5,5,-45,5,5,5,5,-10,5,5,5,5,-10,5,5,5,5,-10,5,5,5,5,-105,0,0,0,0,0,0,0,0,5,5,5,5,0,0,0,0,0,0,0,0,0,0,-4,0,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0],
        tileTypes: [-13,0,-13,0,-13,0,-13,0,-13,0,-13,1,-13,1,-13,1,-13,1,-13,0,-13,0,-13,0,-13,0,-13,1,-4,0,0,-2,0,-4,1,-4,0,0,0,-1,0,-2,0,-1,1,-3,0,0,-8,1,-13,1,-13,1,-13,1,-13,1,-13,1,-5,0,0,0,0,0,0,0,0,0,-5,0,-7,0,-5,0,-7,0,-5,0,-7,0,-5,0,-7,0,3,3,3,3,3,0,-7,0,-6,0,-6,0,-6,0,-6,0,-6,0,-6,0,-6,0,-6,0,-6,0,-6,0,-6,0,-6,0,-6,0,-6,0,-5,6,0,-6,0,5,5,5,5,5,5,0,0,0,0,0,0,0,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-12,4,0,-13,0,-13,0,-22,3,3,3,3,3,-9,3,3,3,3,3,-9,3,3,3,3,3,-9,3,3,3,3,3,-28,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-50,3,3,3,3,3,0,-8,6,6,6,6,6,0,-3,5,5,5,5,5,5,5,5,5,5,0,-13,0,-13,0,-13,0,-13,0,-13,0,-65,0,0,0,0,0,-9,0,-13,0,-13,0,-13,0,0,0,0,0,-11,1,-13,1,-13,1,-10,7,-2,1,-13,1,-13,1,-13,1,-13,1,-9,7,-3,1,-13,1,-13,1,-13,1,-13,1,-13,1,-11,7,-1,1,-13,1,-13,1,-13,1,-13,1,-13,1,-13,1,-11,8,-1,1,-6,7,-6,1,-13,1,-13,1,-13,1,-13,1,-13,1,-13,1,-10,8,-2,1,-5,7,-7,1,-13,1,-13,1,-13,1,-13,1,-13,1,-13,1,-7,0,0,0,0,0,0,0,0,0,-5,0,-13,0,0,0,0,0,0,0,0,0,-13,0,-13,0,0,0,0,0,0,0,0,-6,0,0,-5,0,-6,0,0,-12,0,0,-12,0,0,-12,0,0,-11,4,0,0,-6,8,-5,0,0,-13,0,-13,0,-13,0,-1,0,-11,0,-1,0,-11,0,-1,0,-5,7,-4,7,0,-1,0,-11,0,-1,0,-11,0,-1,0,-11,0,-1,0,-3,7,-7,0,-1,0,-11,0,-1,0,-10,7,0,-1,0,-7,7,-3,0,-1,0,-5,0,0,0,0,0,0,0,-1,0,-5,0,-5,0,-6,6,0,-5,0,5,5,5,5,5,5,5,0,-5,0,3,3,3,3,3,3,3,0,-5,0,-7,0,-5,0,-7,0,-5,0,-7,0,-5,0,-7,0,-2,0,0,0,0,-7,0,0,0,0,-2,0,-12,6,0,5,5,5,5,5,5,5,0,0,0,0,0,0,-8,0,-13,0,-12,4,0,-13,0,-13,0,0,0,0,0,0,-14,3,3,3,3,3,3,3,3,3,3,3,3,3,3,-14,3,3,3,3,3,3,3,3,3,3,3,3,3,3,-14,3,3,3,3,3,3,3,3,3,3,3,3,3,3,-27,0,-14,3,3,3,3,3,3,3,3,3,3,0,0,0,0,-25,0,0,0,-14,3,3,3,3,3,3,3,3,0,0,0,0,0,0,-21,0,0,0,0,0,0,0,-14,3,3,3,3,0,0,0,0,0,0,0,0,0,0,-112,3,3,3,3,3,3,3,3,3,3,3,3,3,3,-45,3,3,3,3,-10,3,3,3,3,-10,3,3,3,3,-10,3,3,3,3,-105,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,-4,0,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0],
        enemies: [
            //[1, 5, 12],
        ],
        items: [
            [2,0,0],
            [1,82,7],
            [0,200,37],
            [0,281,37],
            [1,617,16],
            [1,662,4],
            [0,786,22],
            [1,832,37]
        ],
    },

    { // 1
        tileHeight: 3,
        tileWidth: 5,
        rows: 64,
        music: 1,
        tileImgs: blockPalettes[0],
        tiles: [-63,0,-119,0,-70,10,-19,0,-12,0,-3,10,-23,10,-34,0,-63,0,-53,0,-9,0,-87,0,-13,10,-3,10,-3,10,-3,10,-31,0,-44,0,-6,0,-14,0,-97,0,-132,0,-13,0,-70,0,-166,0,-154,0,-56,0,-131,10,10,10,10,],
        tileTypes: [-63,0,-119,0,-70,7,-19,0,-12,0,-3,7,-23,7,-34,0,-63,0,-53,0,-9,0,-87,0,-13,7,-3,7,-3,7,-3,7,-31,0,-44,0,-6,0,-14,0,-97,0,-132,0,-13,0,-70,0,-166,0,-154,0,-56,0,-131,7,7,7,7,],
        enemies: [],
        items: [],
        lavaSpeed: 10,
    },

    /*{ // blank level
        tileHeight: 3,
        tileWidth: 5,
        rows: 14,
        tileImgs: blockPalettes[0],
        tiles: [],
        tileTypes: [],
        enemies: [],
        items: [],
    },*/

    // old test levels
    /*{ // 0
        tileHeight: 3,
        tileWidth: 5,
        rows: 14,
        tileImgs: blockPalettes[0],
        tiles: [-9,0,0,0,0,0,-12,0,0,-13,0,-13,0,-12,4,3,-6,0,-5,4,3,-9,0,-2,4,3,-12,4,3,-8,0,-4,0,-2,1,-1,0,-2,6,0,-4,0,-8,0,-4,0,-11,0,4,3,-6,1,-5,4,3,-12,4,3,-10,0,-1,4,3,-7,0,-5,0,-13,0,-11,0,4,3,-8,0,-4,0,-12,4,3,-13,0,-13,0,-1,1,-1,0,-3,0,-2,0,-2,0,-4,0,0,0,-1,0,0,-1,0,0,0,-12,1,0,-13,5,-13,5,-13,5,-13,5,-13,5,-13,5,-11,5,5,5,-11,5,2,5],
        tileTypes: [-9,0,0,0,0,0,-12,0,0,-13,0,-13,0,-13,1,-6,0,-6,1,-9,0,-3,1,-13,1,-8,0,-4,0,-2,1,-1,0,-2,4,0,-4,0,-8,0,-4,0,-11,0,-1,1,-6,1,-6,1,-13,1,-10,0,-2,1,-7,0,-5,0,-13,0,-11,0,-1,1,-8,0,-4,0,-13,1,-13,0,-13,0,-1,1,-1,0,-3,0,-2,0,-2,0,-4,0,0,0,-1,0,0,-1,0,0,0,-12,1,0,-13,3,-13,3,-13,3,-13,3,-13,3,-13,3,-11,3,3,3,-11,3,2,3,],
        enemies: [
            [0, 35, 27],
        ],
        items: [
            [0, 5, 3],
            [0, 10, 3],
            [1, 15, 3],
        ],
    },

    { // 1
        tileHeight: 3,
        tileWidth: 5,
        rows: 14,
        tileImgs: blockPalettes[0],
        tiles: [-13,0,-13,0,-13,0,-13,0,-9,0,-3,0,-13,0,-13,0,0,0,0,0,0,0,0,0,0,0,0,0,4,3,0,0,0,0,0,-1,0,0,0,0,0,0,4,3,0,-10,0,-1,0,-5,0,-6,4,3,-5,0,-3,0,0,0,0,0,-5,0,-6,4,3,-5,0,0,0,0,-3,4,3,-12,4,3,-12,4,3,-12,4,3,-8,0,-3,4,3,-12,4,3,-12,4,3,-12,4,3,-12,4,3,-10,0,-1,4,3,-12,4,3,-12,4,3,-12,4,3,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0],
        tileTypes: [-13,0,-13,0,-13,0,-13,0,-9,0,-3,0,-13,0,-13,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,1,0,0,0,0,0,-1,0,0,0,0,0,0,-1,1,0,-10,0,-1,0,-5,0,-7,1,-5,0,-3,0,0,0,0,0,-5,0,-7,1,-5,0,0,0,0,-4,1,-13,1,-13,1,-13,1,-8,0,-4,1,-13,1,-13,1,-13,1,-13,1,-10,0,-2,1,-13,1,-13,1,-13,1,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0,-13,0],
        enemies: [],
        items: [
            [0, 5, 37],
        ],
    }*/
];



canvas.innerHTML = '';
function createBlankCanvas() {
    let newCanvas = '';
    for (let y = 0; y < canvasSizeY; y++) {
        for (let x = 0; x < canvasSizeX; x++) {
            newCanvas += ' ';
        }
        newCanvas += '<br>';
    }
    return newCanvas;
}

const blankCanvas = createBlankCanvas();
canvas.innerHTML = blankCanvas;
canvas.style.maxWidth = canvasSizeX + "ch"
var str = blankCanvas;



const enemyTypes = [
    { // 0 - idk what this is
        ai: 0,
        w: 2,
        h: 2,
        kills: true,
        imgList: { moveLeft: " OO\nOOO\n OO", moveRight: "OO\nOOO\nOO" },
    },

    { // 1 - smear block
        ai: 1,
        w: 4,
        h: 2,
        kills: false,
        imgList: {idle: txtrs.smearBlock},
        defaultImgIndex: "idle",
    }
]

class enemy {
    constructor(id) {
        let g = enemyTypes[id];
        this.ai = g.ai;
        this.w = g.w;
        this.h = g.h;
        this.kills = g.kills;
        this.imgList = g.imgList;

        this.x = 0;
        this.y = 0;
        this.xv = 0;
        this.yv = 0;
        this.img = g.imgList[g.defaultImgIndex] || "k";
        this.birthTick = tickId;
        this.dead = false;
    }
};

const itemTypes = [
    { // 0 - hammer
        use: 0,
        w: 2,
        h: 1,
        name: "hammer",
        imgList: { idleLeft: txtrs.hammer, idleRight: txtrs.hammer, jumpLeft: [3, "H''\n \"\\\n", "\n  \\,\n ..H"], jumpRight: [3, " ''H\n  /\"\n", "\n,/ \nH.."] },
    },
    { // 1 - axe
        use: 1,
        w: 1,
        h: 1,
        name: "axe",
        imgList: { idleLeft: "(=\n |", idleRight: "=)\n|", moveLeft: txtrs.axeChopLeft, moveRight: txtrs.axeChopRight },
    },
    { // 2 - dash item
        use: 2,
        w: 0,
        h: 0,
        name: "dash item",
        imgList: {idleLeft: txtrs.dashItem, idleRight: txtrs.dashItem}
    }
]

class item {
    constructor(id) {
        let g = itemTypes[id];
        this.use = g.use;
        this.w = g.w;
        this.h = g.h;
        this.name = g.name;
        this.imgList = g.imgList;
        
        this.x = 0;
        this.y = 0;
        this.xv = 0;
        this.yv = 0;
        this.img = "k";
        this.held = false;
        this.using = false;
        this.animStartTime = 0;
        this.lastUse = -2147483648;
        this.collides = true;
        this.dead = false;
    }
}

// variables relating to editor mode

var typedSelection = "";

// various functions

function canvasInsert(x, y, txt) {
    if (x + txt.length > canvasSizeX) {
        txt = txt.substring(0, canvasSizeX - x);
    }

    if (x < 0) {
        txt = txt.substring(-x, txt.length);
        x = 0;
    }

    if (y < 0) {
        txt = '';
    }

    if (y >= canvasSizeY) {
        txt = '';
    }

    if (txt.trimStart().length < txt.length) {
        x += txt.length - txt.trimStart().length;
        txt = txt.trimStart();
    }
    
    str = str.substring(0, x + y * (canvasSizeX + 4)) + txt + str.substring(x + y * (canvasSizeX + 4) + txt.length, str.length);
}

function drawImg(x, y, img, ymin, ymax) {
    ymin ||= 0;
    ymax ||= canvasSizeY;
    let txts = img.split('\n');

    for (let i = 0; i < txts.length; i++) {
        if (y + i >= ymin && y + i <= ymax) {
            canvasInsert(x, y + i, txts[i], str);
        }
    }
}

function animate(animation, startTick) {
    if (typeof animation === "object") {
        let animAge = frameId - startTick;
        return animation[Math.floor(animAge/animation[0] - Math.floor(animAge/animation[0]/(animation.length-1))*(animation.length-1)) + 1]; // I didn't know that modulo existed when I wrote this so I re-invented floored modulo lol
    }
    return animation;
}

function tileTextureAtGridPosition(gridX, gridY) {
    return tileSet.tiles[gridX*tileSet.rows + gridY];
}

function tileTypeAtGridPosition(gridX, gridY) {
    return tileSet.tileTypes[gridX*tileSet.rows + gridY];
}

function tileAtPosition(x, y) {
    return [Math.floor(x/tileSet.tileWidth), Math.floor(y/tileSet.tileHeight)];
}

function decompressTileArray(array) {
    let newArray = [];

    for (let t = 0; t < array.length; t++) {
        if (array[t] < 0) {
            for (let i = 0; i < -array[t]; i++) {
                newArray.push(-1);
            }
        } else {
            newArray.push(array[t]);
        }
    }
    return newArray;
}

function compressTileArray(array) {
    let newArray = [];
    for (let t = 0; t < array.length; t++) {
        if (newArray.length > 0 && array[t] < 0 && newArray[newArray.length - 1] < 0) {
            newArray[newArray.length - 1] += array[t];
        } else {
            newArray.push(array[t]);
        }
    }
    return newArray;
}

function loadTiles(num) {
    tileSet = {tiles: [], tileTypes: []};

    tileSet.tileHeight = levels[num].tileHeight;
    tileSet.tileWidth = levels[num].tileWidth;
    tileSet.rows = levels[num].rows;
    tileSet.tileImgs = levels[num].tileImgs;

    tileSet.tiles = decompressTileArray(levels[num].tiles);

    tileSet.tileTypes = decompressTileArray(levels[num].tileTypes);
}

var levelId = 0;
var tileSet = levels[levelId];

var plrX = 0;
var plrY = 0;

var camX = 0;
var camY = 0;

var downPressed = false;
var upPressed = false;
var rightPressed = false;
var leftPressed = false;
var sPressed = false;
var wPressed = false;
var dPressed = false;
var aPressed = false;
var spacePressed = false;
var spaceJustPressed = false;

var upPressedLastTick = false;
var lastUpPress = -1000;

var pressed = document.createEvent("KeyboardEvent");
pressed.initEvent("keydown");
dispatchEvent(pressed);

function justPressed(btnName) {
    return (lastPressOfBtns[btnName] == frameId)
}

addEventListener('keydown', function (pressed) {
    //console.log(pressed.key);


    for (let i = 0; i < keybinds.length; i++) {
        //console.log(keybinds[i].indexOf(pressed));
        //console.log(pressed.key);
        if (keybinds[i].indexOf(pressed.key) != -1) {
            //console.log(pressed.key);
            pressedBtns[keybindNames[i]] = true;
            lastPressOfBtns[keybindNames[i]] = frameId;
        }
    }

    //console.log(pressedBtns);

    if (pressed.key === "ArrowDown") {
        //downPressed = true;
        if (mode === -1) {
            plrY+= tileSet.tileHeight;
        }
    }
    if (pressed.key === "ArrowUp") {
        //upPressed = true;
        if (mode === -1) {
            plrY-= tileSet.tileHeight;
        }
    }
    if (pressed.key === "ArrowRight") {
        //rightPressed = true;
        if (mode === -1) {
            plrX+= tileSet.tileWidth;
        }
    }
    if (pressed.key === "ArrowLeft") {
        //leftPressed = true;
        if (mode === -1) {
            plrX-= tileSet.tileWidth;
        }
    }
    /*if (pressed.key === "s") {
        sPressed = true;
    }
    if (pressed.key === "w") {
        wPressed = true;
    }
    if (pressed.key === "d") {
        dPressed = true;
    }
    if (pressed.key === "a") {
        aPressed = true;
    }
    if (pressed.key === " ") {
        spacePressed = true;
        spaceJustPressed = true;
    }*/
    if (mode === -1) {
        if (pressed.key === "p") {
            let tile = tileAtPosition(plrX, plrY)
            if (tileSet.tiles.length < tile[0] * tileSet.rows + tile[1]) {
                while (tileSet.tiles.length < tile[0] * tileSet.rows + tile[1]) {
                    console.log("get longer");
                    tileSet.tiles.push(-1);
                    tileSet.tileTypes.push(-1);
                }
            }
            tileSet.tiles[tile[0] * tileSet.rows + tile[1]] = placeTile;
            tileSet.tileTypes[tile[0] * tileSet.rows + tile[1]] = placeTileType;
        }
        if (pressed.key === "x") {
            let tile = tileAtPosition(plrX, plrY)
            tileSet.tiles[tile[0] * tileSet.rows + tile[1]] = -1;
            tileSet.tileTypes[tile[0] * tileSet.rows + tile[1]] = -1;
        }
        if (pressed.key === "k") {
            let thepress = '';
            let compressed = compressTileArray(tileSet.tiles);
            for (let c = 0; c < compressed.length; c++) {
                thepress += compressed[c] + ',';
            }
            console.log(thepress);
            thepress = '';
            compressed = compressTileArray(tileSet.tileTypes)
            for (let c = 0; c < compressed.length; c++) {
                thepress += compressed[c] + ',';
            }
            console.log(thepress);
        }
        if (pressed.key === "n") {
            if (levelId + 1 >= levels.length) {
                setLevel(0, true);
            } else {
                setLevel(levelId + 1, true);
            }
        }
        
        if (pressed.key === "Escape") {
            paused = ! paused;
        }
    }
    if (editor) {
        if (pressed.key === "t") {
            if (mode === 0) {
                mode = -1;
                let oldX = plrX;
                let oldY = plrY;
                setLevel(levelId);
                plrX = Math.round(oldX/tileSet.tileWidth)*tileSet.tileWidth;
                plrY = Math.round(oldY/tileSet.tileHeight)*tileSet.tileHeight;
            } else if (mode === -1) {
                mode = 0;
            }
        }
        if (pressed.key === "u") {
            levels[levelId].tiles = tileSet.tiles.slice();
            levels[levelId].tileTypes = tileSet.tileTypes.slice();
        }
        if (pressed.key === "c" || pressed.key === "v") {
            typedSelection = "";
        }
    }
});

var lifted = document.createEvent("KeyboardEvent");
lifted.initEvent("keyup");
dispatchEvent(lifted);

addEventListener("keyup", function (lifted) {

    for (let i = 0; i < keybinds.length; i++) {
        //console.log(i);
        if (keybinds[i].indexOf(lifted.key) > -1) {
            pressedBtns[keybindNames[i]] = false;
        }
    }

    /*if (lifted.key === "ArrowDown") {
        downPressed = false;
    }
    if (lifted.key === "ArrowUp") {
        upPressed = false;
    }
    if (lifted.key === "ArrowRight") {
        rightPressed = false;
    }
    if (lifted.key === "ArrowLeft") {
        leftPressed = false;
    }
    if (lifted.key === "s") {
        sPressed = false;
    }
    if (lifted.key === "w") {
        wPressed = false;
    }
    if (lifted.key === "d") {
        dPressed = false;
    }
    if (lifted.key === "a") {
        aPressed = false;
    }
    if (lifted.key === " ") {
        spacePressed = false;
    }*/

    if (lifted.key === "c") {
        let typedNumber = Number(typedSelection);
        console.log(typedNumber);
        if (typedSelection != "" && Number.isFinite(typedNumber)) {
            placeTile = typedNumber;
        } else {
            placeTile++;
        }
        if (placeTile >= blockPalettes[0].length) {
            placeTile = 0;
        }
        typedSelection = "";
    } else if (lifted.key === "v") {
        let typedNumber = Number(typedSelection);
        if (typedSelection != "" && Number.isFinite(typedNumber)) {
            placeTileType = typedNumber;
        } else {
            placeTileType++;
        }
        if (placeTileType >= blockTypeNames.length) {
            placeTileType = -1;
        }
        typedSelection = "";
    } else {
        typedSelection += lifted.key;
    }
});






var editTiles = tileSet.tiles;
var editTileTypes = tileSet.tileTypes;

function destroyBlock(x,y) {
    tileSet.tileTypes[x*tileSet.rows + y] = -1;
    if (y < tileSet.rows && tileSet.tiles[x*tileSet.rows + y - 1] == 3) {
        tileSet.tiles[x*tileSet.rows + y] = 4;
    } else {
        tileSet.tiles[x*tileSet.rows + y] = -1;
    }
}

function openDoor(x) {
    for (let y = 0; y < tileSet.rows; y++) {
        if (tileSet.tileTypes[x*tileSet.rows + y] == 5) {
            destroyBlock(x,y);
        }
    }
}

function tileCollisions(posX, posY, width, height, toBreak, plrInteract) {
    let corner1 = tileAtPosition(posX, posY);
    let corner2 = tileAtPosition(posX + width, posY + height);
    let touchingTypes = [];

    toBreak ||= [];

    for (let x = corner1[0]; x <= corner2[0]; x++) {
        for (let y = corner1[1]; y <= corner2[1]; y++) {

            let tileIndex = y + x * tileSet.rows;
            let touchedTile = tileSet.tiles[tileIndex];
            let touchedTileType = tileSet.tileTypes[tileIndex];

            if (y >= 0 && y < tileSet.rows && ! touchingTypes.includes(tileSet.tileTypes[tileIndex])) {

                if (plrInteract && tileSet.tileTypes[tileIndex] === 4) {
                    spawnX = x*tileSet.tileWidth;
                    spawnY = y*tileSet.tileHeight;
                }
                if (plrInteract) {
                    switch(touchedTileType) {
                        case 4:
                            spawnX = x*tileSet.tileWidth;
                            spawnY = y*tileSet.tileHeight;
                            break;
                        case 10:
                            if (Math.round(plrY) % tileSet.tileHeight == tileSet.tileHeight - plrHitboxY - 1) {
                                tileSet.tileTypes[tileIndex] = -1;
                                tileSet.tiles[tileIndex] = -1;
                                openDoor(x + 1);
                            }
                            break;
                        default:
                            break;
                    }
                }

                touchingTypes.push(tileSet.tileTypes[y + x*tileSet.rows]);

                if (toBreak.includes(tileSet.tileTypes[y + x * tileSet.rows])) {
                    if (touchedTileType == 6) {
                        tileSet.tileTypes[y + x * tileSet.rows] = 0;
                        tileSet.tiles[y + x * tileSet.rows] = 9;
                        openDoor(x + 1);
                    } else if (tileSet.tileTypes[y + x * tileSet.rows] == 8) {
                        destroyBlock(x,y);
                        allEnemies.push(new enemy(1));
                        allEnemies[allEnemies.length - 1].x = x*tileSet.tileWidth;
                        allEnemies[allEnemies.length - 1].y = y*tileSet.tileHeight;
                        //console.log(allEnemies);
                    } else {
                        tileSet.tileTypes[y + x * tileSet.rows] = -1;
                        tileSet.tiles[y + x * tileSet.rows] = -1;
                    }
                }
            }
        }
    }

    return touchingTypes;
}

function touchingSolid(posX, posY, width, height, canWalkOnDeathBlocks) {

    if (posX < 0 || posX > Math.ceil(tileSet.tiles.length/tileSet.rows)*tileSet.tileWidth - width - 1) {
        return true;
    }

    let touchingTypes = tileCollisions(posX, posY, width, height);

    for (let s = 0; s < solidBlockTypes.length; s++) {
        if (touchingTypes.includes(solidBlockTypes[s])) {
            return true;
        }
    }
    if (canWalkOnDeathBlocks && touchingTypes.includes(1)) {
        return true;
    }
    return false;
}

function plrTouchingSolid(canWalkOnDeathBlocks) {
    canWalkOnDeathBlocks ||= false;
    touchingSolid(plrX, Math.round(plrY), plrHitboxX, plrHitboxY, canWalkOnDeathBlocks);
}

function hitboxesOverlapping(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (x1 + w1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 <= y2 + h2);
}

function itemTick(item) {

    if (item.dead) {
        img = "";
        return;
    }

    if (item.img === "k") {
        item.img = item.imgList.idleRight;
    }

    if (tileCollisions(item.x - 1, item.y - 1, item.w + 2, item.h + 2, [6]).includes(6)) {
        if (item.held) {
            holdingItem = false;
        }
        item.dead = true;
        item.img = "";
        return;
    }

    if (item.held) {
        item.yv = 0;
        item.x = plrX;
        if (facing < 0) {
            item.x -= (item.w + 1);
            item.img = item.imgList.idleLeft;
        } else {
            item.x += plrHitboxX + 1;
            item.img = item.imgList.idleRight;
        }

        item.y = plrY - 1;
        
        if (pressedBtns.dropItem) { // drop the item
            item.held = false;
            holdingItem = false;

            if (item.collides && touchingSolid(item.x, Math.round(item.y), item.w, item.h)) { // prevent from getting stuck in wall
                while (touchingSolid(item.x, Math.round(item.y), item.w, item.h)) {
                    item.x -= facing;
                }
            }
        } else if (justPressed("useItem") && !item.using) {
            //console.log("start using");
            item.lastUse = frameId;
            item.using = true;
            //spaceJustPressed = false;
            if (item.use === 0) {
                item.w = 3;
                item.h = 2;
            } else if (item.use === 1) {
                item.w = 2;
                item.h = 2;
            }
        }
    } else if (mode === 0) {
        if (! (item.collides && touchingSolid(item.x, item.y + 1, item.w, item.h))) {
            item.yv += 0.125;
            if (item.yv > 2); {
                //item.yv = 2;
            }

            item.y += item.yv;
            
            if (item.collides && touchingSolid(item.x, Math.round(item.y), item.w, item.h) && item.yv !== 0) {
                item.y = Math.floor(item.y);
                while (touchingSolid(item.x, item.y, item.w, item.h)) {
                    item.y -= Math.sign(item.yv);
                }
                item.yv = 0;
            }

            if (item.collides && touchingSolid(item.x + item.xv, item.y, item.w, item.h)) {
                item.xv = 0;
            } else {
                item.x += item.xv;
            }
        }
        
        if (justPressed("useItem") && (! holdingItem) && (item.using === false || (patched === false && item.use === 0)) && hitboxesOverlapping(item.x - 1, item.y - 1, item.w + 2, item.h + 2, plrX, plrY, plrHitboxX, plrHitboxY)) {
            item.held = true;
            holdingItem = true;
            item.xv = 0;
            item.yv = 0;
        }
    }

    if (item.using) {
        switch(item.use) {
            case 0:
                if (item.animStartTime === 0) {
                    item.animStartTime = frameId;
                    item.xv = facing*2;
                    item.yv = -1;
                    item.h = 2;
                    item.w = 3;
                    item.y -= 1;
                    item.held = false;
                    holdingItem = false;
                    item.collides = false;
                    if (facing < 0) {
                        item.x -= 2;
                    }
                }

                if (item.xv < 0) {
                    item.img = item.imgList.jumpLeft;
                } else {
                    item.img = item.imgList.jumpRight;
                }

                for (let i = 0; i < allEnemies.length; i++) {
                    if (hitboxesOverlapping(item.x, item.y, item.w, item.h, allEnemies[i].x, allEnemies[i].y, allEnemies[i].w, allEnemies[i].h)) {
                        allEnemies[i].dead = true;
                    }
                }

                tileCollisions(item.x, item.y, item.w, item.h, [3]);
                break;
            case 1:
                if (frameId === item.lastUse) {
                    item.w = 2;
                    item.h = 2;
                }

                if (frameId - item.lastUse <= 3) {
                    item.w = 2;
                    item.h = 2;
                    if (facing < 0) {
                        item.img = item.imgList.moveLeft;
                    } else {
                        item.img = item.imgList.moveRight;
                    }

                    tileCollisions(item.x, item.y, item.w, item.h, [3]);

                    for (let i = 0; i < allEnemies.length; i++) {
                        if (hitboxesOverlapping(item.x, item.y, item.w, item.h, allEnemies[i].x, allEnemies[i].y, allEnemies[i].w, allEnemies[i].h)) {
                            allEnemies[i].dead = true;
                        }
                    }
                } else {
                    item.w = 1;
                    item.h = 1;
                    if (frameId - item.lastUse >= 10) {
                        item.using = false;
                    }
                }
                break;
            case 2:
                if (justPressed("useItem")) {
                    dashDirec = facing;
                    holdingItem = false;
                    item.img = '';
                    item.dead = true;
                }
                break;
            default:
                break;
        }
    }

    if (item.held) {
        item.yv = 0;
        item.x = plrX;
        if (facing < 0) {
            item.x -= (item.w + 1);
        } else {
            item.x += plrHitboxX + 1;
        }
    }
}

function enemyTick(enemy) {

    if (enemy.dead) {
        enemy.img = "";
        return;
    }
    switch(enemy.ai) {
        case 0:
            if (enemy.xv == 0) {
                enemy.xv = 1;
                enemy.img = enemy.imgList.moveRight;
            }

            if (touchingSolid(enemy.x + enemy.xv, enemy.y, enemy.w, enemy.h)) {
                enemy.xv *= -1;
                if (enemy.xv > 0) {
                    enemy.img = enemy.imgList.moveRight;
                } else if (enemy.xv < 0) {
                    enemy.img = enemy.imgList.moveLeft;
                }
            }
            break;
        case 1:
            if (enemy.birthTick == tickId) {
                enemy.yv = -1;
            } else if ((enemy.y)%tileSet.tileHeight == 0) {
                enemy.yv = 0;
                //enemy.img = txtrs.noJump;
            }
            if (tickId - enemy.birthTick >= 2) {
                let i = Math.floor(enemy.y/tileSet.tileHeight) + Math.floor(enemy.x/tileSet.tileWidth)*tileSet.rows;
                tileSet.tileTypes[i] = 7;
                tileSet.tiles[i] = 10;
                enemy.dead = true;
            }
            break;
        default:
            break;
    }
    if (enemy.ai === 0) {
        
    } else if (enemy.ai == 1) {
        
    }

    if (mode === 0) {
        enemy.x += enemy.xv;
        enemy.y += enemy.yv;
    }

    if (enemy.kills && mode === 0) {
        if (hitboxesOverlapping(plrX, plrY, plrHitboxX, plrHitboxY, enemy.x, enemy.y, enemy.w, enemy.h)) {
            dead = true;
        }
    }
}

function setLevel(num, isNew) {
    let thisLvl = levels[num];

    levelId = num;
    holdingItem = false;
    //tileSet = levels[levelId];
    
    plrVelY = 0;
    allEnemies = thisLvl['enemies'].slice();
    //allItems = levels[num]['items'].slice();

    allEnemies = [];
    for (let c = 0; c < thisLvl.enemies.length; c++) {
        allEnemies.push(new enemy(thisLvl.enemies[c][0]));
        allEnemies[allEnemies.length-1].x = thisLvl.enemies[c][1];
        allEnemies[allEnemies.length-1].y = thisLvl.enemies[c][2];
        //console.log(allEnemies);
    }
    if (patched) {
        allItems = [];
    } else {
        let spared = [];
        for (let i = 0; i < allItems.length; i++) {
            if (allItems[i].using) {
                spared.push(allItems[i]);
            }
        }
        allItems = spared;
    }
    for (let c = 0; c < thisLvl.items.length; c++) {
        allItems.push(new item(thisLvl.items[c][0]));
        allItems[allItems.length-1].x = thisLvl.items[c][1];
        allItems[allItems.length-1].y = thisLvl.items[c][2];
    }

    loadTiles(num);

    if (isNew) {
        //console.log("new level");
        console.log(nsfPlayer.play("./nsf-player-master/music.nsf", thisLvl.music || 0));
        for (let sel = 0; sel < tileSet.tileTypes.length; sel++) {

            if (tileSet.tileTypes[sel] === -1 && tileSet.tileTypes[sel+1] === 0) {
                spawnX = Math.floor(sel/tileSet.rows)*tileSet.tileWidth;
                spawnY = (sel - tileSet.rows*Math.floor(sel/tileSet.rows))*tileSet.tileHeight;
                break;
            }
        }
    }

    if (thisLvl.lavaSpeed && mode != -1) {
        lavaY = spawnY + 5; 
    }
    

    plrY = spawnY;
    plrX = spawnX;

    if (mode !== -1) {
        plrY++;
    }
}

function onTick() { /////////////////////////// THE ONTICK FUNCTION

    for (let i = 0; i < keybindNames.length; i++) {
        let keybindName = keybindNames[i]
        if (pressedBtns[keybindName]) {
            lastWasDownOfBtns[keybindName] = frameId
        }
    }

    let thisLvl = levels[levelId];

    if (thisLvl.lavaSpeed && frameId%thisLvl.lavaSpeed == 0 && mode != -1) {
        lavaY--;
    }

    if (dead) {
        plrY = 0;
        plrX = 0;
        plrVelY = 0;
        dashDirec = 0;
        dead = false;
        setLevel(levelId, false);
    }
    let jump = false;
    if (mode === 0) {

        let plrDirecX = 0;
        let plrDirecY = 0;
        //let jump = false;

        if (dashDirec == 0) {
            if (pressedBtns.moveLeft) {
                plrDirecX--;
            }
            if (pressedBtns.moveRight) {
                plrDirecX++;
            }
        } else {
            plrDirecX = dashDirec;
        }

        
        if (pressedBtns.jump) {
            plrDirecY--;
            jump = true;
            if (! upPressedLastTick) { // fixthis
                lastUpPress = frameId;
            }
        }

        if (plrDirecX !== 0) {
            facing = plrDirecX;
        }

        /*if (! touchingSolid(plrX, plrY + plrDirecY, 0, 0)) {
            plrY += plrDirecY;
        }*/

        let isDashing = (Math.abs(dashDirec) > 0);

        plrX += (plrDirecX + dashDirec);

        if (touchingSolid(plrX, Math.round(plrY), plrHitboxX, plrHitboxY)) {
            do {
                plrX -= Math.sign(plrDirecX);
            } while (touchingSolid(plrX, Math.round(plrY), plrHitboxX, plrHitboxY));
            dashDirec = 0;
        }

        /*if (! touchingSolid(plrX + plrDirecX, Math.round(plrY), plrHitboxX, plrHitboxY)) {
            plrX += plrDirecX;
            if (plrX < 0) {
                plrX = 0;
            }
            if (plrX > Math.ceil(tileSet.tiles.length/tileSet.rows)*tileSet.tileWidth - plrHitboxX - 1) {
                plrX = Math.ceil(tileSet.tiles.length/tileSet.rows)*tileSet.tileWidth - plrHitboxX - 1;
            }
        }*/


        plrY += plrVelY;
        if (touchingSolid(plrX, Math.round(plrY), plrHitboxX, plrHitboxY, isDashing)) { // if hit floor or ceiling
            //plrY -= plrVelY;
            plrY = Math.floor(plrY)
            let up = 0;
            while (touchingSolid(plrX, Math.round(plrY), plrHitboxX, plrHitboxY, isDashing) && up < 4) {
                //console.log("this");
                plrY-= Math.sign(plrVelY);
                up++;
            }
            if (touchingSolid(plrX, Math.round(plrY), plrHitboxX, plrHitboxY, isDashing)) {
                dead = true;
            } else {
                plrVelY = 0;
            }
        }
        if (touchingSolid(plrX, Math.floor(plrY) + 1, plrHitboxX, plrHitboxY, isDashing)) { // if on ground
            lastOnGround = frameId;
            if (frameId - lastUpPress <= 3 && frameId - lastJump > 3) {
                plrVelY = -jumpPower;
                lastJump = frameId;
                tileCollisions(plrX, plrY+plrHitboxY,plrHitboxX,3,[7,8]);
                //console.log("jump")
            }
            if (facing < 0) {
                plrSprite = "(.. )\n /*/\n  ..";
            } else if (facing > 0) {
                plrSprite = "( ..)\n \\*\\\n ..";
            }

            if (plrY - camY < 18) {
                camY--;
            } else if (plrY - camY > 22) {
                camY++;
            }
        } else { // if mid-air
            plrVelY += 0.125;
            if (plrVelY > 2) {
                plrVelY = 2;
            } else if (plrVelY < 0 && ! (jump)) {
                if (plrVelY < -0.5) {
                    plrVelY += 0.5;
                } else {
                    plrVelY = 0;
                }
            }

            if (frameId - lastOnGround <= 3 && plrVelY >= 0 && frameId - lastUpPress <= 3 && frameId - lastJump > 3) {
                if (patched) {
                    tileCollisions(plrX - facing*2 , plrY+plrHitboxY,plrHitboxX - facing*2,1,[7,8]);
                } else {
                    tileCollisions(plrX - facing*3 , plrY+plrHitboxY,plrHitboxX - facing*3,1,[7,8]);
                }
                //console.log("coyote jump");
                //console.log(facing);
                plrVelY = -jumpPower;
                lastJump = frameId;
            }
            if (plrVelY <= 0) {
                if (facing < 0) {
                    plrSprite = "('' )\n /*/\n ' .";
                } else if (facing > 0) {
                    plrSprite = "( '')\n \\*\\\n . '";
                }
            } else {
                if (facing < 0) {
                    plrSprite = "(.. )\n /*/\n ' .";
                } else if (facing > 0) {
                    plrSprite = "( ..)\n \\*\\\n . '";
                }
            }
        }
        
        let tileCollisionsRn = tileCollisions(plrX, Math.round(plrY), plrHitboxX, plrHitboxY, [], true);
        if (tileCollisionsRn.includes(1) || (tileCollisionsRn.includes(9) && plrX%tileSet.tileWidth == 0) || plrY >= tileSet.rows*tileSet.tileHeight - plrHitboxY || plrY + plrHitboxY >= lavaY) {
            dead = true;
        } else if (levelId < levels.length - 1 && tileCollisions(plrX, Math.round(plrY), plrHitboxX, plrHitboxY).includes(2)) {
            setLevel(levelId + 1, true)
        }

        
    }

    if (plrX - camX > Math.round(3/5*canvasSizeX)) {
        camX = plrX - Math.round(3/5*canvasSizeX);
    }
    if (plrX - camX < Math.round(2/5*canvasSizeX)) {
        camX = plrX - Math.round(2/5*canvasSizeX);
    }
    if (camX > Math.ceil(tileSet.tiles.length/tileSet.rows)*tileSet.tileWidth - canvasSizeX && mode !== -1) {
        camX = Math.ceil(tileSet.tiles.length/tileSet.rows)*tileSet.tileWidth - canvasSizeX;
    }
    if (camX < 0) {
        camX = 0;
    }

    if (plrY - camY > Math.round(3/5*canvasSizeY)) {
        camY = Math.round(plrY) - Math.round(3/5*canvasSizeY);
    }
    if (plrY - camY < Math.round(1/5*canvasSizeY)) {
        camY = Math.round(plrY) - Math.round(1/5*canvasSizeY);
    }
    if (camY > tileSet.rows * tileSet.tileHeight - canvasSizeY) {
        camY = tileSet.rows * tileSet.tileHeight - canvasSizeY;
    }
    if (camY < 0) {
        camY = 0;
    }
    

    canvas.innerHTML = blankCanvas;

    let selX = 0;
    let selY = 0;

    if (thisLvl.lavaSpeed) {
        for (let x = 0; x < canvasSizeX; x += thisLvl.tileWidth) {
            drawImg(x, lavaY - thisLvl.tileHeight - camY, animate(thisLvl.tileImgs[4], 0));
        }
    }

    for (let i = 0; i < tileSet.tiles.length; i++) {
        
        if (tileSet.tiles[i] > -1) {
            drawImg(selX * tileSet.tileWidth - camX, selY * tileSet.tileHeight - camY, animate(tileSet.tileImgs[tileSet.tiles[i]], 0), 0, lavaY - camY);
        }
        
        selY++;
        if (selY >= tileSet.rows) {
            selY = 0;
            selX++;
        }
    }

    if (thisLvl.lavaSpeed) {
        for (let x = 0; x < canvasSizeX; x += thisLvl.tileWidth) {
            drawImg(x, lavaY - camY, animate(thisLvl.tileImgs[3], 0));
        }
    }

    for (let i = 0; i < allEnemies.length; i++) {
        enemyTick(allEnemies[i]);
        drawImg(allEnemies[i].x - camX, allEnemies[i].y - camY, allEnemies[i].img);
    }
    if (mode === -1) {
        drawImg(plrX - camX, Math.round(plrY) - camY, animate(blockPalettes[0][placeTile], 0));
    } else {
        drawImg(plrX - camX, Math.round(plrY) - 1 - camY, plrSprite);
    }

    for (let i = 0; i < allItems.length; i++) {
        itemTick(allItems[i]);
        drawImg(allItems[i].x - camX, Math.round(allItems[i].y) - camY, animate(allItems[i].img, allItems[i].animStartTime, 0));
    }

    canvas.innerHTML = str;

    if (mode === -1) {
       debug.innerHTML = "<br>Placing: " + (blockTypeNames[placeTileType] || "untouchable block") + "<br><br>[P]: place tile, [X]: remove tile, [K]: print tile set, [C]: change placing tile image, [V]: change placing tile type,<br>[N]: next level";
    }
    

    

    //console.log(allItems);

    frameId++;
    if (! paused) {
        tickId++;
    }
    
    upPressedLastTick = jump;
    spaceJustPressed = false;
    str = blankCanvas;
}



setLevel(levelId, true);
setInterval(onTick, 1000 / fps);

/*
int main{
    #include <iostream>
    #include <string>

    using namespace std;

    int poopoo;
    string peepee;

    cout >> "how poopoo are you???" >> endl;
    cin << poopoo;

    switch (poopoo){
     case 0
         cin << peepee;
            break;
      case 1
          cout >> "you smeel soo  bad." >> endl;
          poopoo++
        case 2
           cout >> "ohmgee soo smeally! !@" >> endl;
            break;
       default
           cout >> "hi." >> endl;
    }
}
*/
const BGS_NUMBER = 16;
const HIDDENS_NUMBER = 11;
const BORDER = 20;

for (let i = 1; i <= BGS_NUMBER; i++) {
    loadSprite("bg" + i, "gfx/bg" + i + ".jpg");
}
for (let i = 1; i <= HIDDENS_NUMBER; i++) {
    loadSprite("hidden" + i, "gfx/hidden" + i + ".jpg");
}

loadSound("success", "sfx/success.wav");
loadSound("victory", "sfx/victory.ogg");
loadSound("wrong", "sfx/wrong.ogg");

scene("main", (hiScore = 0, carryOverScore = 0, multiplier = 1) => {
    let waiting = false;
    let victory = false;
    let cardIsActive = null;
    let score = carryOverScore;

    layers([
        "bg",
        "game",
        "ui",
    ], "game")

    /**
     * UI
     */
    const scoreLabel = add([
        text(String(0).padStart(10, 0)),
        layer("ui"),
        pos(width() - 5, 5),
        color(255, 255, 255),
        origin("topright"),
        "scoreLabel"
    ]);
    const hiScoreLabel = add([
        text("HI " + String(hiScore).padStart(10, 0)),
        layer("ui"),
        pos(5, 5),
        color(255, 255, 255),
        origin("topleft"),
        "hiScoreLabel",
    ]);
    onUpdate("scoreLabel", () => {
        scoreLabel.text = String(score).padStart(10, 0);
        if (score > hiScore) {
            hiScore = score;
            try {
                localStorage.setItem('hiscore', hiScore);
            } catch { }
        }
        hiScoreLabel.text = "HI " + String(hiScore).padStart(10, 0);
    });
    add([
        text("RESET"),
        layer("ui"),
        pos(5, height() - 5),
        area(),
        color(255, 255, 255),
        origin("botleft"),
        "resetLabel",
    ]);
    onClick("resetLabel", () => {
        reset();
    })
    onUpdate("resetLabel", (resetLabel) => {
        if (victory) {
            resetLabel.text = "PLAY AGAIN";
        } else {
            resetLabel.text = "RESET";

        }
    });
    const sfxLabel = add([
        text(muted ? "MUTED" : "SFX"),
        layer("ui"),
        pos(width() - 5, height() - 5),
        area(),
        color(255, 255, 255),
        origin("botright"),
        "sfxLabel",
    ]);
    onClick("sfxLabel", () => toggleMute())
    onKeyPress("r", () => reset());
    onKeyPress("m", () => toggleMute());
    const reset = () => {
        if (!waiting) {
            if (victory) {
                console.log("victory reset");
                go("main", hiScore, score, multiplier + 0.5);
            } else {
                go("main", hiScore);
            }
        }
    }
    const toggleMute = () => {
        muted = !muted;
        if (muted) {
            sfxLabel.text = "MUTED";
        } else {
            sfxLabel.text = "SFX";
        }
    }
    const playSound = (sound) => {
        if (!muted) {
            play(sound);
        }
    }

    /**
     * Background
     */
    const bgs = [
        "bg1",
        "bg2",
        "bg3",
        "bg4",
        "bg5",
        "bg6",
        "bg7",
        "bg8",
        "bg9",
    ]
    add([
        sprite("bg" + Math.ceil(Math.random() * BGS_NUMBER)),
        scale(width() / 256, height() / 256),
        "bg"
    ])

    /**
     * Game
     */
    let spriteOptions = [
        "cat",
        "chicken",
        "cow",
        "dog",
        "elephant",
        "giraffe",
        "rabbit",
        "octopus",
        "parrot",
        "pig",
        "spider",
        "tiger",
        "zebra",
    ]
    let chosenSprites = []
    let sprites = []
    // Select two of the sprite options for the game
    shuffle(spriteOptions).forEach((c, index) => {
        if (index <= 1) {
            chosenSprites.push(c);
        }
    })
    // Load the chosen two sprite options
    chosenSprites.forEach((c) => {
        for (let i = 1; i <= 4; i++) {
            loadSprite(c + i, "gfx/" + c + i + ".jpg");
            sprites.push(c + i);
        }
    });

    const hidden = "hidden" + Math.ceil(Math.random() * HIDDENS_NUMBER);

    let frame = height() - BORDER * 2;
    shuffle(sprites.concat(sprites)).forEach((sprit, index) => {
        const x = ((index + 1) * 2 - 1) % 8;
        const y = ((Math.floor(index / 4) + 1) * 2 - 1);
        add([
            sprite(hidden),
            scale(0.3),
            pos(x * width() / 8, BORDER + y * frame / 8),
            area({scale: 1}),
            origin("center"),
            layer("game"),
            "card",
            {
                sprite: sprit,
                x: x,
                y: y,
                matched: false,
            }
        ])
    })

    onClick("card", (card) => {
        if (!card.matched && !waiting && card != cardIsActive) {
            card.use(sprite(card.sprite));
            if (cardIsActive) {
                if (card.sprite == cardIsActive.sprite) {
                    // It's a match!
                    playSound("success");
                    card.matched = true;
                    cardIsActive.matched = true;
                    cardIsActive = null;
                    score = score + 20 * multiplier;
                    if (checkVictory()) {
                        victory = true;
                        score = score + 100 * multiplier;
                        playSound("victory");
                    }
                } else {
                    // It's not a match :(
                    waiting = true;
                    playSound("wrong");
                    wait(1, () => {
                        cardIsActive.use(sprite(hidden));
                        cardIsActive = null;
                        card.use(sprite(hidden));
                        waiting = false;
                    })
                }
            } else {
                cardIsActive = card
            }
        }

    });
    const checkVictory = () => {
        const cards = get("card");
        if (cards.find((c) => c.matched == false)) {
            return false;
        }
        return true;
    }
});

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

try {
    go("main", localStorage ? localStorage.getItem('hiscore') || 0 : 0);
} catch {
    go("main", 0);
}
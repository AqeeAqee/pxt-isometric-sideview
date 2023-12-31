namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 320
    export const ARCADE_SCREEN_HEIGHT = 240
}

game.stats = true

tiles.setCurrentTilemap(tilemap`level0`)
const spawnTile = sprites.castle.tileGrass1
scene.setBackgroundColor(0)
// effects.blizzard.startScreenEffect(99999999, 99)

const myRender = Render.myRender
let angle = 45
Render.setViewAngleInDegree(angle)
/**/
myRender.setWallSideTexture(img`
    7 7 7 7 7 7 7 5 7 7 7 7 6 5 7 7
    7 5 7 7 7 7 7 6 7 7 7 6 5 7 7 7
    7 6 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 d d 7 7 7 d 7 7 7 7 7
    7 7 7 d d d d d d 1 d d d d 7 7
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    d d d d d 1 d d d d d d d 1 d d
    d d d d d 1 d d d d d d d 1 d d
    d d d d d 1 d d d d d d d 1 d d
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    d 1 d d d d d d d 1 d d d d d d
    . 1 d d d d d d d 1 d d d d d .
    . 1 d d d d . . . . . . d d d .
    . . 1 1 . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`, img`
    5 7 5 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 1 7 7
    7 7 7 1 1 7 7 7 7 7 7 7 1 7 1 7
    7 7 3 1 1 3 7 7 7 5 7 7 6 1 6 7
    7 1 1 6 6 1 1 7 7 5 7 7 7 7 7 7
    7 d 1 7 7 1 d 7 7 6 7 7 7 7 7 7
    7 6 3 1 1 3 6 7 7 7 7 5 7 7 7 7
    7 7 6 d d 6 7 7 7 7 5 5 6 7 7 7
    7 7 7 7 7 7 7 1 7 7 5 6 7 7 7 7
    7 7 7 7 7 7 1 7 1 7 7 7 1 1 7 7
    7 7 1 7 7 7 6 1 6 7 7 3 1 1 3 7
    7 1 7 1 7 7 7 7 7 7 1 1 6 6 1 1
    7 6 1 6 7 7 7 7 7 7 d 1 7 7 1 d
    7 7 7 7 7 7 7 7 7 7 6 3 1 1 3 6
    7 7 7 7 7 7 7 7 7 7 7 6 d d 6 7
    7 7 5 7 7 7 7 7 7 7 7 7 7 7 7 7
`)

myRender.setWallSideTexture(img`
    . 4 4 4 4 4 4 4 4 4 4 4 4 4 4 .
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 f 5 5 5 5 5 5 5 5 5 5 f 5 f
    4 5 5 5 5 4 4 4 4 4 5 5 5 5 5 f
    4 5 5 5 4 4 f f f 4 4 5 5 5 5 f
    4 5 5 5 4 4 f 5 5 4 4 f 5 5 5 f
    4 5 5 5 4 4 f 5 5 4 4 f 5 5 5 f
    4 5 5 5 5 f f 5 4 4 4 f 5 5 5 f
    4 5 5 5 5 5 5 4 4 f f f 5 5 5 f
    4 5 5 5 5 5 5 4 4 f 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 f f 5 5 5 5 5 f
    4 5 5 5 5 5 5 4 4 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 4 4 f 5 5 5 5 5 f
    4 5 f 5 5 5 5 5 f f 5 5 5 f 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    f f f f f f f f f f f f f f f f
`, img`
    . 4 4 4 4 4 4 4 4 4 4 4 4 4 4 .
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 f 5 5 5 5 5 5 5 5 5 5 f 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    4 5 f 5 5 5 5 5 5 5 5 5 5 f 5 f
    4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
    f f f f f f f f f f f f f f f f
`)

myRender.setWallSideTexture(img`
    d 1 d d d d d d d 1 d d d d d d
    d 1 d d d d d d d 1 d d d d d d
    d 1 d d d d d d d 1 d d d d d d
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    d d d d d 1 d d d d d d d 1 d d
    d d d d d 1 d d d d d d d 1 d d
    d d d d d 1 d d d d d d d 1 d d
    7 7 1 1 1 1 1 1 1 1 1 1 1 1 7 7
    7 7 7 d d 1 d d d d 7 7 7 7 7 7
    7 5 7 7 7 1 d 7 7 7 7 4 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 1 7 7
    . . . . . 7 7 7 7 7 . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`)


// Render.moveWithController(0, 0, 0)
controller.moveSprite(myRender.sprSelf, 55, 0)
myRender.sprSelf.setScale(1)
myRender.sprSelf.ay=500
tiles.placeOnTile(myRender.sprSelf, tiles.getTileLocation(2, 8))
Render.setSpriteAnimations(myRender.sprSelf, Render.createAnimations(150, texturesHero[0], texturesHero[1], texturesHero[2], texturesHero[3]))

let count = 0
function createSprite(x: number, y: number, vx: number, vy: number, textures: Image[][], kind: number) {
    const spr = sprites.create(textures[0][0], kind)
    // myRender.takeoverSceneSprites()
    tiles.placeOnTile(spr, tiles.getTileLocation(x, y))
    spr.setVelocity(vx, vy)
    // setCharacterAnimationForSprite(spr, textures)
    Render.setSpriteAnimations(spr, Render.createAnimations(150, textures[0], textures[1], textures[2], textures[3]))
    tiles.placeOnRandomTile(spr, spawnTile)
    spr.ay = 500

    // spr.sayText(spr.id + " test\n test", 9999)
    // spr.startEffect(effects.fountain,9999)

    return spr
}

function createCoin() {
    let spr = createSprite(4, 7, Math.randomRange(5, 10), Math.randomRange(3, 10), texturesCoin, SpriteKind.Food)
    tiles.placeOnRandomTile(spr, spawnTile)
}

// createSprite(8, 7, 6, 10, texturesDuck, SpriteKind.Enemy)
// createSprite(6, 7, 6, 10, texturesDonut, SpriteKind.Enemy)
// createSprite(5, 8, 6, 10, texturesDog, SpriteKind.Enemy)
let sprPriness2 = createSprite(11, 8, 6, 10, texturesPrincess2, SpriteKind.Enemy)
// let sprHero = createSprite(10, 8, 6, 10, texturesHero, SpriteKind.Enemy)
let sprSkelly = createSprite(9, 9, 6, 10, texturesSkelly, SpriteKind.Enemy)
let sprPriness = createSprite(10, 7, 6, 10, texturesPrincess, SpriteKind.Enemy)
let sprPlane = createSprite(9, 7, 6, 10, texturesPlane, SpriteKind.Enemy)
// let cake = createSprite(2, 2, 4, 2, texturesBigCake, SpriteKind.Enemy)
let fish = createSprite(7, 9, 0, 0, texturesFish, SpriteKind.Enemy)


sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Projectile, function (sprite, otherSprite) {
    otherSprite.destroy()
    music.baDing.play()
    tiles.placeOnRandomTile(sprite, spawnTile)
    sprite.sayText("No!", 2000)
    sprite.startEffect(effects.fire, 3000)
    createCoin()
    // game.showLongText(sprite.id+" "+otherSprite.id, DialogLayout.Bottom)
})

sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.setVelocity(otherSprite.x - sprite.x, otherSprite.y - sprite.y)
    sprite.setVelocity(-(otherSprite.x - sprite.x), -(otherSprite.y - sprite.y))
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    music.baDing.play()
    info.changeScoreBy(1)
    otherSprite.destroy()
})

controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    music.pewPew.play()
    let s = sprites.createProjectileFromSprite(sprites.projectile.bubble1, myRender.sprSelf, 66, 0)
    s.setScale(0.5)
})

controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
    if(tiles.tileAtLocationIsWall(myRender.sprSelf.tilemapLocation().getNeighboringLocation(CollisionDirection.Bottom)))
        myRender.sprSelf.vy= -250
    // myRender.jumpWithHeightAndDuration(myRender.sprSelf, tilemapScale * 2.5, 1000)
})

let isAdjusting = false
let adjusted=false
controller.menu.onEvent(ControllerButtonEvent.Pressed, () => {
    isAdjusting = true
    adjusted=false
    controller.moveSprite(myRender.sprSelf, 0, 0)
})
controller.menu.onEvent(ControllerButtonEvent.Released, () => {
    isAdjusting = false
    if (!adjusted)
        Render.toggleViewMode()
    controller.moveSprite(myRender.sprSelf, (myRender.viewAngle < Math.PI ? 55 : -55), 0)
})

controller.up.onEvent(ControllerButtonEvent.Pressed, () => {
    if (!isAdjusting)
        Render.changeScale(1)
})
controller.down.onEvent(ControllerButtonEvent.Pressed, () => {
    if (!isAdjusting)
        Render.changeScale(-1)
})

scene.onHitWall(SpriteKind.Player, function(sprite: Sprite, location: tiles.Location) {
    if (sprite.isHittingTile(CollisionDirection.Top) && tiles.tileAtLocationEquals(location, img`
. 4 4 4 4 4 4 4 4 4 4 4 4 4 4 .
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 f 5 5 5 5 5 5 5 5 5 5 f 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
4 5 f 5 5 5 5 5 5 5 5 5 5 f 5 f
4 5 5 5 5 5 5 5 5 5 5 5 5 5 5 f
f f f f f f f f f f f f f f f f
    `))
    {
        music.baDing.play()
        let spr = createSprite(location.col, location.row-1, 0, -100, texturesCoin, SpriteKind.Food)
        spr.lifespan=500
    }
})

game.onUpdate(() => {
    if (isAdjusting){
        if (controller.up.isPressed()){
            Render.changeScaleY(1)
            adjusted = true
        }
        if (controller.down.isPressed()){
            Render.changeScaleY(-1)
            adjusted = true
        }
        if (controller.left.isPressed()){
            adjusted = true
            angle-=5
            if(angle<0) angle+=360
            Render.setViewAngleInDegree(angle)
        }
        if (controller.right.isPressed()){
            adjusted = true
            angle += 5
            angle %= 360
            Render.setViewAngleInDegree(angle)
        }
    }
})

info.setScore(0)
info.setLife(3)




// 0<= dir <1, then may be added by 2 for avoid negative
// myRender.registerOnSpriteDirectionUpdate((spr, dir) => {
//     // character.setCharacterState(spr, character.rule(characterAniDirs[Math.floor(dir * 4 + .5) % 4]))
// })

// const characterAniDirs = [Predicate.MovingLeft, Predicate.MovingDown, Predicate.MovingRight, Predicate.MovingUp]
// function setCharacterAnimationForSprite(spr: Sprite, textures: Image[][]) {
//     characterAniDirs.forEach((dir, i) => {
//         character.loopFrames(spr, textures[Math.floor(i * textures.length / characterAniDirs.length)], 150, character.rule(dir))
//     })
// }

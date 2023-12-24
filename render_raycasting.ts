//% shim=pxt::updateScreen
function updateScreen(img: Image) { }

enum ViewMode {
    //% block="TileMap Mode"
    tilemapView,
    //% block="Isometric Mode"
    isometricView,
}

function print_gcStats() {
    game.consoleOverlay.setVisible(true, 2)
    control.gc()
    const gcStats = control.gcStats()
    if (gcStats) {
        console.log(gcStats.numGC + "")
        console.log(gcStats.numBlocks + "")
        console.log(gcStats.totalBytes + "")
        console.log(gcStats.lastFreeBytes + "")
        console.log(gcStats.lastMaxBlockBytes + "")
        console.log(gcStats.minFreeBytes + "")
    }
}


namespace Render {
    const SH = screen.height, SHHalf = SH / 2
    const SW = screen.width, SWHalf = SW / 2
    export const fpx = 8
    const fpx2=fpx*2
    const fpx2_4 = fpx2 - 4
    const fpx_scale = 2 ** fpx
    export function tofpx(n: number) { return (n * fpx_scale) | 0 }
    const one = 1 << fpx
    const one2 = 1 << (fpx + fpx)
    const FPX_MAX = (1 << fpx) - 1

    //for Isometric
    const ScreenCenterX = screen.width >> 1, ScreenCenterY = screen.height * 3 >> 2
    const TileMapScale = 4, TileSize = 1 << TileMapScale, HalfTileSize = TileSize >> 1
    const IsConsole = control.ramSize() < 1024 * 1024, Max_TileImgScaleX = IsConsole ? 2 : 4, Max_TileImgScaleY = IsConsole ? 2 : 4
    let TileImgScale = Max_TileImgScaleX, HalfTileImgScale = TileImgScale / 2 ///>> 1
    let TileImgScaleX = TileImgScale, TileImgScaleY = Max_TileImgScaleY/2 //16x16 Rotate&Scale to 64x64, then shrink to 64x32
    let Scale = TileImgScale / Math.SQRT2, Scale_Square = TileImgScale ** 2 / 2 // = Scale**2 //8 // =
    let WallScale = HalfTileImgScale, WallHeight = TileSize * WallScale
    const X0 = TileSize >> 1, Y0 = X0
    let H = X0 - TileSize * HalfTileImgScale, V = Y0 - TileSize * HalfTileImgScale
    let AD_BC_Fpx2 = (one2 / Scale_Square) | 0 //= (Math.SQRT1_2/2)**2 == (A * D - B * C)
    let A_Fpx = 0
    let B_Fpx = 0
    let D_Fpx = 0
    let C_Fpx = 0

    export function getScale(){
        return TileImgScale
    }
    export function changeScale(delta: number){
        setScale(TileImgScale + delta * 0.5)
    }
    export function setScale(value: number){
        const ratio = TileImgScale / TileImgScaleY
        TileImgScale = Math.clamp(1, Max_TileImgScaleX, value)
        setScaleY(TileImgScale / ratio)
        // info.player3.setScore(TileImgScale*100)

        HalfTileImgScale = TileImgScale / 2 ///>> 1
        TileImgScaleX = TileImgScale
        Scale = TileImgScale / Math.SQRT2, Scale_Square = TileImgScale ** 2 / 2
        WallScale = HalfTileImgScale, WallHeight = TileSize * WallScale
        H = X0 - TileSize * HalfTileImgScale, V = Y0 - TileSize * HalfTileImgScale
        AD_BC_Fpx2 = (one2 / Scale_Square) | 0
        myRender.lastRenderAngle=-1 // force refresh
    }

    export function getScaleY(){
        return TileImgScaleY
    }
    export function changeScaleY(delta:number){
        setScaleY(TileImgScaleY + delta /8)
    }
    export function setScaleY(value: number){
        TileImgScaleY = Math.clamp(1 / 8, Math.min(TileImgScaleX, Max_TileImgScaleY), value)
        // info.player4.setScore(TileImgScaleY*100)
        myRender.lastRenderAngle = -1 // force refresh
    }

    function rotatePoint(xIn: number, yIn: number) {
        let xOut = ((D_Fpx * (xIn - X0) - B_Fpx * (yIn - Y0)) << fpx) / AD_BC_Fpx2 - (H - X0)
        let yOut = -((C_Fpx * (xIn - X0) - A_Fpx * (yIn - Y0)) << fpx) / AD_BC_Fpx2 - (V - Y0)
        return { x: (xOut | 0), y: yOut / (TileImgScaleX / TileImgScaleY) }
    }

    class MotionSet1D {
        p: number
        v: number = 0
        a: number = 0
        constructor(public offset: number) {
            this.p = offset
        }
    }

    export const defaultFov = SW / SH / 2  //Wall just fill screen height when standing 1 tile away

    export class IsometricRender_Sideview{

        private tempScreen: Image = screen // image.create(SW, SH)
        private tempBackground: scene.BackgroundLayer //for "see through" when scene popped out

        velocityAngle: number = 2
        velocity: number = 3
        protected _viewMode=ViewMode.isometricView
        protected dirXFpx: number
        protected dirYFpx: number
        protected planeX: number
        protected planeY: number
        protected _angle: number
        protected _fov: number
        protected _wallZScale: number = 1
        cameraSway = 0
        protected isWalking=false
        protected cameraOffsetX = 0
        protected cameraOffsetZ_fpx = 0

        //sprites & accessories
        sprSelf: Sprite
        sprites: Sprite[] = []
        sprites2D: Sprite[] = []
        spriteParticles: particles.ParticleSource[] = []
        spriteLikes: SpriteLike[] = []
        spriteAnimations: Animations[] = []
        protected spriteMotionZ: MotionSet1D[] = []
        protected sayRederers: sprites.BaseSpriteSayRenderer[] = []
        protected sayEndTimes: number[] = []

        //reference
        protected tilemapScale = TileScale.Sixteen
        protected tilemapScaleSize = 1 << TileScale.Sixteen
        map: tiles.TileMapData
        mapData:Array<number>
        bg: Image
        textures: Image[]
        protected oldRender: scene.Renderable
        protected myRender: scene.Renderable

        //render

        //render perf const
        viewZPos:number
        viewXFpx:number
        viewYFpx:number

        //for drawing sprites
        protected invDet: number //required for correct matrix multiplication
        camera: scene.Camera
        tempSprite: Sprite = sprites.create(img`0`)
        protected transformX: number[] = []
        protected transformY: number[] = []
        protected angleSelfToSpr: number[] = []

        onSpriteDirectionUpdateHandler: (spr: Sprite, dir: number) => void

        get xFpx(): number {
            return Fx.add(this.sprSelf._x, Fx.div(this.sprSelf._width, Fx.twoFx8)) as any as number / this.tilemapScaleSize
        }

        // set xFpx(v: number) {
        //     this.sprSelf._x = v * this.tilemapScaleSize as any as Fx8
        // }

        get yFpx(): number {
            return Fx.add(this.sprSelf._y, Fx.div(this.sprSelf._height, Fx.twoFx8)) as any as number / this.tilemapScaleSize
        }

        // set yFpx(v: number) {
        //     this.sprSelf._y = v * this.tilemapScaleSize as any as Fx8
        // }

        get dirX(): number {
            return this.dirXFpx / fpx_scale
        }

        get dirY(): number {
            return this.dirYFpx / fpx_scale
        }

        set dirX(v: number) {
            this.dirXFpx = v * fpx_scale
        }

        set dirY(v: number) {
            this.dirYFpx = v * fpx_scale
        }

        sprXFx8(spr: Sprite) {
            return Fx.add(spr._x, Fx.div(spr._width, Fx.twoFx8)) as any as number / this.tilemapScaleSize
        }

        sprYFx8(spr: Sprite) {
            return Fx.add(spr._y, Fx.div(spr._height, Fx.twoFx8)) as any as number / this.tilemapScaleSize
        }

        get viewAngle(): number {
            return this._angle
        }
        set viewAngle(angle: number) {
            this._angle = angle
            // this.setVectors()
            // this.updateSelfImage()
        }

/*
        get fov(): number {
            return this._fov
        }

        set fov(fov: number) {
            this._fov = fov
            this.setVectors()
        }

        get wallZScale(): number {
            return this._wallZScale
        }
        set wallZScale(v: number) {
            this._wallZScale = v
        }
*/
        getMotionZ(spr: Sprite, offsetZ: number = 0) {
            let motionZ = this.spriteMotionZ[spr.id]
            if (!motionZ) {
                motionZ = new MotionSet1D(tofpx(offsetZ))
                this.spriteMotionZ[spr.id] = motionZ
            }
            return motionZ
        }

        getZOffset(spr: Sprite) {
            return this.getMotionZ(spr).offset / fpx_scale
        }

        setZOffset(spr: Sprite, offsetZ: number, duration: number = 500) {
            const motionZ = this.getMotionZ(spr, offsetZ)

            motionZ.offset = tofpx(offsetZ)
            if (motionZ.p != motionZ.offset) {
                if (duration === 0)
                    motionZ.p = motionZ.offset
                else if(motionZ.v==0)
                    this.move(spr, (motionZ.offset - motionZ.p) / fpx_scale * 1000 / duration, 0)
            }
        }

        getMotionZPosition(spr: Sprite) {
            return this.getMotionZ(spr).p / fpx_scale
        }

        //todo, use ZHeight(set from sprite.Height when takeover, then sprite.Height will be replace with width)
        isOverlapZ(sprite1: Sprite, sprite2: Sprite): boolean {
            const p1 = this.getMotionZPosition(sprite1)
            const p2 = this.getMotionZPosition(sprite2)
            if (p1 < p2) {
                if (p1 + sprite1.height > p2) return true
            } else {
                if (p2 + sprite2.height > p1) return true
            }
            return false
        }

        move(spr: Sprite, v: number, a: number) {
            const motionZ = this.getMotionZ(spr)

            motionZ.v = tofpx(v)
            motionZ.a = tofpx(a)
        }

        jump(spr: Sprite, v: number, a: number) {
            const motionZ = this.getMotionZ(spr)
            let floorHeight = motionZ.offset
            if (tiles.tileAtLocationIsWall(spr.tilemapLocation()))
                floorHeight += TileSize << fpx

            if (motionZ.p != floorHeight)
                return

            motionZ.v = tofpx(v)
            motionZ.a = tofpx(a)
        }

        jumpWithHeightAndDuration(spr: Sprite, height: number, duration: number) {
            const motionZ = this.getMotionZ(spr)
            let floorHeight = motionZ.offset
            if (tiles.tileAtLocationIsWall(spr.tilemapLocation()))
                floorHeight += TileSize << fpx

            if (motionZ.p != floorHeight)
                return

            // height= -v*v/a/2
            // duration = -v/a*2 *1000
            const v = height * 4000 / duration
            const a = -v * 2000 / duration
            motionZ.v = tofpx(v)
            motionZ.a = tofpx(a)
        }

        get viewMode(): ViewMode {
            return this._viewMode
        }

        set viewMode(v: ViewMode) {
            this._viewMode = v
        }

        updateViewZPos() {
            this.viewZPos = this.spriteMotionZ[this.sprSelf.id].p + (this.sprSelf._height as any as number) - (2 << fpx)
        }

        takeoverSceneSprites() {
            const sc_allSprites = game.currentScene().allSprites
            for (let i=0;i<sc_allSprites.length;) {
                const spr=sc_allSprites[i]
                if (spr instanceof Sprite) {
                    const sprList = (spr.flags & sprites.Flag.RelativeToCamera) ? this.sprites2D:this.sprites
                    if (sprList.indexOf(spr) < 0) {
                        sprList.push(spr as Sprite)
                        this.getMotionZ(spr, 0)
                        spr.onDestroyed(() => {
                            this.sprites.removeElement(spr as Sprite)   //can be in one of 2 lists
                            this.sprites2D.removeElement(spr as Sprite) //can be in one of 2 lists
                            const sayRenderer = this.sayRederers[spr.id]
                            if (sayRenderer) {
                                this.sayRederers.removeElement(sayRenderer)
                                sayRenderer.destroy()
                            }
                        })
                    }
                } else if(spr instanceof particles.ParticleSource){
                    const particle = (spr as particles.ParticleSource)
                    if (this.spriteParticles.indexOf(particle) < 0 && particle.anchor instanceof Sprite) {
                        const spr = (particle.anchor as Sprite)
                        if(this.sprites.indexOf(spr)>=0){
                            this.spriteParticles[spr.id]=particle
                            particle.anchor= {x:0,y:0}
                        }
                    }
                } else {
                    if (this.spriteLikes.indexOf(spr) < 0)
                        this.spriteLikes.push(spr)
                }
                sc_allSprites.removeElement(spr)
            }
            this.sprites.forEach((spr) => {
                if (spr)
                    this.takeoverSayRenderOfSprite(spr)
            })
        }
        takeoverSayRenderOfSprite(sprite: Sprite) {
            const sprite_as_any = (sprite as any)
            if (sprite_as_any.sayRenderer) {
                this.sayRederers[sprite.id] = sprite_as_any.sayRenderer
                this.sayEndTimes[sprite.id] = sprite_as_any.sayEndTime;
                sprite_as_any.sayRenderer = undefined
                sprite_as_any.sayEndTime = undefined
            }
        }

        tilemapLoaded() {
            const sc = game.currentScene()
            this.map = sc.tileMap.data
            this.mapData = ((this.map as any).data as Buffer).toArray(NumberFormat.Int8LE)
            this.tilemapScaleSize = 1 << sc.tileMap.data.scale
            this.textures = sc.tileMap.data.getTileset()
            this.oldRender = sc.tileMap.renderable
            this.spriteLikes.removeElement(this.oldRender)
            sc.allSprites.removeElement(this.oldRender)

            let frameCallback_update = sc.eventContext.registerFrameHandler(scene.PRE_RENDER_UPDATE_PRIORITY + 1, () => {
                const dt = sc.eventContext.deltaTime;
                // sc.camera.update();  // already did in scene
                for (const s of this.sprites)
                    s.__update(sc.camera, dt);
                this.sprSelf.__update(sc.camera, dt)
            })

            let frameCallback_draw = sc.eventContext.registerFrameHandler(scene.RENDER_SPRITES_PRIORITY + 1, () => {
                if (this._viewMode == ViewMode.isometricView) {
                    if (!this.tempBackground) {
                        game.currentScene().background.draw() //to screen
                        this.render()
                        // screen.fill(0)
                        this.sprites2D.forEach(spr => spr.__draw(sc.camera))
                        this.spriteLikes.forEach(spr => spr.__draw(sc.camera))
                        // this.tempScreen.drawTransparentImage(screen, 0, 0)
                    }
                } else {
                    game.currentScene().background.draw() //to screen
                    this.oldRender.__drawCore(sc.camera)
                    this.sprites.forEach(spr => spr.__draw(sc.camera))
                    this.sprSelf.__draw(sc.camera)
                    this.sprites2D.forEach(spr => spr.__draw(sc.camera))
                    this.spriteLikes.forEach(spr => spr.__draw(sc.camera))
                }
            })

            sc.tileMap.addEventListener(tiles.TileMapEvent.Unloaded, data => {
                sc.eventContext.unregisterFrameHandler(frameCallback_update)
                sc.eventContext.unregisterFrameHandler(frameCallback_draw)
            })
        }

        constructor() {
            this._angle = Math.PI/4
            // this.fov = defaultFov
            this.camera = new scene.Camera()

            const sc = game.currentScene()
            if (!sc.tileMap) {
                sc.tileMap = new tiles.TileMap();
            } else {
                this.tilemapLoaded()
            }
            game.currentScene().tileMap.addEventListener(tiles.TileMapEvent.Loaded, data => this.tilemapLoaded())

            //self sprite
            this.sprSelf = sprites.create(image.create(this.tilemapScaleSize >> 1, this.tilemapScaleSize >> 1), SpriteKind.Player)
            this.sprSelf.setImage(sprites.castle.heroWalkFront1)
            this.sprSelf.scale=0.5
            this.takeoverSceneSprites()
            // this.sprites.removeElement(this.sprSelf)
            this.updateViewZPos()
            scene.cameraFollowSprite(this.sprSelf) //prevent projectiles from AutoDestroy 
            // this.updateSelfImage()

            game.onUpdate(function () {
                // this.updateControls() //not applied for sideview.
                this.updateSprite()
            })

            game.onUpdateInterval(400, ()=>{
                for (let i = 0; i < this.sprites.length;) {
                    const spr = this.sprites[i]
                    if (spr.flags & sprites.Flag.RelativeToCamera) {
                        this.sprites.removeElement(spr)
                        this.sprites2D.push(spr)
                    } else {i++}
                }
                for (let i = 0; i < this.sprites2D.length;) {
                    const spr = this.sprites2D[i]
                    if (!(spr.flags & sprites.Flag.RelativeToCamera)) {
                        this.sprites2D.removeElement(spr)
                        this.sprites.push(spr)
                    } else {i++}
                }
                this.takeoverSceneSprites() // in case some one new
            })


//            game.onUpdateInterval(25, () => {
//                if(this.cameraSway&&this.isWalking){
//                    this.cameraOffsetX = (Math.sin(control.millis() / 150) * this.cameraSway * 3)|0
//                    this.cameraOffsetZ_fpx = tofpx(Math.cos(control.millis() / 75) * this.cameraSway)|0
//                }
//            });

//            control.__screen.setupUpdate(() => {
//                if(this.viewMode==ViewMode.isometricView)
//                    updateScreen(this.tempScreen)
//                else
//                    updateScreen(screen)
//            })

            game.addScenePushHandler((oldScene) => {
                this.tempScreen=screen.clone()
                this.tempBackground = oldScene.background.addLayer(this.tempScreen, 0, BackgroundAlignment.Center)
                control.__screen.setupUpdate(() => { updateScreen(screen) })
            })
            game.addScenePopHandler((oldScene) => {
                const layers = ((game.currentScene().background as any)._layers as scene.BackgroundLayer[])
                layers.removeElement(this.tempBackground)
                // info.player3.setScore(layers.length)
                this.tempBackground=undefined
                this.tempScreen=screen;
                control.__screen.setupUpdate(() => {
                    if (this.viewMode == ViewMode.isometricView)
                        updateScreen(this.tempScreen)
                    else
                        updateScreen(screen)
                })
            })
        }

/*
        private setVectors() {
            const sin = Math.sin(this._angle)
            const cos = Math.cos(this._angle)
            this.dirXFpx = tofpx(cos)
            this.dirYFpx = tofpx(sin)
            this.planeX = tofpx(sin * this._fov)
            this.planeY = tofpx(cos * -this._fov)
        }
*/
        //todo, pre-drawn dirctional image
        public updateSelfImage() {
            const img = this.sprSelf.image
            img.fill(6)
            const arrowLength = img.width / 2
            img.drawLine(arrowLength, arrowLength, arrowLength + this.dirX * arrowLength, arrowLength + this.dirY * arrowLength, 2)
            img.fillRect(arrowLength - 1, arrowLength - 1, 2, 2, 2)
        }

/*
        updateControls() {
            if (this.velocityAngle !== 0) {
                const dx = controller.dx(this.velocityAngle)
                if (dx) {
                    this.viewAngle += dx
                }
            }
            if (this.velocity !== 0) {
                this.isWalking=true
                const dy = controller.dy(this.velocity)
                if (dy) {
                    const nx = this.xFpx - Math.round(this.dirXFpx * dy)
                    const ny = this.yFpx - Math.round(this.dirYFpx * dy)
                    this.sprSelf.setPosition((nx * this.tilemapScaleSize / fpx_scale), (ny * this.tilemapScaleSize / fpx_scale))
                }else{
                    this.isWalking =false
                }
            }
        }
*/

        updateSprite(){
            const dt = game.eventContext().deltaTime
            for (const spr of this.sprites) {
                this.updateMotionZ(spr, dt)
            }
            this.updateMotionZ(this.sprSelf, dt)
        }

        updateMotionZ(spr:Sprite, dt:number){
            const motionZ = this.spriteMotionZ[spr.id]
            //if (!motionZ) continue

            let floorHeight = motionZ.offset
            if(tiles.tileAtLocationIsWall(spr.tilemapLocation()))
                floorHeight += TileSize <<fpx
            if (motionZ.v != 0 || motionZ.p != floorHeight) {
                motionZ.v += motionZ.a * dt, motionZ.p += motionZ.v * dt
                //landing
                if ((motionZ.a >= 0 && motionZ.v > 0 && motionZ.p >= floorHeight) ||
                    (motionZ.a <= 0 && motionZ.v < 0 && motionZ.p <= floorHeight)) { motionZ.p = floorHeight, motionZ.v = 0 }
                if(spr===this.sprSelf)
                    this.updateViewZPos()
            }
            if (spr === this.sprSelf){
                const isLevel2 = motionZ.p >= (TileSize << fpx)
                spr.setFlag(SpriteFlag.Ghost, isLevel2)
                spr.layer = isLevel2 ? 2 : 1
            }
        }

        rotateAll(inImgs: Image[], outImgs: Image[]) {
            let xIn0_FX = (A_Fpx * (H - X0)) + (B_Fpx * (V - Y0)) + (X0 << fpx)
            let yIn0_FX = (C_Fpx * (H - X0)) + (D_Fpx * (V - Y0)) + (Y0 << fpx)
            const rowStepX = B_Fpx * (TileImgScaleX/TileImgScaleY) 
            const rowStepY = D_Fpx * (TileImgScaleX/TileImgScaleY) 
            const TileSize_Fpx = TileSize << fpx

            for (let xOut = 0; xOut < TileSize * TileImgScaleX; xOut++) {
                let xIn_FX = xIn0_FX
                let yIn_FX = yIn0_FX
                for (let yOut = 0; yOut < TileSize * TileImgScaleY; yOut++) {
                    if (0 <= xIn_FX && xIn_FX < TileSize_Fpx && 0 <= yIn_FX && yIn_FX < TileSize_Fpx) {
                        const xIn = xIn_FX >> fpx
                        const yIn = yIn_FX >> fpx
                        for (let i = 1; i < inImgs.length; i++) {
                            const c = inImgs[i].getPixel(xIn, yIn)
                            if(c)
                                outImgs[i].setPixel(xOut, yOut, c)
                        }
                    }
                    xIn_FX += rowStepX 
                    yIn_FX += rowStepY 
                }
                xIn0_FX += A_Fpx
                yIn0_FX += C_Fpx
            }
        }

        rotate(inImg:Image, outImg:Image) {
            let xIn0_FX = (A_Fpx * (H - X0)) + (B_Fpx * (V - Y0)) + (X0 << fpx)
            let yIn0_FX = (C_Fpx * (H - X0)) + (D_Fpx * (V - Y0)) + (Y0 << fpx)
            const rowStepX = B_Fpx * (TileImgScaleX / TileImgScaleY)
            const rowStepY = D_Fpx * (TileImgScaleX / TileImgScaleY)
            const TileSize_Fpx = TileSize << fpx

            for (let xOut = 0; xOut < TileSize * TileImgScaleX; xOut++) {
                let xIn_FX = xIn0_FX
                let yIn_FX = yIn0_FX
                for (let yOut = 0; yOut < TileSize * TileImgScaleY; yOut++) {
                    if (0 <= xIn_FX && xIn_FX < TileSize_Fpx && 0 <= yIn_FX && yIn_FX < TileSize_Fpx){
                        const c = inImg.getPixel(xIn_FX >> fpx, yIn_FX >> fpx)
                        if(c)
                            outImg.setPixel(xOut, yOut, c)
                    }
                    xIn_FX += rowStepX
                    yIn_FX += rowStepY
                }
                xIn0_FX += A_Fpx
                yIn0_FX += C_Fpx
            }
        }

        shear(inImg: Image, outImg: Image, startCornerIndex: number) {
            const p0x = this.corners[startCornerIndex].x, p0y = this.corners[startCornerIndex].y
            const p1x = this.corners[startCornerIndex + 1].x, p1y = this.corners[startCornerIndex + 1].y
            let y = (p0y + 1) << fpx
            const diffX0_1 = p1x - p0x
            if (diffX0_1 <= 0) return
            let texX = 0
            const texXStep = Math.idiv(((TileSize) << fpx) - 1, diffX0_1)
            const yStep = Math.idiv((p1y - p0y) * fpx_scale, diffX0_1)
            for (let x = 0; x <= diffX0_1; x++) {
                helpers.imageBlitRow(outImg, x + p0x, (y >> fpx) - 1, // "y-1" a workaround of gap between roof and wallside
                    inImg, texX >> fpx, WallHeight + 1) // "WallHeight+1" a workaround of gap between roof and wallside
                texX += texXStep
                y += yStep
            }
        }

        shearAndCache_AllTiles(inImgs: Image[], outImgs: Image[], startCornerIndex: number) {
            const p0x = this.corners[startCornerIndex].x,     p0y = this.corners[startCornerIndex].y
            const p1x = this.corners[startCornerIndex + 1].x, p1y = this.corners[startCornerIndex + 1].y
            let y = (p0y + 1) << fpx
            const diffX0_1 = p1x - p0x
            if (diffX0_1 <= 0) return
            let texX = 0
            const texXStep = Math.idiv(((TileSize) << fpx) - 1, diffX0_1)
            const yStep = Math.idiv((p1y - p0y) * fpx_scale, diffX0_1)
            for (let x = 0; x <= diffX0_1; x++) {
                for (let i = 1; i < inImgs.length; i++)
                    helpers.imageBlitRow(outImgs[i], x + p0x, (y >> fpx) - 1, // "y-1" a workaround of gap between roof and wallside
                        inImgs[i], texX >> fpx, WallHeight + 1) // "WallHeight+1" a workaround of gap between roof and wallside
                texX += texXStep
                y += yStep
            }
        }

        pasteShearedTile(targetImg: Image, offsetX: number, offsetY: number, tileIndex:number, startCornerIndex: number){
            const p0x = this.corners[startCornerIndex].x
            const width = this.corners[startCornerIndex + 1].x - p0x + 1
            const p0y = this.corners[startCornerIndex].y, p1y = this.corners[startCornerIndex + 1].y
            const y=startCornerIndex==0? p0y:p1y
            const height=WallHeight+ (startCornerIndex==0? p1y-p0y: p0y-p1y)

            helpers.imageBlit(this.tempScreen, offsetX + p0x, offsetY + y , width, height,
                this.shearedTiles[tileIndex], p0x, y, width, height, true, false)
        }

        pasteWall(offsetX: number, offsetY: number, tileIndex: number) {
            // this.drawWall(offsetX, offsetY)
            // this.tempScreen.drawTransparentImage(this.shearedTiles[tileIndex], offsetX, offsetY)
            if(!this.wallCached[tileIndex]){
                const texture=this.customSideTex[tileIndex] || this.customSideTex[0] || this.map.getTileset()[tileIndex]
                this.shear(texture, this.wholeWalls[tileIndex], 0)
                this.shear(texture, this.wholeWalls[tileIndex], 1)
                this.rotate(this.map.getTileset()[tileIndex], this.wholeWalls[tileIndex])
                this.wallCached[tileIndex] = true
            }
            this.tempScreen.drawTransparentImage(this.wholeWalls[tileIndex], offsetX, offsetY)
        }

        protected customSideTex: Image[] = []
        public setWallSideTexture(tex: Image, forTile?: Image) {
            if (!this.map) return
            if (!tex) return
            if (!forTile) {
                this.customSideTex[0] = tex
            } else {
                this.map.getTileset().forEach((t, i) => {
                    if (forTile.equals(t)) {
                        this.customSideTex[i] = tex
                        return
                    }
                })
            }
        }

        updateCorners(){
            //tile corners, for drawing wall
            this.corners = [
                rotatePoint(0, 0),
                rotatePoint(0, 15.99),
                rotatePoint(15.99, 15.99),
                rotatePoint(15.99, 0),
            ]
            const topCornerId = this.corners.reduce((tId, p, i) => { return p.y < this.corners[tId].y ? i : tId }, 0)
            this.corners.removeAt(topCornerId)
            if (topCornerId) //not necessary if removed [0]
                for (let i = 0; i < 3 - topCornerId; i++) //rolling reorder, keep original loop order, start from the next corner of toppest one to the last, then start from beginning
                    this.corners.insertAt(0, this.corners.pop())
        }

        shearedTiles: Image[]
        wholeWalls:Image[]
        wallCached: boolean[]
        lastRenderAngle=-1
        corners: { x: number, y: number }[] = []
        render() {
            // isometricView, ref: https://forum.makecode.com/t/snes-mode-7-transformations/8530

            while (this._angle < 0) this._angle += Math.PI * 2
            while (this._angle >Math.PI*2) this._angle -= Math.PI * 2
            // info.player2.setScore(this._angle*180/Math.PI)
            const angle = this._angle - Math.PI / 2

            if (!this.wholeWalls) {
                this.wholeWalls = []
                this.wallCached = []
                for (let i = 1; i < this.map.getTileset().length; i++){
                    this.wholeWalls[i] = (image.create(TileSize * Max_TileImgScaleX, TileSize * Max_TileImgScaleY + WallHeight))
                    this.wallCached.push(false)
                    // print_gcStats()
                }
            }

            if (!this.shearedTiles) {
                this.shearedTiles = []
                for (let i = 1; i < this.map.getTileset().length; i++)
                    this.shearedTiles[i] =(image.create(TileSize * Max_TileImgScaleX, TileSize * Max_TileImgScaleY + WallHeight))
            }

            //update tiles and parameters
            if(this.lastRenderAngle!=this._angle)
            {
                let ms: number
                ms = control.benchmark(() => {
                    A_Fpx = (Math.cos(angle) * fpx_scale / Scale)|0
                    B_Fpx = (Math.sin(angle) * fpx_scale / Scale)|0
                    D_Fpx = A_Fpx
                    C_Fpx = -B_Fpx

                    for (let i = 1; i < this.wholeWalls.length; i++){
                        this.shearedTiles[i].fill(0)
                        this.wholeWalls[i].fill(0)
                        this.wallCached[i] = false
                    }

                    // this.rotateAll(this.map.getTileset(), this.wholeWalls)

                    this.updateCorners()

                    this.shearAndCache_AllTiles(this.map.getTileset(), this.shearedTiles, A_Fpx * B_Fpx >= 0 ? 0 : 1)
                    
                }); 
                // info.setLife(ms/this.map.getTileset().length) // this.tempScreen.print(ms.toString(), 0, 110)

                this.lastRenderAngle=this._angle
            }

            const A_px_Fpx = (TileSize * Scale_Square -1) * A_Fpx  // -2 is a workaround avoiding gaps between tiles 
            const B_px_Fpx = (TileSize * Scale_Square -1) * B_Fpx  // -2 is a workaround avoiding gaps between tiles 
            const C_px_Fpx = -B_px_Fpx
            const D_px_Fpx = A_px_Fpx

            if(0){//debug tiles align with A B
                this.tempScreen.fill(8)
                const A = A_px_Fpx / fpx_scale
                const B = B_px_Fpx / fpx_scale
                const C = -B
                const D = A

                const baseX=0, baseY=64
                const centerX= baseX+(TileSize*TileImgScaleX>>1), centerY=baseY+TileSize*TileImgScaleY/2

                this.pasteWall(baseX - A, baseY - B / (TileImgScaleX / TileImgScaleY), 1)
                
                this.pasteWall(baseX, baseY, 1)
                
                this.tempScreen.drawLine(centerX, centerY - WallHeight, centerX + A, centerY - WallHeight + B/(TileImgScaleX/TileImgScaleY), 2)
                this.tempScreen.drawLine(centerX, centerY - WallHeight, centerX + C, centerY - WallHeight + D/(TileImgScaleX/TileImgScaleY), 2)
                //debug
                this.corners.forEach((p, i) => this.tempScreen.print(p.x + "," + p.y, 90, i * 10 + 30))
                // info.player2.setScore(100 * this._angle * 180 / Math.PI)

                this.corners.forEach((p, i) => { this.tempScreen.setPixel(baseX+p.x, baseY - WallHeight + p.y, i + 2) })

                this.tempScreen.print(Math.roundWithPrecision(A, 3) + "", 90, 70)
                this.tempScreen.print(Math.roundWithPrecision(B/2, 3) + "", 90, 80)

                return
            }

            const tileOffsetX = (- (C_px_Fpx >> fpx) * (A_px_Fpx > 0 ? 1 : -1))|0
            const tileOffsetY = (- WallHeight - (D_px_Fpx >> fpx) * (A_px_Fpx > 0 ? 1 : -1) / (TileImgScaleX / TileImgScaleY) + 1) |0
            const tileCorner = C_px_Fpx * D_px_Fpx > 0 ? 1 : 0

            const left_CenterTile = ScreenCenterX - (HalfTileSize * TileImgScaleX)
            const top_CenterTile =  ScreenCenterY - (HalfTileSize * TileImgScaleY)

            const rowXStep = 0 //C_px_Fpx
            const rowYStep = (WallHeight << fpx) * (TileImgScaleX / TileImgScaleY)  //D_px_Fpx

        let ms = control.benchmark(() => {
            const Walls = []
            let offsetX0_Fpx = (((HalfTileSize - this.sprSelf.y) * rowXStep + A_px_Fpx * (HalfTileSize - this.sprSelf.x)) >> TileMapScale) + (left_CenterTile << fpx)
            let offsetY0_Fpx = (((HalfTileSize - this.sprSelf.y) * rowYStep + B_px_Fpx * (HalfTileSize - this.sprSelf.x)) >> TileMapScale) + (top_CenterTile << fpx) * (TileImgScaleX / TileImgScaleY)
            for (let i = 0; i < this.map.height; i++) {
                let offsetX_Fpx = offsetX0_Fpx
                let offsetY_Fpx = offsetY0_Fpx
                for (let j = 0; j < this.map.width; j++) {
                    const offsetX = offsetX_Fpx >> fpx
                    const offsetY = (offsetY_Fpx >> (fpx))/(TileImgScaleX / TileImgScaleY)
                    if (offsetX > -TileSize * TileImgScaleX && offsetX < screen.width && offsetY > -TileSize * TileImgScaleY && offsetY < screen.height + TileSize * TileImgScaleY + WallHeight) {
                        const t = this.map.getTile(j, i)
                        if(t){
                            if (this.map.isWall(j, i)) {
                                Walls.push([1, offsetX, offsetY - WallHeight, t,
                                    (this.map.height - 1 - i) * this.map.height //always bottom to up
                                    + (B_px_Fpx > 0 ? j : this.map.width - 1 - j)
                                ])
                            } else //wall sides
                                this.pasteShearedTile(this.tempScreen, offsetX + tileOffsetX, offsetY + tileOffsetY, t, tileCorner)
                        }
                    }
                    offsetX_Fpx+=A_px_Fpx
                    offsetY_Fpx+=B_px_Fpx
                }
                offsetX0_Fpx += rowXStep
                offsetY0_Fpx += rowYStep
            }
            //draw Sprite and wall by order of distance
            const drawingSprites = this.sprites
            .map((spr, index) => {
                const offsetX = ScreenCenterX + ((rowXStep * (spr.y - this.sprSelf.y) + A_px_Fpx * (spr.x - this.sprSelf.x)) >> (TileMapScale + fpx))
                const offsetY = ScreenCenterY + ((rowYStep * (spr.y - this.sprSelf.y) + B_px_Fpx * (spr.x - this.sprSelf.x)) >> (TileMapScale + fpx))/(TileImgScaleX/TileImgScaleY)
                const j = (spr.x / TileSize) | 0, i = (spr.y / TileSize) | 0
                return [0, offsetX, offsetY, index,
                    (this.map.height - 1 - i) * this.map.height +
                    (B_px_Fpx > 0 ? j : this.map.width - 1 - j) 
                    ]
            })
            .filter((v,i) =>{
                const spr= this.sprites[i]
                return (v[2] > 0 && v[1] >= -(spr.width * Scale >> 1) && v[1] < screen.width + (spr.width * Scale >> 1) && v[2] < screen.height + spr.height * Scale )
            })
            drawingSprites
                .concat(Walls) // [0/1:spr/wall, offsetX, offsetY,sprID/wallTex, drawing order index of row&col]
                .sort((v1, v2) => v1[4] - v2[4]) // from far to near
                .forEach((v) => {
                    if (v[0] === 0) 
                        this.drawSprite(this.sprites[v[3]], v[1], v[2])
                    else if (v[0] === 1)
                        this.pasteWall(v[1], v[2], v[3])
                    // this.tempScreen.print(v[4] + "", v[1] + TileSize * 1, v[2], 2)
            })

            drawingSprites.forEach((v) => this.drawSprite_SayText(this.sprites[v[3]], v[1], v[2]))

            if (game.currentScene().particleSources)
                game.currentScene().particleSources.forEach((p)=>{
                    if(this.spriteParticles.indexOf(p)<0)p.__draw(game.currentScene().camera)
                })

        });
        // info.setScore(ms) // this.tempScreen.print(ms.toString(), 0, 20)
        }
        
        registerOnSpriteDirectionUpdate(handler: (spr: Sprite, dir: number) => void) {
            this.onSpriteDirectionUpdateHandler = handler
        }

        drawSprite(spr: Sprite, x: number, y: number) {
            const widthSpr = spr.width * Scale
            const heightSpr = spr.height * Scale
            const dir = (((spr._vx as any as number)>0?Math.PI:0) - this._angle) / Math.PI / 2 + .25
            const texSpr = !this.spriteAnimations[spr.id] ? spr.image : this.spriteAnimations[spr.id].getFrameByDir(dir)
            helpers.imageBlit(this.tempScreen, x - (widthSpr >> 1), y - heightSpr , widthSpr, heightSpr,
                texSpr, 0, 0, spr.image.width, spr.image.height, true, false)
                
            const particle = this.spriteParticles[spr.id]
            if (particle) {
                if (particle.lifespan) {
                    this.camera.drawOffsetX = -x
                    this.camera.drawOffsetY = -(y - (spr.height * Scale >> 1) )
                    particle.__draw(this.camera)
                } else {
                    this.spriteParticles[spr.id] = undefined
                }
            }
        }

        //sayText
        drawSprite_SayText(spr: Sprite, x: number, y: number){
            const sayRender = this.sayRederers[spr.id]
            if (sayRender) {
                const heightSpr = spr.height * Scale
                if (this.sayEndTimes[spr.id] && control.millis() > this.sayEndTimes[spr.id]) {
                    this.sayRederers[spr.id] = undefined
                } else {
                    this.tempSprite.x = x
                    this.tempSprite.y = y - heightSpr  -2
                    this.camera.drawOffsetX = 0
                    this.camera.drawOffsetY = 0
                    sayRender.draw(this.tempScreen, this.camera, this.tempSprite)
                }
            }
        }

    }

    //%fixedinstance
    export const myRender = new Render.IsometricRender_Sideview()
}

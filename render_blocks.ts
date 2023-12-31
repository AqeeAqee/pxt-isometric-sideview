enum RCSpriteAttribute{
    ZOffset,
    ZPosition,
    ZVelocity,
    ZAcceleration
}
/**
 * Render Tilemap into a 2.5D Isometric View
 **/
//% color=#03AA74 weight=1 icon="\uf1b2" //cube f1b2 , fold f279
//% groups='["Instance","Basic","Tile", "Dimension Z", "Animate", "Advanced"]'
//% block="3D Render"
namespace Render {
    export enum attribute {
        //% block="Zoom"
        view_zoom,
        //% block="Pitch"
        view_pitch,
        dirX,
        dirY,
        // fov,
        // wallZScale,
    }

    /**
 * set side a texture for a kind of tile. Set for all walls as side texture, if no target tile specific."
 * @param tex
 * @param forTile
 */
    //% blockId=set_texture_for_tile block="set side texture$tex|| for tile $forTile"
    //% tex.shadow=tileset_tile_picker
    //% tex.decompileIndirectFixedInstances=true
    //% forTile.shadow=tileset_tile_picker
    //% forTile.decompileIndirectFixedInstances=true
    //% group="Tile"
    //% weight=100
    export function setTileAt(tex: Image, forTile?:Image): void {
        myRender.setWallSideTexture(tex, forTile)
    }

    export class Animations {
        constructor(public frameInterval: number, public animations: Image[][]) {
        }

        msLast = 0
        index = 0
        iAnimation = 0
        getFrameByDir(dir: number): Image {
            if (control.millis() - this.msLast > this.frameInterval) {
                this.msLast = control.millis()
                this.index++
                while(dir<0) dir+=1 //make sure dir>0
                this.iAnimation = Math.round((dir * this.animations.length)) % this.animations.length
                if (this.index >= this.animations[this.iAnimation].length)
                    this.index = 0
            }
            return this.animations[this.iAnimation][this.index]
        }
    }

    /**
 * Apply a directional image animations on a sprite
 * @param sprite the sprite to animate on
 * @param animations the directional animates
 */
    //% blockId=set_animation
    //% block="set $sprite=variables_get(mySprite) with animations$animations"
    //% animations.shadow=create_animation
    //% group="Animate"
    //% weight=100
    //% help=github:pxt-raycasting/docs/set-sprite-animations
    export function setSpriteAnimations(sprite: Sprite, animations: Animations) {
        myRender.spriteAnimations[sprite.id] = animations
    }

    /**
 * Create a directional image animations, multi animations will applied to one round dirctions averagely, start from the left. 
 * The reason that directions start from left, is almost all Arcade out-of-box 1 or 2-dirction images are facing left, so that would be convient for using.
 * @param frameInterval the time between changes, eg: 150
 * @param frames1 animation, if this is the first of multi animation it will be used as left, others will 
 * @param frames2 optional, used for 2 or more dirctional
 * @param frames3 optional, used for 3 or more dirctional
 * @param frames4 optional, used for 4 or more dirctional
 */
    //% blockId=create_animation
    //% block="interval$frameInterval=timePicker animates:$frames1=animation_editor|| $frames2=animation_editor $frames3=animation_editor $frames4=animation_editor"
    //% inlineInputMode=inline
    //% group="Animate"
    //% weight=100
    //% help=github:pxt-raycasting/docs/create-animations
    export function createAnimations(frameInterval: number, frames1: Image[], frames2?: Image[], frames3?: Image[], frames4?: Image[]): Animations {
        const animationList = [frames1]
        if (frames2) animationList.push(frames2)
        if (frames3) animationList.push(frames3)
        if (frames4) animationList.push(frames4)
        return new Animations(frameInterval, animationList)
    }

    /**
     * Get the Render
     * @param img the image
     */
    //% group="Instance"
    //% blockId=rcRender_getRCRenderInstance block="raycasting render"
    //% expandableArgumentMode=toggle
    //% weight=100 
    //% blockHidden=true
    //% hidden=1
    export function getRCRenderInstance(): IsometricRender_Sideview {
        return myRender
    }

    /**
     * Get the render Sprite, which create automatically, for physical collisions, and holding the view point.
     * You can consider it as "myself", and operate it like a usual sprite, eg.: position, speed, scale, collision, ...
     * But properties relative 3D, eg. ZOffset, ZPosition, viewAngle, and etc. are not in the Sprite class.
     */
    //% group="Instance"
    //% blockId=rcRender_getRenderSpriteVariable block="myself sprite"
    //% expandableArgumentMode=toggle
    //% blockSetVariable=mySprite
    //% weight=99
    //% help=github:pxt-raycasting/get-render-sprite-variable
    export function getRenderSpriteVariable(): Sprite {
        return myRender.sprSelf
    }

    /**
     * Get the render Sprite, which create automatically, for physical collisions, and holding the view point.(but get/set view direction with dirX/dirY, which not in the Sprite class) 
     * You can consider it as "myself", and operate it like a usual sprite.
     * eg: position, speed, scale, collision, ...
     */
    //% group="Instance"
    //% blockId=rcRender_getRenderSpriteInstance block="myself sprite"
    //% expandableArgumentMode=toggle
    //% weight=98
    //% help=github:pxt-raycasting/docs/get-render-sprite-instance
    export function getRenderSpriteInstance(): Sprite {
        return myRender.sprSelf
    }

    /**
     * Toggle current view mode
     */
    //% blockId=rcRender_toggleViewMode block="toggle current view mode"
    //% group="Basic"
    //% weight=89
    //% help=github:pxt-raycasting/docs/toggle-view-mode
    export function toggleViewMode() {
        myRender.viewMode = myRender.viewMode == ViewMode.tilemapView ? ViewMode.isometricView : ViewMode.tilemapView
    }

    /**
     * Current view mode is the specific one?
     * @param viewMode
     */
    //% blockId=rcRender_isViewMode block="current is $viewMode"
    //% group="Basic"
    //% weight=88
    //% help=github:pxt-raycasting/docs/is-view-mode
    export function isViewMode(viewMode: ViewMode): boolean {
        return viewMode == myRender.viewMode
    }

    /**
     * Set view mode
     * @param viewMode
     */
    //% blockId=rcRender_setViewMode block="set view mode $viewMode"
    //% group="Basic"
    //% weight=87
    //% help=github:pxt-raycasting/docs/set-view-mode
    export function setViewMode(viewMode: ViewMode) {
        myRender.viewMode = viewMode
    }

    /**
     * Get render arribute
     * @param viewMode
     */
    //% group="Basic"
    //% block="get %attribute" 
    //% blockId=rcRender_getAttribute
    //% weight=83
    //% help=github:pxt-raycasting/docs/get-attribute
    export function getAttribute(attr: attribute): number {
        switch (attr) {
            case attribute.view_zoom:
                return getScale()
            case attribute.view_pitch:
                return getScaleY()
            case attribute.dirX:
                return myRender.dirX
            case attribute.dirY:
                return myRender.dirY
        /*
            case attribute.fov:
                return myRender.fov
            case attribute.wallZScale:
                return myRender.wallZScale
        */
            default:
                return 0
        }
    }

    /**
     * Set render arribute
     * @param viewMode
     */
    //% group="Basic"
    //% block="set %attribute = %value" 
    //% blockId=rcRender_setAttribute
    //% weight=82
    //% help=github:pxt-raycasting/docs/set-attribute
    export function setAttribute(attr: attribute, value: number) {
        switch (attr) {
            case attribute.view_zoom:
                setScale(value)
                break
            case attribute.view_pitch:
                setScaleY(value)
                break
            case attribute.dirX:
                myRender.dirX = value
                break
            case attribute.dirY:
                myRender.dirY = value
                break
        /*
            case attribute.fov:
                if (value < 0) value = 0
                myRender.fov = value
                break
            case attribute.wallZScale:
                if (value < 0) value = 0
                myRender.wallZScale = value
                break
        */
            default:
        }
    }

    /**
     * Get default FOV (field of view) value
     * @param viewMode
    //% group="Basic"
    //% block="defaultFov"
    //% blockId=rcRender_getDefaultFov
    //% weight=81
    //% help=github:pxt-raycasting/docs/get-default-fov
    export function getDefaultFov(): number {
        return defaultFov
    }
     */

    /**
     * Set view angle
     * @param angle, unit: degree 0~360
     */
    //% blockId=rcRender_setViewAngleInDegree block="set view angle$angle"
    //% angle.min=0 angle.max=360 angle.defl=90
    //% group="Basic"
    //% weight=80
    //% help=github:pxt-raycasting/docs/set-view-angle-in-degree
    export function setViewAngleInDegree(angle: number) {
        myRender.viewAngle = angle * Math.PI / 180
    }

    /**
     * Set view angle by dirX and dirY
     * @param dirX
     * @param dirY
     */
    //% blockId=rcRender_setViewAngle block="set view angle by dirX%dirX and dirY%dirY"
    //% group="Basic"
    //% weight=79
    //% help=github:pxt-raycasting/docs/set-view-angle
    export function setViewAngle(dirX: number, dirY: number) {
        myRender.viewAngle = Math.atan2(dirY, dirX)
    }

    /**
     * Set floating offset height for a sprite at Z direction
     * @param sprite
     * @param Zoffset Negative floats down, affirmative goes up
     * @param duration moving time, 0 for immediately, unit: ms
    //% blockId=rcRender_setZOffset block="set Sprite %spr=variables_get(mySprite) floating %offset pixels|| duration $duration=timePicker|ms "
    //% offset.min=-100 offset.max=100 offset.defl=8
    //% duration.min=0 duration.max=5000 duration.defl=0
    //% group="Dimension Z"
    //% weight=77
    //% blockHidden
    //% help=github:pxt-raycasting/docs/set-z-offset
    export function setZOffset(sprite: Sprite, offset: number, duration?: number) {
        myRender.setZOffset(sprite, offset, duration)
    }
     */

    /**
     * Set arribute of a Sprite
     * @param spr Sprite
     * @param attr RCSpriteAttribute
    //% group="Dimension Z"
    //% block="set Sprite %spr=variables_get(mySprite) %attribute = %value"
    //% blockId=rcRender_setSpriteAttribute
    //% weight=75
    //% help=github:pxt-raycasting/docs/set-sprite-attribute
    export function setSpriteAttribute(spr: Sprite, attr: RCSpriteAttribute, value: number) {
        switch (attr) {
            case RCSpriteAttribute.ZOffset:
                myRender.setZOffset(spr, value, 0)
                break
            case RCSpriteAttribute.ZPosition:
                myRender.getMotionZ(spr).p = Render.tofpx(value)
                break
            case RCSpriteAttribute.ZVelocity:
                myRender.getMotionZ(spr).v = Render.tofpx(value)
                break
            case RCSpriteAttribute.ZAcceleration:
                myRender.getMotionZ(spr).a = Render.tofpx(value)
                break
            default:
        }
    }
     */

    /**
     * Get arribute of a Sprite
     * @param spr Sprite
     * @param attr RCSpriteAttribute
    //% group="Dimension Z"
    //% block="get Sprite %spr=variables_get(mySprite) %attribute"
    //% blockId=rcRender_getSpriteAttribute
    //% weight=74
    //% help=github:pxt-raycasting/docs/get-sprite-attribute
    export function getSpriteAttribute(spr:Sprite, attr: RCSpriteAttribute): number {
        switch (attr) {
            case RCSpriteAttribute.ZOffset:
                return myRender.getMotionZ(spr).offset
            case RCSpriteAttribute.ZPosition:
                return myRender.getMotionZ(spr).p << Render.fpx
            case RCSpriteAttribute.ZVelocity:
                return myRender.getMotionZ(spr).v << Render.fpx
            case RCSpriteAttribute.ZAcceleration:
                return myRender.getMotionZ(spr).a << Render.fpx
            default:
                return 0
        }
    }
     */

    /**
     * Check if 2 sprites overlaps each another in Z dimension
     * Best work together with sprites.onOverlap(kind1, kind2)
     * @param sprite1
     * @param sprite2
    //% blockId=rcRender_isSpritesOverlapZ
    //% block="is sprites $sprite1=variables_get(mySprite) and $sprite2=variables_get(mySprite2) overlaps in Z dimension"
    //% group="Dimension Z"
    //% weight=71
    //% help=github:pxt-raycasting/docs/is-sprites-overlap-z
    export function isSpritesOverlapZ(sprite1: Sprite, sprite2: Sprite): boolean {
        return myRender.isOverlapZ(sprite1, sprite2)
    }
     */

    /**
     * Make sprite jump, with specific height and duration
     * Jump can only happened when sprite is standing, current height = its offset .
     * @param sprite
     * @param height jump height in pixel
     * @param duration hover time span, unit: ms
    //% blockId=rcRender_jumpWithHeightAndDuration block="Sprite %spr=variables_get(mySprite) jump, with height $height duration $duration=timePicker|ms "
    //% height.min=0 height.max=100 height.defl=16
    //% duration.min=50 duration.max=5000 duration.defl=500
    //% group="Dimension Z"
    //% weight=70
    //% help=github:pxt-raycasting/docs/jump-with-height-and-duration
    export function jumpWithHeightAndDuration(sprite: Sprite, height: number, duration: number) {
        myRender.jumpWithHeightAndDuration(sprite, height, duration)
    }
     */

    /**
     * Make sprite jump, with specific speed and acceleration
     * Simular with Move block, but jump can only happened when sprite is standing, current height = its offset.
     * @param sprite
     * @param v vetical speed, unit: pixel/s
     * @param a vetical acceleration, unit: pixel/s²
    //% blockId=rcRender_jump block="Sprite %spr=variables_get(mySprite) jump||, with speed $v=spriteSpeedPicker acceleration $a"
    //% v.min=-100 v.max=100 v.defl=60
    //% a.min=-1000 a.max=1000 a.defl=-250
    //% group="Dimension Z"
    //% weight=68
    //% help=github:pxt-raycasting/docs/jump
    export function jump(sprite: Sprite, v?: number, a?: number) {
        myRender.jump(sprite, v, a)
    }
     */

    /**
     * Make sprite jump, with specific speed and acceleration
     * @param sprite
     * @param v vetical speed, unit: pixel/s
     * @param a vetical acceleration, unit: pixel/s²
    //% blockId=rcRender_move block="Sprite %spr=variables_get(mySprite) move, with speed $v=spriteSpeedPicker|| acceleration $a"
    //% v.min=-200 v.max=200 v.defl=60
    //% a.min=-1000 a.max=1000 a.defl=-250
    //% group="Dimension Z"
    //% weight=66
    //% help=github:pxt-raycasting/docs/move
    export function move(sprite: Sprite, v?: number, a?: number) {
        myRender.move(sprite, v, a)
    }
     */


    /**
     * Control the self sprite using the direction buttons from the controller. 
     * To stop controlling self sprite, pass 0 for v and va.
     *
     * @param v The velocity used for forward/backword movement when up/down is pressed, in pixel/s
     * @param va The angle velocity used for turn view direction when left/right is pressed, in radian/s.
    //% blockId="rcRender_moveWithController" block="move with buttons velocity $v|| turn speed $va camera sway$cameraSway pixels"
    //% weight=60
    //% expandableArgumentMode="toggle"
    //% v.defl=2 va.defl=3
    //% group="Advanced"
    //% v.shadow="spriteSpeedPicker"
    //% va.shadow="spriteSpeedPicker"
    //% help=github:pxt-raycasting/docs/move-with-controller
    export function moveWithController(v: number = 2, va: number = 3, cameraSway?:number) {
        myRender.velocity = v
        myRender.velocityAngle = va
        if(cameraSway!=undefined)
            myRender.cameraSway=cameraSway|0
    }
     */

    /**
     * Render takeover all sprites in current scene
     * Render will call this automatically, but maybe not in time enough.
     * If you saw sprite draw at its tilemap position on screen, call this just after created the sprite.
     */
    //% blockId=rcRender_takeoverSceneSprites 
    //% block="takeover sprites in scene"
    //% group="Advanced"
    //% weight=49
    //% help=github:pxt-raycasting/docs/takeover-scene-sprites
    export function takeoverSceneSprites() {
        myRender.takeoverSceneSprites()
    }

    /**
     * Run on sprite dirction updated, present view point to Sprite facing dirction, or which angle you see of the sprite.
     * Just using with other animation extensions, to set proper Image for sprite.
     * Not required, if you have used the set animations block provided.
     * @param dir It is a float number, 0~1 corresponds to 0~360°, suggest use Math.round(dir*dirAniTotalCount)%dirAniTotalCount to get index of direction
    //% blockId=rcRender_registerOnSpriteDirectionUpdateHandler
    //% block="run code when sprite $spr dirction updated to $dir"
    //% draggableParameters
    //% group="Advanced"
    //% weight=48
    //% help=github:pxt-raycasting/docs/register-on-sprite-direction-update-handler
    export function registerOnSpriteDirectionUpdateHandler(handler: (spr: Sprite, dir: number) => void) {
        myRender.registerOnSpriteDirectionUpdate(handler)
    }
     */
}
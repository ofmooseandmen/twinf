import { Offset } from './pixels'
import { load } from 'opentype.js'

interface OpenTypeFont extends opentypejs.Font {}

export class CharacterInRaster {
    readonly bl: Offset
    readonly w: number
    readonly h: number

    constructor (bl: Offset, w: number, h: number) {
        this.bl = bl
        this.w = w
        this.h = h
    }
    static fromLiteral(data: any): CharacterInRaster {
        return new CharacterInRaster(Offset.fromLiteral(data['bl']), data['w'], data['h'])
    }
}

export class CharacterGeometry {

    private readonly _textureWidth: number
    private readonly _textureHeight: number
    private readonly charGeom: Map<string, CharacterInRaster>

    constructor(charBoundingBoxes: Map<string, CharacterInRaster> = new Map(),
        textureWidth: number = 1, textureHeight: number = 1) {
        this._textureWidth = textureWidth
        this._textureHeight = textureHeight
        this.charGeom = charBoundingBoxes
    }

    static fromLiteral(data: any): CharacterGeometry {
        const charBoundingBoxes: Map<string, CharacterInRaster> = new Map()
        for (let [char, bb] of data) {
            charBoundingBoxes.set(char, CharacterInRaster.fromLiteral(bb))
        }
        return new CharacterGeometry(charBoundingBoxes, data['_textureWidth'], data['_textureHeight'])
    }

    textureWidth() : number {
        return this._textureWidth
    }

    textureHeight() : number {
        return this._textureHeight
    }

    char(char: string) : CharacterInRaster {
        if (char.length !== 1) {
            console.log("Invalid char '" + char + "'")
            throw new Error("Invalid character")
        }
        const bb = this.charGeom.get(char)
        if (!bb) {
            console.log("No bounding box for char '" + char + "'")
            throw new Error("Unknown character")
        }
        return bb
    }
}

type CharacterOnCanvas = {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
}

export class Characters extends CharacterGeometry {

    /** The final combined rastered image of every glyph. */
    readonly raster: ImageData

    /** Canvas margin below the character glyphs. */
    static readonly MARGIN_BOTTOM_PX = 3

    /** Canvas margin above the character glyphs. */
    static readonly MARGIN_TOP_PX = 2

    /** Margin between the character glyphs. */
    static readonly MARGIN_BW_PX = 2

    /** Set of supported characters. */
    static readonly CHARACTER_SET: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!?*'

    private constructor(charBoundingBoxes: Map<string, CharacterInRaster>, raster: ImageData) {
        super(charBoundingBoxes, raster.width, raster.height)
        this.raster = raster
    }

    /**
     * Given a font, promise to load and pack the font into a rastered image, as well
     * as providing details on where each glyph occurs on the rastered image.
     * 
     * @param font the font to pack into an image
     * @returns a promise of characters
     */
    static async pack(font: FontDescriptor) : Promise<Characters> {
        return new Promise<OpenTypeFont>((resolve, reject) => {
            load(font.url, (err: any, font: OpenTypeFont | undefined) => {
                if (err || !font) {
                    console.log("Unable to load font: " + font)
                    console.log(err)
                    reject("Font unable to be loaded.")
                    return
                }
                resolve(font)
            })
        }).then(fontOtf => Characters.rasterOtf(fontOtf, font.fontSize)).catch(rej => {
            throw new Error("Unable to create font pack.")
        })
    }

    private static rasterOtf(font: OpenTypeFont, fontSize: number) : Characters {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (ctx === null) {
            console.log("Unable to raster; raster canvas is null")
            throw new Error("Unable to create font pack. Canvas capability not available.")
        }

        let totalWidth = 0
        let maxHeight = 0
        /* min yMin across all characters (negative). */
        let minYMin = 0

        for (const char of Characters.CHARACTER_SET) {
            const glyph = font.charToGlyph(char)
            const width = (glyph.advanceWidth / font.unitsPerEm) * fontSize
            const height = ((glyph['yMax'] - glyph['yMin']) / font.unitsPerEm) * fontSize

            totalWidth += width + 2

            if (height > maxHeight) {
                maxHeight = height
            }
            if (glyph['yMin'] < minYMin) {
                minYMin = glyph['yMin']
            }
        }
        canvas.width = totalWidth
        canvas.height = maxHeight + Characters.MARGIN_BOTTOM_PX

        let currentX = 0
        
        const charData: Map<string, CharacterOnCanvas> = new Map()
        const charsInRaster: Map<string, CharacterInRaster> = new Map()

        for (const char of Characters.CHARACTER_SET) {
            const glyph = font.charToGlyph(char)
            const width = (glyph.advanceWidth / font.unitsPerEm) * fontSize

            const path: any = glyph.getPath(currentX, Characters.MARGIN_TOP_PX + maxHeight + minYMin / font.unitsPerEm * fontSize, fontSize)
            path.fill = 'white'
            path.draw(ctx)

            charData.set(char, {
                x: currentX,
                y: 0,
                width: width,
                height: maxHeight,
            })
            currentX += width + Characters.MARGIN_BW_PX
        }
        for (let [key, c] of charData) {
            charsInRaster.set(key, new CharacterInRaster(
                new Offset(c.x, c.y + c.height - maxHeight),
                c.width,
                c.height + Characters.MARGIN_TOP_PX
            ))
        }
        return new Characters(charsInRaster, ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        ))
    }
}

export class FontDescriptor {
    readonly family: string
    readonly fontSize: number
    readonly url: string
    constructor(family: string, fontSize: number, url: string) {
        this.family = family
        this.fontSize = fontSize
        this.url = url
    }
}

export class Font extends FontFace {
    readonly fontSize: number
    constructor(fam: string, fontSize: number, url: string) {
        super(fam, url)
        this.fontSize = fontSize
    }
}
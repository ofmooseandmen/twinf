import { Offset } from './pixels'
import { load } from 'opentype.js'

interface OpenTypeFont extends opentypejs.Font {}

export class CharacterInRaster {
    /** Bottom left coordinate of character. */
    readonly bl: Offset
    /** Width of character in pixels. */
    readonly w: number
    /** Height of character in pixels. */
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

export type CharacterGeometry = {
    [id: string]: CharacterInRaster
}

export class Sprites {
    /** A mapping of character to its position in the raster. */
    private readonly charGeom: CharacterGeometry

    constructor(charBoundingBoxes: CharacterGeometry = {}) {
        this.charGeom = charBoundingBoxes
    }

    static fromLiteral(data: any): Sprites {
        const charBoundingBoxes: CharacterGeometry = {}
        for (let char in data.charGeom) {
            charBoundingBoxes[char] = CharacterInRaster.fromLiteral(data.charGeom[char])
        }
        return new Sprites(charBoundingBoxes)
    }

    char(char: string) : CharacterInRaster {
        if (char.length !== 1) {
            console.log("Invalid char '" + char + "'")
            throw new Error("Invalid character")
        }
        const bb = this.charGeom[char]
        if (!bb) {
            console.log("No bounding box for char '" + char + "'")
            throw new Error("Unknown character")
        }
        return bb
    }
}

/** For identifying the position and size of glyphs rendered onto an intermeditate 2D canvas. */
type CharactersOnCanvas  = {
    [id: string]: {
        readonly x: number
        readonly y: number
        readonly width: number
        readonly height: number
    }
}

export class Characters extends Sprites {

    /** The final combined rastered image of all glyphs. */
    readonly raster: ImageData

    /** Canvas margin below the character glyphs. */
    static readonly MARGIN_BOTTOM_PX = 3

    /** Canvas margin above the character glyphs. */
    static readonly MARGIN_TOP_PX = 2

    /** Margin between the character glyphs. */
    static readonly MARGIN_BW_PX = 2

    /** Set of supported characters. */
    static readonly CHARACTER_SET: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!?*'

    private constructor(charBoundingBoxes: CharacterGeometry, raster: ImageData) {
        super(charBoundingBoxes)
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

    /**
     * Render a provided font onto an intermediate 2D canvas, and return both the final
     * rastered image of all the glyphs and their positions and dimensions.
     *
     * @param font to rasterise
     * @param fontSize to render each glyph in
     * @returns a single raster of the font and dimensions of each glyph
     */
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
        
        const charData: CharactersOnCanvas = {}

        for (const char of Characters.CHARACTER_SET) {
            const glyph = font.charToGlyph(char)
            const width = (glyph.advanceWidth / font.unitsPerEm) * fontSize

            const path: any = glyph.getPath(currentX, Characters.MARGIN_TOP_PX + maxHeight + minYMin / font.unitsPerEm * fontSize, fontSize)
            path.fill = 'white'
            path.draw(ctx)

            charData[char] = {
                x: currentX,
                y: 0,
                width: width,
                height: maxHeight,
            }
            currentX += width + Characters.MARGIN_BW_PX
        }

        const charsInRaster: CharacterGeometry = {}
        for (let k in charData) {
            const c = charData[k]
            charsInRaster[k] = new CharacterInRaster(
                new Offset(c.x, c.y + c.height - maxHeight),
                c.width,
                c.height + Characters.MARGIN_TOP_PX
            )
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
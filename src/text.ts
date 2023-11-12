import { Offset } from './pixels'
import { load } from 'opentype.js'

interface OpenTypeFont extends opentypejs.Font {}

/** For identifying the position and size of glyphs rendered onto an intermeditate 2D canvas. */
type TextOnCanvas  = {
    [id: string]: {
        readonly x: number
        readonly y: number
        readonly width: number
        readonly height: number
    }
}

type FontRasterDimensions = {
    width: number,
    height: number,
    baseline: number
}

/**
 * Class for rasterizing text onto a canvas.
 */
export class Text {

    /** Canvas margin below the character glyphs. */
    static readonly MARGIN_BOTTOM_PX = 3

    /** Canvas margin above the character glyphs. */
    static readonly MARGIN_TOP_PX = 2

    /** Margin between the character glyphs. */
    static readonly MARGIN_BW_PX = 2

    /** Minimum supported ascii character code. */
    static readonly MIN_ASCII = 32

    /** Maximum supported ascii character code. */
    static readonly MAX_ASCII = 127

    /**
     * Given a font, promise to load and pack the font into a rastered image, as well
     * as providing details on where each glyph occurs on the rastered image.
     * 
     * @param font the font to pack into an image
     * @returns a promise of characters
     */
    static async pack(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, font: FontDescriptor) : Promise<TextOnCanvas> {
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
        })
        .then(fontOtf => {
            const dim = Text.bounds(fontOtf, font.fontSize)
            canvas.width = dim.width
            canvas.height = dim.height
            return Text.rasterOtf(ctx, 0, 0, dim, fontOtf, font.fontSize)
        })
        .catch(rej => {
            throw new Error("Unable to create font raster.")
        })
    }

    /**
     * Given a font and a fontsize, return the canvas bounds of that font if
     * all chars were rastered onto canvas.
     *
     * @param font opentype font
     * @param fontSize to compute the bounds at
     * @returns dimensions
     */
    private static bounds(font: OpenTypeFont, fontSize: number) : FontRasterDimensions {
        let totalWidth = 0
        let maxHeight = 0
        /* min yMin across all characters (negative). */
        let minYMin = 0
        for (let i=Text.MIN_ASCII; i< Text.MAX_ASCII; i++) {
            const char = String.fromCharCode(i)
            console.log(char)
            const glyph = font.charToGlyph(char)
            if (!glyph) {
                console.log("Character not found in font: " + char)
            }
            const width = (glyph.advanceWidth / font.unitsPerEm) * fontSize
            const height = ((glyph['yMax'] - glyph['yMin']) / font.unitsPerEm) * fontSize

            totalWidth += width + Text.MARGIN_BW_PX

            if (height > maxHeight) {
                maxHeight = height
            }
            if (glyph['yMin'] < minYMin) {
                minYMin = glyph['yMin']
            }
        }
        return {
            width: totalWidth,
            height: Text.MARGIN_TOP_PX + maxHeight + Text.MARGIN_BOTTOM_PX,
            baseline: Text.MARGIN_TOP_PX + maxHeight + minYMin / font.unitsPerEm * fontSize
        }
    }

    /**
     * Render a provided font onto an intermediate 2D canvas, and return both the final
     * rastered image of all the glyphs and their positions and dimensions.
     *
     * @param ctx canvas context
     * @param minX minimum x coord to draw the raster
     * @param minY minimum y coord to draw the raster
     * @param dim dimensions of the rastered fontset
     * @param font to rasterise
     * @param fontSize to render each glyph in
     * @returns a single raster of the font and dimensions of each glyph
     */
    private static rasterOtf(ctx: CanvasRenderingContext2D, minX: number, minY: number,
         dim: FontRasterDimensions, font: OpenTypeFont, fontSize: number) : TextOnCanvas {
        let currentX = minX
        const charData: TextOnCanvas = {}

        for (let i=Text.MIN_ASCII; i< Text.MAX_ASCII; i++) {
            const char = String.fromCharCode(i)
            const glyph = font.charToGlyph(char)
            const width = (glyph.advanceWidth / font.unitsPerEm) * fontSize

            const path: any = glyph.getPath(currentX, dim.baseline, fontSize)
            path.fill = 'white'
            path.draw(ctx)

            charData[char] = {
                x: currentX,
                y: minY,
                width: width,
                height: dim.height,
            }
            currentX += width + Text.MARGIN_BW_PX
        }
        return charData
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
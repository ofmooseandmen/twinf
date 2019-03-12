/**
 * A colour.
 */
export class Colour {

    /** RGBA byte 0 is alpha [0, 100], byte 1,2 and 3 are green blue and red [0, 255]. */
    private readonly _rgba: number

    private constructor(red: number, green: number, blue: number, alpha: number) {
        let rgba = Colour.clamp(red, 255)
        rgba = (rgba << 8) + Colour.clamp(green, 255)
        rgba = (rgba << 8) + Colour.clamp(blue, 255)
        rgba = (rgba << 8) + Colour.clamp(alpha * 100, 100)
        this._rgba = rgba
    }

    /** the colour transparent with an ARGB value of #00000000. */
    static readonly TRANSPARENT = new Colour(0, 0, 0, 0)

    /** the colour aliceblue with an RGB value of #F0F8FF. */
    static readonly ALICEBLUE = new Colour(240, 248, 255, 1.0)

    /** the colour antiquewhite with an RGB value of #FAEBD7. */
    static readonly ANTIQUEWHITE = new Colour(250, 235, 215, 1.0)

    /** the colour aqua with an RGB value of #00FFFF. */
    static readonly AQUA = new Colour(0, 255, 255, 1.0)

    /** the colour aquamarine with an RGB value of #7FFFD4. */
    static readonly AQUAMARINE = new Colour(127, 255, 212, 1.0)

    /** the colour azure with an RGB value of #F0FFFF. */
    static readonly AZURE = new Colour(240, 255, 255, 1.0)

    /** the colour beige with an RGB value of #F5F5DC. */
    static readonly BEIGE = new Colour(245, 245, 220, 1.0)

    /** the colour bisque with an RGB value of #FFE4C4. */
    static readonly BISQUE = new Colour(255, 228, 196, 1.0)

    /** the colour black with an RGB value of #000000. */
    static readonly BLACK = new Colour(0, 0, 0, 1.0)

    /** the colour blanchedalmond with an RGB value of #FFEBCD. */
    static readonly BLANCHEDALMOND = new Colour(255, 235, 205, 1.0)

    /** the colour blue with an RGB value of #0000FF. */
    static readonly BLUE = new Colour(0, 0, 255, 1.0)

    /** the colour blueviolet with an RGB value of #8A2BE2. */
    static readonly BLUEVIOLET = new Colour(138, 43, 226, 1.0)

    /** the colour brown with an RGB value of #A52A2A. */
    static readonly BROWN = new Colour(165, 42, 42, 1.0)

    /** the colour burlywood with an RGB value of #DEB887. */
    static readonly BURLYWOOD = new Colour(222, 184, 135, 1.0)

    /** the colour cadetblue with an RGB value of #5F9EA0. */
    static readonly CADETBLUE = new Colour(95, 158, 160, 1.0)

    /** the colour chartreuse with an RGB value of #7FFF00. */
    static readonly CHARTREUSE = new Colour(127, 255, 0, 1.0)

    /** the colour chocolate with an RGB value of #D2691E. */
    static readonly CHOCOLATE = new Colour(210, 105, 30, 1.0)

    /** the colour coral with an RGB value of #FF7F50. */
    static readonly CORAL = new Colour(255, 127, 80, 1.0)

    /** the colour cornflowerblue with an RGB value of #6495ED. */
    static readonly CORNFLOWERBLUE = new Colour(100, 149, 237, 1.0)

    /** the colour cornsilk with an RGB value of #FFF8DC. */
    static readonly CORNSILK = new Colour(255, 248, 220, 1.0)

    /** the colour crimson with an RGB value of #DC143C. */
    static readonly CRIMSON = new Colour(220, 20, 60, 1.0)

    /** the colour cyan with an RGB value of #00FFFF. */
    static readonly CYAN = new Colour(0, 255, 255, 1.0)

    /** the colour darkblue with an RGB value of #00008B. */
    static readonly DARKBLUE = new Colour(0, 0, 139, 1.0)

    /** the colour darkcyan with an RGB value of #008B8B. */
    static readonly DARKCYAN = new Colour(0, 139, 139, 1.0)

    /** the colour darkgoldenrod with an RGB value of #B8860B. */
    static readonly DARKGOLDENROD = new Colour(184, 134, 11, 1.0)

    /** the colour darkgray with an RGB value of #A9A9A9. */
    static readonly DARKGRAY = new Colour(169, 169, 169, 1.0)

    /** the colour darkgreen with an RGB value of #006400. */
    static readonly DARKGREEN = new Colour(0, 100, 0, 1.0)

    /** the colour darkgrey with an RGB value of #A9A9A9. */
    static readonly DARKGREY = new Colour(169, 169, 169, 1.0)

    /** the colour darkkhaki with an RGB value of #BDB76B. */
    static readonly DARKKHAKI = new Colour(189, 183, 107, 1.0)

    /** the colour darkmagenta with an RGB value of #8B008B. */
    static readonly DARKMAGENTA = new Colour(139, 0, 139, 1.0)

    /** the colour darkolivegreen with an RGB value of #556B2F. */
    static readonly DARKOLIVEGREEN = new Colour(85, 107, 47, 1.0)

    /** the colour darkorange with an RGB value of #FF8C00. */
    static readonly DARKORANGE = new Colour(255, 140, 0, 1.0)

    /** the colour darkorchid with an RGB value of #9932CC. */
    static readonly DARKORCHID = new Colour(153, 50, 204, 1.0)

    /** the colour darkred with an RGB value of #8B0000. */
    static readonly DARKRED = new Colour(139, 0, 0, 1.0)

    /** the colour darksalmon with an RGB value of #E9967A. */
    static readonly DARKSALMON = new Colour(233, 150, 122, 1.0)

    /** the colour darkseagreen with an RGB value of #8FBC8F. */
    static readonly DARKSEAGREEN = new Colour(143, 188, 143, 1.0)

    /** the colour darkslateblue with an RGB value of #483D8B. */
    static readonly DARKSLATEBLUE = new Colour(72, 61, 139, 1.0)

    /** the colour darkslategray with an RGB value of #2F4F4F. */
    static readonly DARKSLATEGRAY = new Colour(47, 79, 79, 1.0)

    /** the colour darkslategrey with an RGB value of #2F4F4F. */
    static readonly DARKSLATEGREY = new Colour(47, 79, 79, 1.0)

    /** the colour darkturquoise with an RGB value of #00CED1. */
    static readonly DARKTURQUOISE = new Colour(0, 206, 209, 1.0)

    /** the colour darkviolet with an RGB value of #9400D3. */
    static readonly DARKVIOLET = new Colour(148, 0, 211, 1.0)

    /** the colour deeppink with an RGB value of #FF1493. */
    static readonly DEEPPINK = new Colour(255, 20, 147, 1.0)

    /** the colour deepskyblue with an RGB value of #00BFFF. */
    static readonly DEEPSKYBLUE = new Colour(0, 191, 255, 1.0)

    /** the colour dimgray with an RGB value of #696969. */
    static readonly DIMGRAY = new Colour(105, 105, 105, 1.0)

    /** the colour dimgrey with an RGB value of #696969. */
    static readonly DIMGREY = new Colour(105, 105, 105, 1.0)

    /** the colour dodgerblue with an RGB value of #1E90FF. */
    static readonly DODGERBLUE = new Colour(30, 144, 255, 1.0)

    /** the colour firebrick with an RGB value of #B22222. */
    static readonly FIREBRICK = new Colour(178, 34, 34, 1.0)

    /** the colour floralwhite with an RGB value of #FFFAF0. */
    static readonly FLORALWHITE = new Colour(255, 250, 240, 1.0)

    /** the colour forestgreen with an RGB value of #228B22. */
    static readonly FORESTGREEN = new Colour(34, 139, 34, 1.0)

    /** the colour fuchsia with an RGB value of #FF00FF. */
    static readonly FUCHSIA = new Colour(255, 0, 255, 1.0)

    /** the colour gainsboro with an RGB value of #DCDCDC. */
    static readonly GAINSBORO = new Colour(220, 220, 220, 1.0)

    /** the colour ghostwhite with an RGB value of #F8F8FF. */
    static readonly GHOSTWHITE = new Colour(248, 248, 255, 1.0)

    /** the colour gold with an RGB value of #FFD700. */
    static readonly GOLD = new Colour(255, 215, 0, 1.0)

    /** the colour goldenrod with an RGB value of #DAA520. */
    static readonly GOLDENROD = new Colour(218, 165, 32, 1.0)

    /** the colour gray with an RGB value of #808080. */
    static readonly GRAY = new Colour(128, 128, 128, 1.0)

    /** the colour green with an RGB value of #008000. */
    static readonly GREEN = new Colour(0, 128, 0, 1.0)

    /** the colour greenyellow with an RGB value of #ADFF2F. */
    static readonly GREENYELLOW = new Colour(173, 255, 47, 1.0)

    /** the colour grey with an RGB value of #808080. */
    static readonly GREY = new Colour(128, 128, 128, 1.0)

    /** the colour honeydew with an RGB value of #F0FFF0. */
    static readonly HONEYDEW = new Colour(240, 255, 240, 1.0)

    /** the colour hotpink with an RGB value of #FF69B4. */
    static readonly HOTPINK = new Colour(255, 105, 180, 1.0)

    /** the colour indianred with an RGB value of #CD5C5C. */
    static readonly INDIANRED = new Colour(205, 92, 92, 1.0)

    /** the colour indigo with an RGB value of #4B0082. */
    static readonly INDIGO = new Colour(75, 0, 130, 1.0)

    /** the colour ivory with an RGB value of #FFFFF0. */
    static readonly IVORY = new Colour(255, 255, 240, 1.0)

    /** the colour khaki with an RGB value of #F0E68C. */
    static readonly KHAKI = new Colour(240, 230, 140, 1.0)

    /** the colour lavender with an RGB value of #E6E6FA. */
    static readonly LAVENDER = new Colour(230, 230, 250, 1.0)

    /** the colour lavenderblush with an RGB value of #FFF0F5. */
    static readonly LAVENDERBLUSH = new Colour(255, 240, 245, 1.0)

    /** the colour lawngreen with an RGB value of #7CFC00. */
    static readonly LAWNGREEN = new Colour(124, 252, 0, 1.0)

    /** the colour lemonchiffon with an RGB value of #FFFACD. */
    static readonly LEMONCHIFFON = new Colour(255, 250, 205, 1.0)

    /** the colour lightblue with an RGB value of #ADD8E6. */
    static readonly LIGHTBLUE = new Colour(173, 216, 230, 1.0)

    /** the colour lightcoral with an RGB value of #F08080. */
    static readonly LIGHTCORAL = new Colour(240, 128, 128, 1.0)

    /** the colour lightcyan with an RGB value of #E0FFFF. */
    static readonly LIGHTCYAN = new Colour(224, 255, 255, 1.0)

    /** the colour lightgoldenrodyellow with an RGB value of #FAFAD2. */
    static readonly LIGHTGOLDENRODYELLOW = new Colour(250, 250, 210, 1.0)

    /** the colour lightgray with an RGB value of #D3D3D3. */
    static readonly LIGHTGRAY = new Colour(211, 211, 211, 1.0)

    /** the colour lightgreen with an RGB value of #90EE90. */
    static readonly LIGHTGREEN = new Colour(144, 238, 144, 1.0)

    /** the colour lightgrey with an RGB value of #D3D3D3. */
    static readonly LIGHTGREY = new Colour(211, 211, 211, 1.0)

    /** the colour lightpink with an RGB value of #FFB6C1. */
    static readonly LIGHTPINK = new Colour(255, 182, 193, 1.0)

    /** the colour lightsalmon with an RGB value of #FFA07A. */
    static readonly LIGHTSALMON = new Colour(255, 160, 122, 1.0)

    /** the colour lightseagreen with an RGB value of #20B2AA. */
    static readonly LIGHTSEAGREEN = new Colour(32, 178, 170, 1.0)

    /** the colour lightskyblue with an RGB value of #87CEFA. */
    static readonly LIGHTSKYBLUE = new Colour(135, 206, 250, 1.0)

    /** the colour lightslategray with an RGB value of #778899. */
    static readonly LIGHTSLATEGRAY = new Colour(119, 136, 153, 1.0)

    /** the colour lightslategrey with an RGB value of #778899. */
    static readonly LIGHTSLATEGREY = new Colour(119, 136, 153, 1.0)

    /** the colour lightsteelblue with an RGB value of #B0C4DE. */
    static readonly LIGHTSTEELBLUE = new Colour(176, 196, 222, 1.0)

    /** the colour lightyellow with an RGB value of #FFFFE0. */
    static readonly LIGHTYELLOW = new Colour(255, 255, 224, 1.0)

    /** the colour lime with an RGB value of #00FF00. */
    static readonly LIME = new Colour(0, 255, 0, 1.0)

    /** the colour limegreen with an RGB value of #32CD32. */
    static readonly LIMEGREEN = new Colour(50, 205, 50, 1.0)

    /** the colour linen with an RGB value of #FAF0E6. */
    static readonly LINEN = new Colour(250, 240, 230, 1.0)

    /** the colour magenta with an RGB value of #FF00FF. */
    static readonly MAGENTA = new Colour(255, 0, 255, 1.0)

    /** the colour maroon with an RGB value of #800000. */
    static readonly MAROON = new Colour(128, 0, 0, 1.0)

    /** the colour mediumaquamarine with an RGB value of #66CDAA. */
    static readonly MEDIUMAQUAMARINE = new Colour(102, 205, 170, 1.0)

    /** the colour mediumblue with an RGB value of #0000CD. */
    static readonly MEDIUMBLUE = new Colour(0, 0, 205, 1.0)

    /** the colour mediumorchid with an RGB value of #BA55D3. */
    static readonly MEDIUMORCHID = new Colour(186, 85, 211, 1.0)

    /** the colour mediumpurple with an RGB value of #9370DB. */
    static readonly MEDIUMPURPLE = new Colour(147, 112, 219, 1.0)

    /** the colour mediumseagreen with an RGB value of #3CB371. */
    static readonly MEDIUMSEAGREEN = new Colour(60, 179, 113, 1.0)

    /** the colour mediumslateblue with an RGB value of #7B68EE. */
    static readonly MEDIUMSLATEBLUE = new Colour(123, 104, 238, 1.0)

    /** the colour mediumspringgreen with an RGB value of #00FA9A. */
    static readonly MEDIUMSPRINGGREEN = new Colour(0, 250, 154, 1.0)

    /** the colour mediumturquoise with an RGB value of #48D1CC. */
    static readonly MEDIUMTURQUOISE = new Colour(72, 209, 204, 1.0)

    /** the colour mediumvioletred with an RGB value of #C71585. */
    static readonly MEDIUMVIOLETRED = new Colour(199, 21, 133, 1.0)

    /** the colour midnightblue with an RGB value of #191970. */
    static readonly MIDNIGHTBLUE = new Colour(25, 25, 112, 1.0)

    /** the colour mintcream with an RGB value of #F5FFFA. */
    static readonly MINTCREAM = new Colour(245, 255, 250, 1.0)

    /** the colour mistyrose with an RGB value of #FFE4E1. */
    static readonly MISTYROSE = new Colour(255, 228, 225, 1.0)

    /** the colour moccasin with an RGB value of #FFE4B5. */
    static readonly MOCCASIN = new Colour(255, 228, 181, 1.0)

    /** the colour navajowhite with an RGB value of #FFDEAD. */
    static readonly NAVAJOWHITE = new Colour(255, 222, 173, 1.0)

    /** the colour navy with an RGB value of #000080. */
    static readonly NAVY = new Colour(0, 0, 128, 1.0)

    /** the colour oldlace with an RGB value of #FDF5E6. */
    static readonly OLDLACE = new Colour(253, 245, 230, 1.0)

    /** the colour olive with an RGB value of #808000. */
    static readonly OLIVE = new Colour(128, 128, 0, 1.0)

    /** the colour olivedrab with an RGB value of #6B8E23. */
    static readonly OLIVEDRAB = new Colour(107, 142, 35, 1.0)

    /** the colour orange with an RGB value of #FFA500. */
    static readonly ORANGE = new Colour(255, 165, 0, 1.0)

    /** the colour orangered with an RGB value of #FF4500. */
    static readonly ORANGERED = new Colour(255, 69, 0, 1.0)

    /** the colour orchid with an RGB value of #DA70D6. */
    static readonly ORCHID = new Colour(218, 112, 214, 1.0)

    /** the colour palegoldenrod with an RGB value of #EEE8AA. */
    static readonly PALEGOLDENROD = new Colour(238, 232, 170, 1.0)

    /** the colour palegreen with an RGB value of #98FB98. */
    static readonly PALEGREEN = new Colour(152, 251, 152, 1.0)

    /** the colour paleturquoise with an RGB value of #AFEEEE. */
    static readonly PALETURQUOISE = new Colour(175, 238, 238, 1.0)

    /** the colour palevioletred with an RGB value of #DB7093. */
    static readonly PALEVIOLETRED = new Colour(219, 112, 147, 1.0)

    /** the colour papayawhip with an RGB value of #FFEFD5. */
    static readonly PAPAYAWHIP = new Colour(255, 239, 213, 1.0)

    /** the colour peachpuff with an RGB value of #FFDAB9. */
    static readonly PEACHPUFF = new Colour(255, 218, 185, 1.0)

    /** the colour peru with an RGB value of #CD853F. */
    static readonly PERU = new Colour(205, 133, 63, 1.0)

    /** the colour pink with an RGB value of #FFC0CB. */
    static readonly PINK = new Colour(255, 192, 203, 1.0)

    /** the colour plum with an RGB value of #DDA0DD. */
    static readonly PLUM = new Colour(221, 160, 221, 1.0)

    /** the colour powderblue with an RGB value of #B0E0E6. */
    static readonly POWDERBLUE = new Colour(176, 224, 230, 1.0)

    /** the colour purple with an RGB value of #800080. */
    static readonly PURPLE = new Colour(128, 0, 128, 1.0)

    /** the colour red with an RGB value of #FF0000. */
    static readonly RED = new Colour(255, 0, 0, 1.0)

    /** the colour rosybrown with an RGB value of #BC8F8F. */
    static readonly ROSYBROWN = new Colour(188, 143, 143, 1.0)

    /** the colour royalblue with an RGB value of #4169E1. */
    static readonly ROYALBLUE = new Colour(65, 105, 225, 1.0)

    /** the colour saddlebrown with an RGB value of #8B4513. */
    static readonly SADDLEBROWN = new Colour(139, 69, 19, 1.0)

    /** the colour salmon with an RGB value of #FA8072. */
    static readonly SALMON = new Colour(250, 128, 114, 1.0)

    /** the colour sandybrown with an RGB value of #F4A460. */
    static readonly SANDYBROWN = new Colour(244, 164, 96, 1.0)

    /** the colour seagreen with an RGB value of #2E8B57. */
    static readonly SEAGREEN = new Colour(46, 139, 87, 1.0)

    /** the colour seashell with an RGB value of #FFF5EE. */
    static readonly SEASHELL = new Colour(255, 245, 238, 1.0)

    /** the colour sienna with an RGB value of #A0522D. */
    static readonly SIENNA = new Colour(160, 82, 45, 1.0)

    /** the colour silver with an RGB value of #C0C0C0. */
    static readonly SILVER = new Colour(192, 192, 192, 1.0)

    /** the colour skyblue with an RGB value of #87CEEB. */
    static readonly SKYBLUE = new Colour(135, 206, 235, 1.0)

    /** the colour slateblue with an RGB value of #6A5ACD. */
    static readonly SLATEBLUE = new Colour(106, 90, 205, 1.0)

    /** the colour slategray with an RGB value of #708090. */
    static readonly SLATEGRAY = new Colour(112, 128, 144, 1.0)

    /** the colour slategrey with an RGB value of #708090. */
    static readonly SLATEGREY = new Colour(112, 128, 144, 1.0)

    /** the colour snow with an RGB value of #FFFAFA. */
    static readonly SNOW = new Colour(255, 250, 250, 1.0)

    /** the colour springgreen with an RGB value of #00FF7F. */
    static readonly SPRINGGREEN = new Colour(0, 255, 127, 1.0)

    /** the colour steelblue with an RGB value of #4682B4. */
    static readonly STEELBLUE = new Colour(70, 130, 180, 1.0)

    /** the colour tan with an RGB value of #D2B48C. */
    static readonly TAN = new Colour(210, 180, 140, 1.0)

    /** the colour teal with an RGB value of #008080. */
    static readonly TEAL = new Colour(0, 128, 128, 1.0)

    /** the colour thistle with an RGB value of #D8BFD8. */
    static readonly THISTLE = new Colour(216, 191, 216, 1.0)

    /** the colour tomato with an RGB value of #FF6347. */
    static readonly TOMATO = new Colour(255, 99, 71, 1.0)

    /** the colour turquoise with an RGB value of #40E0D0. */
    static readonly TURQUOISE = new Colour(64, 224, 208, 1.0)

    /** the colour violet with an RGB value of #EE82EE. */
    static readonly VIOLET = new Colour(238, 130, 238, 1.0)

    /** the colour wheat with an RGB value of #F5DEB3. */
    static readonly WHEAT = new Colour(245, 222, 179, 1.0)

    /** the colour white with an RGB value of #FFFFFF. */
    static readonly WHITE = new Colour(255, 255, 255, 1.0)

    /** the colour whitesmoke with an RGB value of #F5F5F5. */
    static readonly WHITESMOKE = new Colour(245, 245, 245, 1.0)

    /** the colour yellow with an RGB value of #FFFF00. */
    static readonly YELLOW = new Colour(255, 255, 0, 1.0)

    /** the colour yellowgreen with an RGB value of #9ACD32. */
    static readonly YELLOWGREEN = new Colour(154, 205, 50, 1.0)

    /**
     * Colour from red, green, blue [0, 255]. Colour will be fully opaque.
     */
    static rgb(red: number, green: number, blue: number): Colour {
        return Colour.rgba(red, green, blue, 1.0)
    }

    /**
     * Colour from red, green, blue [0, 255] and opacity (0, 1.0).
     * Alpha value is converted to an interger percentage (so two decimal places is enough, the rest is discarded).
     */
    static rgba(red: number, green: number, blue: number, alpha: number): Colour {
        return new Colour(red, green, blue, alpha)
    }

    /**
     * Colour from hex string - e.g. #ff1540. Colour will be fully opaque.
     */
    static hex(hex: string): Colour | undefined {
        return Colour.hexa(hex, 1.0)
    }

    /**
     * Colour from hex string - e.g. #ff1540 and opacity [0, 1.0].
     * Alpha value is converted to an interger percentage (so two decimal places is enough, the rest is discarded).
     */
    static hexa(hex: string, alpha: number): Colour {
        if (!hex.startsWith("#")) {
            throw new Error("Invalid hex: " + hex)
        }
        const c = hex.substring(1)
        if (c.length !== 6) {
            throw new Error("Invalid hex: " + hex)
        }
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return Colour.rgba(r, g, b, alpha)
    }

    /**
     * Colour from hue, saturation and lightness. Colour will be fully opaque.
     *
     * @param hue degree on the colour wheel from 0 to 360. 0 is red, 120 is green, and 240 is blue
     * @param saturation percentage value [0, 1.0], where 0.0 means a shade of gray, and 1.0 is the full colour
     * @param lightness percentage value [0, 1.0], where 0.0 is black, 0.5 is neither light or dark, 1.0 is white
     */
    static hsl(hue: number, saturation: number, lightness: number): Colour {
        return Colour.hsla(hue, saturation, lightness, 1.0)
    }

    /**
     * Colour from hue, saturation, lightness and opacity.
     * Alpha value is converted to an interger percentage (so two decimal places is enough, the rest is discarded).
     *
     * @param hue degree on the colour wheel from 0 to 360. 0 is red, 120 is green, and 240 is blue
     * @param saturation percentage value [0, 1.0], where 0.0 means a shade of gray, and 1.0 is the full colour
     * @param lightness percentage value [0, 1.0], where 0.0 is black, 0.5 is neither light or dark, 1.0 is white
     * @param alpha opacity [0, 1.0], where 0.0 is fully transparent and 1.0 is fully opaque
     */
    static hsla(hue: number, saturation: number, lightness: number, alpha: number): Colour {
        const a = saturation * Math.min(lightness, 1 - lightness);
        const f = (n: number, k = (n + hue / 30) % 12) =>
            lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        const r = Math.round(f(0) * 255.0)
        const g = Math.round(f(8) * 255.0)
        const b = Math.round(f(4) * 255.0)
        return Colour.rgba(r, g, b, alpha)
    }

    /**
     * Values of RGBA packed into an integer.
     *
     * Byte layout:
     *
     *   - byte 3 = red [0, 255]
     *   - byte 2 = green [0, 255]
     *   - byte 1 = blue [0, 255]
     *   - byte 0 = alpha [0, 100]
     */
    rgba(): number {
        return this._rgba
    }

    /** intensity of red between 0 and 1.0. */
    red(): number {
        return ((this._rgba >> 24) & 0xFF) / 255.0
    }

    /** intensity of green between 0 and 1.0. */
    green(): number {
        return ((this._rgba >> 16) & 0xFF) / 255.0
    }

    /** intensity of blue between 0 and 1.0. */
    blue(): number {
        return ((this._rgba >> 8) & 0xFF) / 255.0
    }

    /** opacity as a number between 0.0 (fully transparent) and 1.0 (fully opaque). */
    alpha(): number {
        return (this._rgba & 0xFF) / 100.0
    }

    /** clamps number in [0, max] and round to nearest value. */
    private static clamp(n: number, max: number) {
        return Math.round(Math.max(0, Math.min(n, max)))
    }


}

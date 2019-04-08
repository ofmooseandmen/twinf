/**
 * A colour.
 */
export class Colour {

    /** RGBA byte 0 is alpha [0, 100], byte 1,2 and 3 are green blue and red [0, 255]. */
    private readonly _rgba: number

    private constructor(rgba: number) {
        this._rgba = rgba
    }

    /** the colour transparent with an ARGB value of #00000000. */
    static readonly TRANSPARENT= Colour.rgba(0, 0, 0, 0)

    /** the colour aliceblue with an RGB value of #F0F8FF. */
    static readonly ALICEBLUE= Colour.rgba(240, 248, 255, 1.0)

    /** the colour antiquewhite with an RGB value of #FAEBD7. */
    static readonly ANTIQUEWHITE= Colour.rgba(250, 235, 215, 1.0)

    /** the colour aqua with an RGB value of #00FFFF. */
    static readonly AQUA= Colour.rgba(0, 255, 255, 1.0)

    /** the colour aquamarine with an RGB value of #7FFFD4. */
    static readonly AQUAMARINE= Colour.rgba(127, 255, 212, 1.0)

    /** the colour azure with an RGB value of #F0FFFF. */
    static readonly AZURE= Colour.rgba(240, 255, 255, 1.0)

    /** the colour beige with an RGB value of #F5F5DC. */
    static readonly BEIGE= Colour.rgba(245, 245, 220, 1.0)

    /** the colour bisque with an RGB value of #FFE4C4. */
    static readonly BISQUE= Colour.rgba(255, 228, 196, 1.0)

    /** the colour black with an RGB value of #000000. */
    static readonly BLACK= Colour.rgba(0, 0, 0, 1.0)

    /** the colour blanchedalmond with an RGB value of #FFEBCD. */
    static readonly BLANCHEDALMOND= Colour.rgba(255, 235, 205, 1.0)

    /** the colour blue with an RGB value of #0000FF. */
    static readonly BLUE= Colour.rgba(0, 0, 255, 1.0)

    /** the colour blueviolet with an RGB value of #8A2BE2. */
    static readonly BLUEVIOLET= Colour.rgba(138, 43, 226, 1.0)

    /** the colour brown with an RGB value of #A52A2A. */
    static readonly BROWN= Colour.rgba(165, 42, 42, 1.0)

    /** the colour burlywood with an RGB value of #DEB887. */
    static readonly BURLYWOOD= Colour.rgba(222, 184, 135, 1.0)

    /** the colour cadetblue with an RGB value of #5F9EA0. */
    static readonly CADETBLUE= Colour.rgba(95, 158, 160, 1.0)

    /** the colour chartreuse with an RGB value of #7FFF00. */
    static readonly CHARTREUSE= Colour.rgba(127, 255, 0, 1.0)

    /** the colour chocolate with an RGB value of #D2691E. */
    static readonly CHOCOLATE= Colour.rgba(210, 105, 30, 1.0)

    /** the colour coral with an RGB value of #FF7F50. */
    static readonly CORAL= Colour.rgba(255, 127, 80, 1.0)

    /** the colour cornflowerblue with an RGB value of #6495ED. */
    static readonly CORNFLOWERBLUE= Colour.rgba(100, 149, 237, 1.0)

    /** the colour cornsilk with an RGB value of #FFF8DC. */
    static readonly CORNSILK= Colour.rgba(255, 248, 220, 1.0)

    /** the colour crimson with an RGB value of #DC143C. */
    static readonly CRIMSON= Colour.rgba(220, 20, 60, 1.0)

    /** the colour cyan with an RGB value of #00FFFF. */
    static readonly CYAN= Colour.rgba(0, 255, 255, 1.0)

    /** the colour darkblue with an RGB value of #00008B. */
    static readonly DARKBLUE= Colour.rgba(0, 0, 139, 1.0)

    /** the colour darkcyan with an RGB value of #008B8B. */
    static readonly DARKCYAN= Colour.rgba(0, 139, 139, 1.0)

    /** the colour darkgoldenrod with an RGB value of #B8860B. */
    static readonly DARKGOLDENROD= Colour.rgba(184, 134, 11, 1.0)

    /** the colour darkgray with an RGB value of #A9A9A9. */
    static readonly DARKGRAY= Colour.rgba(169, 169, 169, 1.0)

    /** the colour darkgreen with an RGB value of #006400. */
    static readonly DARKGREEN= Colour.rgba(0, 100, 0, 1.0)

    /** the colour darkgrey with an RGB value of #A9A9A9. */
    static readonly DARKGREY= Colour.rgba(169, 169, 169, 1.0)

    /** the colour darkkhaki with an RGB value of #BDB76B. */
    static readonly DARKKHAKI= Colour.rgba(189, 183, 107, 1.0)

    /** the colour darkmagenta with an RGB value of #8B008B. */
    static readonly DARKMAGENTA= Colour.rgba(139, 0, 139, 1.0)

    /** the colour darkolivegreen with an RGB value of #556B2F. */
    static readonly DARKOLIVEGREEN= Colour.rgba(85, 107, 47, 1.0)

    /** the colour darkorange with an RGB value of #FF8C00. */
    static readonly DARKORANGE= Colour.rgba(255, 140, 0, 1.0)

    /** the colour darkorchid with an RGB value of #9932CC. */
    static readonly DARKORCHID= Colour.rgba(153, 50, 204, 1.0)

    /** the colour darkred with an RGB value of #8B0000. */
    static readonly DARKRED= Colour.rgba(139, 0, 0, 1.0)

    /** the colour darksalmon with an RGB value of #E9967A. */
    static readonly DARKSALMON= Colour.rgba(233, 150, 122, 1.0)

    /** the colour darkseagreen with an RGB value of #8FBC8F. */
    static readonly DARKSEAGREEN= Colour.rgba(143, 188, 143, 1.0)

    /** the colour darkslateblue with an RGB value of #483D8B. */
    static readonly DARKSLATEBLUE= Colour.rgba(72, 61, 139, 1.0)

    /** the colour darkslategray with an RGB value of #2F4F4F. */
    static readonly DARKSLATEGRAY= Colour.rgba(47, 79, 79, 1.0)

    /** the colour darkslategrey with an RGB value of #2F4F4F. */
    static readonly DARKSLATEGREY= Colour.rgba(47, 79, 79, 1.0)

    /** the colour darkturquoise with an RGB value of #00CED1. */
    static readonly DARKTURQUOISE= Colour.rgba(0, 206, 209, 1.0)

    /** the colour darkviolet with an RGB value of #9400D3. */
    static readonly DARKVIOLET= Colour.rgba(148, 0, 211, 1.0)

    /** the colour deeppink with an RGB value of #FF1493. */
    static readonly DEEPPINK= Colour.rgba(255, 20, 147, 1.0)

    /** the colour deepskyblue with an RGB value of #00BFFF. */
    static readonly DEEPSKYBLUE= Colour.rgba(0, 191, 255, 1.0)

    /** the colour dimgray with an RGB value of #696969. */
    static readonly DIMGRAY= Colour.rgba(105, 105, 105, 1.0)

    /** the colour dimgrey with an RGB value of #696969. */
    static readonly DIMGREY= Colour.rgba(105, 105, 105, 1.0)

    /** the colour dodgerblue with an RGB value of #1E90FF. */
    static readonly DODGERBLUE= Colour.rgba(30, 144, 255, 1.0)

    /** the colour firebrick with an RGB value of #B22222. */
    static readonly FIREBRICK= Colour.rgba(178, 34, 34, 1.0)

    /** the colour floralwhite with an RGB value of #FFFAF0. */
    static readonly FLORALWHITE= Colour.rgba(255, 250, 240, 1.0)

    /** the colour forestgreen with an RGB value of #228B22. */
    static readonly FORESTGREEN= Colour.rgba(34, 139, 34, 1.0)

    /** the colour fuchsia with an RGB value of #FF00FF. */
    static readonly FUCHSIA= Colour.rgba(255, 0, 255, 1.0)

    /** the colour gainsboro with an RGB value of #DCDCDC. */
    static readonly GAINSBORO= Colour.rgba(220, 220, 220, 1.0)

    /** the colour ghostwhite with an RGB value of #F8F8FF. */
    static readonly GHOSTWHITE= Colour.rgba(248, 248, 255, 1.0)

    /** the colour gold with an RGB value of #FFD700. */
    static readonly GOLD= Colour.rgba(255, 215, 0, 1.0)

    /** the colour goldenrod with an RGB value of #DAA520. */
    static readonly GOLDENROD= Colour.rgba(218, 165, 32, 1.0)

    /** the colour gray with an RGB value of #808080. */
    static readonly GRAY= Colour.rgba(128, 128, 128, 1.0)

    /** the colour green with an RGB value of #008000. */
    static readonly GREEN= Colour.rgba(0, 128, 0, 1.0)

    /** the colour greenyellow with an RGB value of #ADFF2F. */
    static readonly GREENYELLOW= Colour.rgba(173, 255, 47, 1.0)

    /** the colour grey with an RGB value of #808080. */
    static readonly GREY= Colour.rgba(128, 128, 128, 1.0)

    /** the colour honeydew with an RGB value of #F0FFF0. */
    static readonly HONEYDEW= Colour.rgba(240, 255, 240, 1.0)

    /** the colour hotpink with an RGB value of #FF69B4. */
    static readonly HOTPINK= Colour.rgba(255, 105, 180, 1.0)

    /** the colour indianred with an RGB value of #CD5C5C. */
    static readonly INDIANRED= Colour.rgba(205, 92, 92, 1.0)

    /** the colour indigo with an RGB value of #4B0082. */
    static readonly INDIGO= Colour.rgba(75, 0, 130, 1.0)

    /** the colour ivory with an RGB value of #FFFFF0. */
    static readonly IVORY= Colour.rgba(255, 255, 240, 1.0)

    /** the colour khaki with an RGB value of #F0E68C. */
    static readonly KHAKI= Colour.rgba(240, 230, 140, 1.0)

    /** the colour lavender with an RGB value of #E6E6FA. */
    static readonly LAVENDER= Colour.rgba(230, 230, 250, 1.0)

    /** the colour lavenderblush with an RGB value of #FFF0F5. */
    static readonly LAVENDERBLUSH= Colour.rgba(255, 240, 245, 1.0)

    /** the colour lawngreen with an RGB value of #7CFC00. */
    static readonly LAWNGREEN= Colour.rgba(124, 252, 0, 1.0)

    /** the colour lemonchiffon with an RGB value of #FFFACD. */
    static readonly LEMONCHIFFON= Colour.rgba(255, 250, 205, 1.0)

    /** the colour lightblue with an RGB value of #ADD8E6. */
    static readonly LIGHTBLUE= Colour.rgba(173, 216, 230, 1.0)

    /** the colour lightcoral with an RGB value of #F08080. */
    static readonly LIGHTCORAL= Colour.rgba(240, 128, 128, 1.0)

    /** the colour lightcyan with an RGB value of #E0FFFF. */
    static readonly LIGHTCYAN= Colour.rgba(224, 255, 255, 1.0)

    /** the colour lightgoldenrodyellow with an RGB value of #FAFAD2. */
    static readonly LIGHTGOLDENRODYELLOW= Colour.rgba(250, 250, 210, 1.0)

    /** the colour lightgray with an RGB value of #D3D3D3. */
    static readonly LIGHTGRAY= Colour.rgba(211, 211, 211, 1.0)

    /** the colour lightgreen with an RGB value of #90EE90. */
    static readonly LIGHTGREEN= Colour.rgba(144, 238, 144, 1.0)

    /** the colour lightgrey with an RGB value of #D3D3D3. */
    static readonly LIGHTGREY= Colour.rgba(211, 211, 211, 1.0)

    /** the colour lightpink with an RGB value of #FFB6C1. */
    static readonly LIGHTPINK= Colour.rgba(255, 182, 193, 1.0)

    /** the colour lightsalmon with an RGB value of #FFA07A. */
    static readonly LIGHTSALMON= Colour.rgba(255, 160, 122, 1.0)

    /** the colour lightseagreen with an RGB value of #20B2AA. */
    static readonly LIGHTSEAGREEN= Colour.rgba(32, 178, 170, 1.0)

    /** the colour lightskyblue with an RGB value of #87CEFA. */
    static readonly LIGHTSKYBLUE= Colour.rgba(135, 206, 250, 1.0)

    /** the colour lightslategray with an RGB value of #778899. */
    static readonly LIGHTSLATEGRAY= Colour.rgba(119, 136, 153, 1.0)

    /** the colour lightslategrey with an RGB value of #778899. */
    static readonly LIGHTSLATEGREY= Colour.rgba(119, 136, 153, 1.0)

    /** the colour lightsteelblue with an RGB value of #B0C4DE. */
    static readonly LIGHTSTEELBLUE= Colour.rgba(176, 196, 222, 1.0)

    /** the colour lightyellow with an RGB value of #FFFFE0. */
    static readonly LIGHTYELLOW= Colour.rgba(255, 255, 224, 1.0)

    /** the colour lime with an RGB value of #00FF00. */
    static readonly LIME= Colour.rgba(0, 255, 0, 1.0)

    /** the colour limegreen with an RGB value of #32CD32. */
    static readonly LIMEGREEN= Colour.rgba(50, 205, 50, 1.0)

    /** the colour linen with an RGB value of #FAF0E6. */
    static readonly LINEN= Colour.rgba(250, 240, 230, 1.0)

    /** the colour magenta with an RGB value of #FF00FF. */
    static readonly MAGENTA= Colour.rgba(255, 0, 255, 1.0)

    /** the colour maroon with an RGB value of #800000. */
    static readonly MAROON= Colour.rgba(128, 0, 0, 1.0)

    /** the colour mediumaquamarine with an RGB value of #66CDAA. */
    static readonly MEDIUMAQUAMARINE= Colour.rgba(102, 205, 170, 1.0)

    /** the colour mediumblue with an RGB value of #0000CD. */
    static readonly MEDIUMBLUE= Colour.rgba(0, 0, 205, 1.0)

    /** the colour mediumorchid with an RGB value of #BA55D3. */
    static readonly MEDIUMORCHID= Colour.rgba(186, 85, 211, 1.0)

    /** the colour mediumpurple with an RGB value of #9370DB. */
    static readonly MEDIUMPURPLE= Colour.rgba(147, 112, 219, 1.0)

    /** the colour mediumseagreen with an RGB value of #3CB371. */
    static readonly MEDIUMSEAGREEN= Colour.rgba(60, 179, 113, 1.0)

    /** the colour mediumslateblue with an RGB value of #7B68EE. */
    static readonly MEDIUMSLATEBLUE= Colour.rgba(123, 104, 238, 1.0)

    /** the colour mediumspringgreen with an RGB value of #00FA9A. */
    static readonly MEDIUMSPRINGGREEN= Colour.rgba(0, 250, 154, 1.0)

    /** the colour mediumturquoise with an RGB value of #48D1CC. */
    static readonly MEDIUMTURQUOISE= Colour.rgba(72, 209, 204, 1.0)

    /** the colour mediumvioletred with an RGB value of #C71585. */
    static readonly MEDIUMVIOLETRED= Colour.rgba(199, 21, 133, 1.0)

    /** the colour midnightblue with an RGB value of #191970. */
    static readonly MIDNIGHTBLUE= Colour.rgba(25, 25, 112, 1.0)

    /** the colour mintcream with an RGB value of #F5FFFA. */
    static readonly MINTCREAM= Colour.rgba(245, 255, 250, 1.0)

    /** the colour mistyrose with an RGB value of #FFE4E1. */
    static readonly MISTYROSE= Colour.rgba(255, 228, 225, 1.0)

    /** the colour moccasin with an RGB value of #FFE4B5. */
    static readonly MOCCASIN= Colour.rgba(255, 228, 181, 1.0)

    /** the colour navajowhite with an RGB value of #FFDEAD. */
    static readonly NAVAJOWHITE= Colour.rgba(255, 222, 173, 1.0)

    /** the colour navy with an RGB value of #000080. */
    static readonly NAVY= Colour.rgba(0, 0, 128, 1.0)

    /** the colour oldlace with an RGB value of #FDF5E6. */
    static readonly OLDLACE= Colour.rgba(253, 245, 230, 1.0)

    /** the colour olive with an RGB value of #808000. */
    static readonly OLIVE= Colour.rgba(128, 128, 0, 1.0)

    /** the colour olivedrab with an RGB value of #6B8E23. */
    static readonly OLIVEDRAB= Colour.rgba(107, 142, 35, 1.0)

    /** the colour orange with an RGB value of #FFA500. */
    static readonly ORANGE= Colour.rgba(255, 165, 0, 1.0)

    /** the colour orangered with an RGB value of #FF4500. */
    static readonly ORANGERED= Colour.rgba(255, 69, 0, 1.0)

    /** the colour orchid with an RGB value of #DA70D6. */
    static readonly ORCHID= Colour.rgba(218, 112, 214, 1.0)

    /** the colour palegoldenrod with an RGB value of #EEE8AA. */
    static readonly PALEGOLDENROD= Colour.rgba(238, 232, 170, 1.0)

    /** the colour palegreen with an RGB value of #98FB98. */
    static readonly PALEGREEN= Colour.rgba(152, 251, 152, 1.0)

    /** the colour paleturquoise with an RGB value of #AFEEEE. */
    static readonly PALETURQUOISE= Colour.rgba(175, 238, 238, 1.0)

    /** the colour palevioletred with an RGB value of #DB7093. */
    static readonly PALEVIOLETRED= Colour.rgba(219, 112, 147, 1.0)

    /** the colour papayawhip with an RGB value of #FFEFD5. */
    static readonly PAPAYAWHIP= Colour.rgba(255, 239, 213, 1.0)

    /** the colour peachpuff with an RGB value of #FFDAB9. */
    static readonly PEACHPUFF= Colour.rgba(255, 218, 185, 1.0)

    /** the colour peru with an RGB value of #CD853F. */
    static readonly PERU= Colour.rgba(205, 133, 63, 1.0)

    /** the colour pink with an RGB value of #FFC0CB. */
    static readonly PINK= Colour.rgba(255, 192, 203, 1.0)

    /** the colour plum with an RGB value of #DDA0DD. */
    static readonly PLUM= Colour.rgba(221, 160, 221, 1.0)

    /** the colour powderblue with an RGB value of #B0E0E6. */
    static readonly POWDERBLUE= Colour.rgba(176, 224, 230, 1.0)

    /** the colour purple with an RGB value of #800080. */
    static readonly PURPLE= Colour.rgba(128, 0, 128, 1.0)

    /** the colour red with an RGB value of #FF0000. */
    static readonly RED= Colour.rgba(255, 0, 0, 1.0)

    /** the colour rosybrown with an RGB value of #BC8F8F. */
    static readonly ROSYBROWN= Colour.rgba(188, 143, 143, 1.0)

    /** the colour royalblue with an RGB value of #4169E1. */
    static readonly ROYALBLUE= Colour.rgba(65, 105, 225, 1.0)

    /** the colour saddlebrown with an RGB value of #8B4513. */
    static readonly SADDLEBROWN= Colour.rgba(139, 69, 19, 1.0)

    /** the colour salmon with an RGB value of #FA8072. */
    static readonly SALMON= Colour.rgba(250, 128, 114, 1.0)

    /** the colour sandybrown with an RGB value of #F4A460. */
    static readonly SANDYBROWN= Colour.rgba(244, 164, 96, 1.0)

    /** the colour seagreen with an RGB value of #2E8B57. */
    static readonly SEAGREEN= Colour.rgba(46, 139, 87, 1.0)

    /** the colour seashell with an RGB value of #FFF5EE. */
    static readonly SEASHELL= Colour.rgba(255, 245, 238, 1.0)

    /** the colour sienna with an RGB value of #A0522D. */
    static readonly SIENNA= Colour.rgba(160, 82, 45, 1.0)

    /** the colour silver with an RGB value of #C0C0C0. */
    static readonly SILVER= Colour.rgba(192, 192, 192, 1.0)

    /** the colour skyblue with an RGB value of #87CEEB. */
    static readonly SKYBLUE= Colour.rgba(135, 206, 235, 1.0)

    /** the colour slateblue with an RGB value of #6A5ACD. */
    static readonly SLATEBLUE= Colour.rgba(106, 90, 205, 1.0)

    /** the colour slategray with an RGB value of #708090. */
    static readonly SLATEGRAY= Colour.rgba(112, 128, 144, 1.0)

    /** the colour slategrey with an RGB value of #708090. */
    static readonly SLATEGREY= Colour.rgba(112, 128, 144, 1.0)

    /** the colour snow with an RGB value of #FFFAFA. */
    static readonly SNOW= Colour.rgba(255, 250, 250, 1.0)

    /** the colour springgreen with an RGB value of #00FF7F. */
    static readonly SPRINGGREEN= Colour.rgba(0, 255, 127, 1.0)

    /** the colour steelblue with an RGB value of #4682B4. */
    static readonly STEELBLUE= Colour.rgba(70, 130, 180, 1.0)

    /** the colour tan with an RGB value of #D2B48C. */
    static readonly TAN= Colour.rgba(210, 180, 140, 1.0)

    /** the colour teal with an RGB value of #008080. */
    static readonly TEAL= Colour.rgba(0, 128, 128, 1.0)

    /** the colour thistle with an RGB value of #D8BFD8. */
    static readonly THISTLE= Colour.rgba(216, 191, 216, 1.0)

    /** the colour tomato with an RGB value of #FF6347. */
    static readonly TOMATO= Colour.rgba(255, 99, 71, 1.0)

    /** the colour turquoise with an RGB value of #40E0D0. */
    static readonly TURQUOISE= Colour.rgba(64, 224, 208, 1.0)

    /** the colour violet with an RGB value of #EE82EE. */
    static readonly VIOLET= Colour.rgba(238, 130, 238, 1.0)

    /** the colour wheat with an RGB value of #F5DEB3. */
    static readonly WHEAT= Colour.rgba(245, 222, 179, 1.0)

    /** the colour white with an RGB value of #FFFFFF. */
    static readonly WHITE= Colour.rgba(255, 255, 255, 1.0)

    /** the colour whitesmoke with an RGB value of #F5F5F5. */
    static readonly WHITESMOKE= Colour.rgba(245, 245, 245, 1.0)

    /** the colour yellow with an RGB value of #FFFF00. */
    static readonly YELLOW= Colour.rgba(255, 255, 0, 1.0)

    /** the colour yellowgreen with an RGB value of #9ACD32. */
    static readonly YELLOWGREEN= Colour.rgba(154, 205, 50, 1.0)

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
        let rgba = Colour.clamp(red, 255)
        rgba = (rgba << 8) + Colour.clamp(green, 255)
        rgba = (rgba << 8) + Colour.clamp(blue, 255)
        rgba = (rgba << 8) + Colour.clamp(alpha * 100, 100)
        return new Colour(rgba)
    }

    /**
     * Colour from hex string - e.g. #ff1540. Colour will be fully opaque.
     */
    static hex(hex: string): Colour {
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
     * Colour from object literal.
     */
    static fromLiteral(data: any): Colour {
        return new Colour(data["_rgba"])
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

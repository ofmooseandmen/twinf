var demo = (function (exports) {
    'use strict';

    /**
     * An angle with a resolution of a milliseconds of a degree.
     * When used as a latitude/longitude this roughly translate to a precision
     * of 30 millimetres at the equator.
     */
    class Angle {
        constructor(milliseconds) {
            this.milliseconds = milliseconds;
        }
        static ofDegrees(degs) {
            const ms = Math.round(degs * 3600000.0);
            return new Angle(ms);
        }
        static ofRadians(rads) {
            const degs = rads / Math.PI * 180.0;
            return Angle.ofDegrees(degs);
        }
        /**
         * Computes the central angle from the given arc length and given radius.gle
         */
        static central(l, r) {
            return Angle.ofRadians(l / r);
        }
        static cos(a) {
            return Math.cos(a.radians());
        }
        static sin(a) {
            return Math.sin(a.radians());
        }
        static atan2(y, x) {
            return Angle.ofRadians(Math.atan2(y, x));
        }
        degrees() {
            return this.milliseconds / 3600000.0;
        }
        radians() {
            return this.degrees() * Math.PI / 180.0;
        }
    }

    /**
     * A colour.
     */
    class Colour {
        constructor(red, green, blue, alpha) {
            let rgba = Colour.clamp(red, 255);
            rgba = (rgba << 8) + Colour.clamp(green, 255);
            rgba = (rgba << 8) + Colour.clamp(blue, 255);
            rgba = (rgba << 8) + Colour.clamp(alpha * 100, 100);
            this._rgba = rgba;
        }
        /**
         * Colour from red, green, blue [0, 255]. Colour will be fully opaque.
         */
        static rgb(red, green, blue) {
            return Colour.rgba(red, green, blue, 1.0);
        }
        /**
         * Colour from red, green, blue [0, 255] and opacity (0, 1.0).
         * Alpha value is converted to an interger percentage (so two decimal places is enough, the rest is discarded).
         */
        static rgba(red, green, blue, alpha) {
            return new Colour(red, green, blue, alpha);
        }
        /**
         * Colour from hex string - e.g. #ff1540. Colour will be fully opaque.
         */
        static hex(hex) {
            return Colour.hexa(hex, 1.0);
        }
        /**
         * Colour from hex string - e.g. #ff1540 and opacity [0, 1.0].
         * Alpha value is converted to an interger percentage (so two decimal places is enough, the rest is discarded).
         */
        static hexa(hex, alpha) {
            if (!hex.startsWith("#")) {
                throw new Error("Invalid hex: " + hex);
            }
            const c = hex.substring(1);
            if (c.length !== 6) {
                throw new Error("Invalid hex: " + hex);
            }
            const r = parseInt(c.substring(0, 2), 16);
            const g = parseInt(c.substring(2, 4), 16);
            const b = parseInt(c.substring(4, 6), 16);
            return Colour.rgba(r, g, b, alpha);
        }
        /**
         * Colour from hue, saturation and lightness. Colour will be fully opaque.
         *
         * @param hue degree on the colour wheel from 0 to 360. 0 is red, 120 is green, and 240 is blue
         * @param saturation percentage value [0, 1.0], where 0.0 means a shade of gray, and 1.0 is the full colour
         * @param lightness percentage value [0, 1.0], where 0.0 is black, 0.5 is neither light or dark, 1.0 is white
         */
        static hsl(hue, saturation, lightness) {
            return Colour.hsla(hue, saturation, lightness, 1.0);
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
        static hsla(hue, saturation, lightness, alpha) {
            const a = saturation * Math.min(lightness, 1 - lightness);
            const f = (n, k = (n + hue / 30) % 12) => lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            const r = Math.round(f(0) * 255.0);
            const g = Math.round(f(8) * 255.0);
            const b = Math.round(f(4) * 255.0);
            return Colour.rgba(r, g, b, alpha);
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
        rgba() {
            return this._rgba;
        }
        /** intensity of red between 0 and 1.0. */
        red() {
            return ((this._rgba >> 24) & 0xFF) / 255.0;
        }
        /** intensity of green between 0 and 1.0. */
        green() {
            return ((this._rgba >> 16) & 0xFF) / 255.0;
        }
        /** intensity of blue between 0 and 1.0. */
        blue() {
            return ((this._rgba >> 8) & 0xFF) / 255.0;
        }
        /** opacity as a number between 0.0 (fully transparent) and 1.0 (fully opaque). */
        alpha() {
            return (this._rgba & 0xFF) / 100.0;
        }
        /** clamps number in [0, max] and round to nearest value. */
        static clamp(n, max) {
            return Math.round(Math.max(0, Math.min(n, max)));
        }
    }
    /** the colour transparent with an ARGB value of #00000000. */
    Colour.TRANSPARENT = new Colour(0, 0, 0, 0);
    /** the colour aliceblue with an RGB value of #F0F8FF. */
    Colour.ALICEBLUE = new Colour(240, 248, 255, 1.0);
    /** the colour antiquewhite with an RGB value of #FAEBD7. */
    Colour.ANTIQUEWHITE = new Colour(250, 235, 215, 1.0);
    /** the colour aqua with an RGB value of #00FFFF. */
    Colour.AQUA = new Colour(0, 255, 255, 1.0);
    /** the colour aquamarine with an RGB value of #7FFFD4. */
    Colour.AQUAMARINE = new Colour(127, 255, 212, 1.0);
    /** the colour azure with an RGB value of #F0FFFF. */
    Colour.AZURE = new Colour(240, 255, 255, 1.0);
    /** the colour beige with an RGB value of #F5F5DC. */
    Colour.BEIGE = new Colour(245, 245, 220, 1.0);
    /** the colour bisque with an RGB value of #FFE4C4. */
    Colour.BISQUE = new Colour(255, 228, 196, 1.0);
    /** the colour black with an RGB value of #000000. */
    Colour.BLACK = new Colour(0, 0, 0, 1.0);
    /** the colour blanchedalmond with an RGB value of #FFEBCD. */
    Colour.BLANCHEDALMOND = new Colour(255, 235, 205, 1.0);
    /** the colour blue with an RGB value of #0000FF. */
    Colour.BLUE = new Colour(0, 0, 255, 1.0);
    /** the colour blueviolet with an RGB value of #8A2BE2. */
    Colour.BLUEVIOLET = new Colour(138, 43, 226, 1.0);
    /** the colour brown with an RGB value of #A52A2A. */
    Colour.BROWN = new Colour(165, 42, 42, 1.0);
    /** the colour burlywood with an RGB value of #DEB887. */
    Colour.BURLYWOOD = new Colour(222, 184, 135, 1.0);
    /** the colour cadetblue with an RGB value of #5F9EA0. */
    Colour.CADETBLUE = new Colour(95, 158, 160, 1.0);
    /** the colour chartreuse with an RGB value of #7FFF00. */
    Colour.CHARTREUSE = new Colour(127, 255, 0, 1.0);
    /** the colour chocolate with an RGB value of #D2691E. */
    Colour.CHOCOLATE = new Colour(210, 105, 30, 1.0);
    /** the colour coral with an RGB value of #FF7F50. */
    Colour.CORAL = new Colour(255, 127, 80, 1.0);
    /** the colour cornflowerblue with an RGB value of #6495ED. */
    Colour.CORNFLOWERBLUE = new Colour(100, 149, 237, 1.0);
    /** the colour cornsilk with an RGB value of #FFF8DC. */
    Colour.CORNSILK = new Colour(255, 248, 220, 1.0);
    /** the colour crimson with an RGB value of #DC143C. */
    Colour.CRIMSON = new Colour(220, 20, 60, 1.0);
    /** the colour cyan with an RGB value of #00FFFF. */
    Colour.CYAN = new Colour(0, 255, 255, 1.0);
    /** the colour darkblue with an RGB value of #00008B. */
    Colour.DARKBLUE = new Colour(0, 0, 139, 1.0);
    /** the colour darkcyan with an RGB value of #008B8B. */
    Colour.DARKCYAN = new Colour(0, 139, 139, 1.0);
    /** the colour darkgoldenrod with an RGB value of #B8860B. */
    Colour.DARKGOLDENROD = new Colour(184, 134, 11, 1.0);
    /** the colour darkgray with an RGB value of #A9A9A9. */
    Colour.DARKGRAY = new Colour(169, 169, 169, 1.0);
    /** the colour darkgreen with an RGB value of #006400. */
    Colour.DARKGREEN = new Colour(0, 100, 0, 1.0);
    /** the colour darkgrey with an RGB value of #A9A9A9. */
    Colour.DARKGREY = new Colour(169, 169, 169, 1.0);
    /** the colour darkkhaki with an RGB value of #BDB76B. */
    Colour.DARKKHAKI = new Colour(189, 183, 107, 1.0);
    /** the colour darkmagenta with an RGB value of #8B008B. */
    Colour.DARKMAGENTA = new Colour(139, 0, 139, 1.0);
    /** the colour darkolivegreen with an RGB value of #556B2F. */
    Colour.DARKOLIVEGREEN = new Colour(85, 107, 47, 1.0);
    /** the colour darkorange with an RGB value of #FF8C00. */
    Colour.DARKORANGE = new Colour(255, 140, 0, 1.0);
    /** the colour darkorchid with an RGB value of #9932CC. */
    Colour.DARKORCHID = new Colour(153, 50, 204, 1.0);
    /** the colour darkred with an RGB value of #8B0000. */
    Colour.DARKRED = new Colour(139, 0, 0, 1.0);
    /** the colour darksalmon with an RGB value of #E9967A. */
    Colour.DARKSALMON = new Colour(233, 150, 122, 1.0);
    /** the colour darkseagreen with an RGB value of #8FBC8F. */
    Colour.DARKSEAGREEN = new Colour(143, 188, 143, 1.0);
    /** the colour darkslateblue with an RGB value of #483D8B. */
    Colour.DARKSLATEBLUE = new Colour(72, 61, 139, 1.0);
    /** the colour darkslategray with an RGB value of #2F4F4F. */
    Colour.DARKSLATEGRAY = new Colour(47, 79, 79, 1.0);
    /** the colour darkslategrey with an RGB value of #2F4F4F. */
    Colour.DARKSLATEGREY = new Colour(47, 79, 79, 1.0);
    /** the colour darkturquoise with an RGB value of #00CED1. */
    Colour.DARKTURQUOISE = new Colour(0, 206, 209, 1.0);
    /** the colour darkviolet with an RGB value of #9400D3. */
    Colour.DARKVIOLET = new Colour(148, 0, 211, 1.0);
    /** the colour deeppink with an RGB value of #FF1493. */
    Colour.DEEPPINK = new Colour(255, 20, 147, 1.0);
    /** the colour deepskyblue with an RGB value of #00BFFF. */
    Colour.DEEPSKYBLUE = new Colour(0, 191, 255, 1.0);
    /** the colour dimgray with an RGB value of #696969. */
    Colour.DIMGRAY = new Colour(105, 105, 105, 1.0);
    /** the colour dimgrey with an RGB value of #696969. */
    Colour.DIMGREY = new Colour(105, 105, 105, 1.0);
    /** the colour dodgerblue with an RGB value of #1E90FF. */
    Colour.DODGERBLUE = new Colour(30, 144, 255, 1.0);
    /** the colour firebrick with an RGB value of #B22222. */
    Colour.FIREBRICK = new Colour(178, 34, 34, 1.0);
    /** the colour floralwhite with an RGB value of #FFFAF0. */
    Colour.FLORALWHITE = new Colour(255, 250, 240, 1.0);
    /** the colour forestgreen with an RGB value of #228B22. */
    Colour.FORESTGREEN = new Colour(34, 139, 34, 1.0);
    /** the colour fuchsia with an RGB value of #FF00FF. */
    Colour.FUCHSIA = new Colour(255, 0, 255, 1.0);
    /** the colour gainsboro with an RGB value of #DCDCDC. */
    Colour.GAINSBORO = new Colour(220, 220, 220, 1.0);
    /** the colour ghostwhite with an RGB value of #F8F8FF. */
    Colour.GHOSTWHITE = new Colour(248, 248, 255, 1.0);
    /** the colour gold with an RGB value of #FFD700. */
    Colour.GOLD = new Colour(255, 215, 0, 1.0);
    /** the colour goldenrod with an RGB value of #DAA520. */
    Colour.GOLDENROD = new Colour(218, 165, 32, 1.0);
    /** the colour gray with an RGB value of #808080. */
    Colour.GRAY = new Colour(128, 128, 128, 1.0);
    /** the colour green with an RGB value of #008000. */
    Colour.GREEN = new Colour(0, 128, 0, 1.0);
    /** the colour greenyellow with an RGB value of #ADFF2F. */
    Colour.GREENYELLOW = new Colour(173, 255, 47, 1.0);
    /** the colour grey with an RGB value of #808080. */
    Colour.GREY = new Colour(128, 128, 128, 1.0);
    /** the colour honeydew with an RGB value of #F0FFF0. */
    Colour.HONEYDEW = new Colour(240, 255, 240, 1.0);
    /** the colour hotpink with an RGB value of #FF69B4. */
    Colour.HOTPINK = new Colour(255, 105, 180, 1.0);
    /** the colour indianred with an RGB value of #CD5C5C. */
    Colour.INDIANRED = new Colour(205, 92, 92, 1.0);
    /** the colour indigo with an RGB value of #4B0082. */
    Colour.INDIGO = new Colour(75, 0, 130, 1.0);
    /** the colour ivory with an RGB value of #FFFFF0. */
    Colour.IVORY = new Colour(255, 255, 240, 1.0);
    /** the colour khaki with an RGB value of #F0E68C. */
    Colour.KHAKI = new Colour(240, 230, 140, 1.0);
    /** the colour lavender with an RGB value of #E6E6FA. */
    Colour.LAVENDER = new Colour(230, 230, 250, 1.0);
    /** the colour lavenderblush with an RGB value of #FFF0F5. */
    Colour.LAVENDERBLUSH = new Colour(255, 240, 245, 1.0);
    /** the colour lawngreen with an RGB value of #7CFC00. */
    Colour.LAWNGREEN = new Colour(124, 252, 0, 1.0);
    /** the colour lemonchiffon with an RGB value of #FFFACD. */
    Colour.LEMONCHIFFON = new Colour(255, 250, 205, 1.0);
    /** the colour lightblue with an RGB value of #ADD8E6. */
    Colour.LIGHTBLUE = new Colour(173, 216, 230, 1.0);
    /** the colour lightcoral with an RGB value of #F08080. */
    Colour.LIGHTCORAL = new Colour(240, 128, 128, 1.0);
    /** the colour lightcyan with an RGB value of #E0FFFF. */
    Colour.LIGHTCYAN = new Colour(224, 255, 255, 1.0);
    /** the colour lightgoldenrodyellow with an RGB value of #FAFAD2. */
    Colour.LIGHTGOLDENRODYELLOW = new Colour(250, 250, 210, 1.0);
    /** the colour lightgray with an RGB value of #D3D3D3. */
    Colour.LIGHTGRAY = new Colour(211, 211, 211, 1.0);
    /** the colour lightgreen with an RGB value of #90EE90. */
    Colour.LIGHTGREEN = new Colour(144, 238, 144, 1.0);
    /** the colour lightgrey with an RGB value of #D3D3D3. */
    Colour.LIGHTGREY = new Colour(211, 211, 211, 1.0);
    /** the colour lightpink with an RGB value of #FFB6C1. */
    Colour.LIGHTPINK = new Colour(255, 182, 193, 1.0);
    /** the colour lightsalmon with an RGB value of #FFA07A. */
    Colour.LIGHTSALMON = new Colour(255, 160, 122, 1.0);
    /** the colour lightseagreen with an RGB value of #20B2AA. */
    Colour.LIGHTSEAGREEN = new Colour(32, 178, 170, 1.0);
    /** the colour lightskyblue with an RGB value of #87CEFA. */
    Colour.LIGHTSKYBLUE = new Colour(135, 206, 250, 1.0);
    /** the colour lightslategray with an RGB value of #778899. */
    Colour.LIGHTSLATEGRAY = new Colour(119, 136, 153, 1.0);
    /** the colour lightslategrey with an RGB value of #778899. */
    Colour.LIGHTSLATEGREY = new Colour(119, 136, 153, 1.0);
    /** the colour lightsteelblue with an RGB value of #B0C4DE. */
    Colour.LIGHTSTEELBLUE = new Colour(176, 196, 222, 1.0);
    /** the colour lightyellow with an RGB value of #FFFFE0. */
    Colour.LIGHTYELLOW = new Colour(255, 255, 224, 1.0);
    /** the colour lime with an RGB value of #00FF00. */
    Colour.LIME = new Colour(0, 255, 0, 1.0);
    /** the colour limegreen with an RGB value of #32CD32. */
    Colour.LIMEGREEN = new Colour(50, 205, 50, 1.0);
    /** the colour linen with an RGB value of #FAF0E6. */
    Colour.LINEN = new Colour(250, 240, 230, 1.0);
    /** the colour magenta with an RGB value of #FF00FF. */
    Colour.MAGENTA = new Colour(255, 0, 255, 1.0);
    /** the colour maroon with an RGB value of #800000. */
    Colour.MAROON = new Colour(128, 0, 0, 1.0);
    /** the colour mediumaquamarine with an RGB value of #66CDAA. */
    Colour.MEDIUMAQUAMARINE = new Colour(102, 205, 170, 1.0);
    /** the colour mediumblue with an RGB value of #0000CD. */
    Colour.MEDIUMBLUE = new Colour(0, 0, 205, 1.0);
    /** the colour mediumorchid with an RGB value of #BA55D3. */
    Colour.MEDIUMORCHID = new Colour(186, 85, 211, 1.0);
    /** the colour mediumpurple with an RGB value of #9370DB. */
    Colour.MEDIUMPURPLE = new Colour(147, 112, 219, 1.0);
    /** the colour mediumseagreen with an RGB value of #3CB371. */
    Colour.MEDIUMSEAGREEN = new Colour(60, 179, 113, 1.0);
    /** the colour mediumslateblue with an RGB value of #7B68EE. */
    Colour.MEDIUMSLATEBLUE = new Colour(123, 104, 238, 1.0);
    /** the colour mediumspringgreen with an RGB value of #00FA9A. */
    Colour.MEDIUMSPRINGGREEN = new Colour(0, 250, 154, 1.0);
    /** the colour mediumturquoise with an RGB value of #48D1CC. */
    Colour.MEDIUMTURQUOISE = new Colour(72, 209, 204, 1.0);
    /** the colour mediumvioletred with an RGB value of #C71585. */
    Colour.MEDIUMVIOLETRED = new Colour(199, 21, 133, 1.0);
    /** the colour midnightblue with an RGB value of #191970. */
    Colour.MIDNIGHTBLUE = new Colour(25, 25, 112, 1.0);
    /** the colour mintcream with an RGB value of #F5FFFA. */
    Colour.MINTCREAM = new Colour(245, 255, 250, 1.0);
    /** the colour mistyrose with an RGB value of #FFE4E1. */
    Colour.MISTYROSE = new Colour(255, 228, 225, 1.0);
    /** the colour moccasin with an RGB value of #FFE4B5. */
    Colour.MOCCASIN = new Colour(255, 228, 181, 1.0);
    /** the colour navajowhite with an RGB value of #FFDEAD. */
    Colour.NAVAJOWHITE = new Colour(255, 222, 173, 1.0);
    /** the colour navy with an RGB value of #000080. */
    Colour.NAVY = new Colour(0, 0, 128, 1.0);
    /** the colour oldlace with an RGB value of #FDF5E6. */
    Colour.OLDLACE = new Colour(253, 245, 230, 1.0);
    /** the colour olive with an RGB value of #808000. */
    Colour.OLIVE = new Colour(128, 128, 0, 1.0);
    /** the colour olivedrab with an RGB value of #6B8E23. */
    Colour.OLIVEDRAB = new Colour(107, 142, 35, 1.0);
    /** the colour orange with an RGB value of #FFA500. */
    Colour.ORANGE = new Colour(255, 165, 0, 1.0);
    /** the colour orangered with an RGB value of #FF4500. */
    Colour.ORANGERED = new Colour(255, 69, 0, 1.0);
    /** the colour orchid with an RGB value of #DA70D6. */
    Colour.ORCHID = new Colour(218, 112, 214, 1.0);
    /** the colour palegoldenrod with an RGB value of #EEE8AA. */
    Colour.PALEGOLDENROD = new Colour(238, 232, 170, 1.0);
    /** the colour palegreen with an RGB value of #98FB98. */
    Colour.PALEGREEN = new Colour(152, 251, 152, 1.0);
    /** the colour paleturquoise with an RGB value of #AFEEEE. */
    Colour.PALETURQUOISE = new Colour(175, 238, 238, 1.0);
    /** the colour palevioletred with an RGB value of #DB7093. */
    Colour.PALEVIOLETRED = new Colour(219, 112, 147, 1.0);
    /** the colour papayawhip with an RGB value of #FFEFD5. */
    Colour.PAPAYAWHIP = new Colour(255, 239, 213, 1.0);
    /** the colour peachpuff with an RGB value of #FFDAB9. */
    Colour.PEACHPUFF = new Colour(255, 218, 185, 1.0);
    /** the colour peru with an RGB value of #CD853F. */
    Colour.PERU = new Colour(205, 133, 63, 1.0);
    /** the colour pink with an RGB value of #FFC0CB. */
    Colour.PINK = new Colour(255, 192, 203, 1.0);
    /** the colour plum with an RGB value of #DDA0DD. */
    Colour.PLUM = new Colour(221, 160, 221, 1.0);
    /** the colour powderblue with an RGB value of #B0E0E6. */
    Colour.POWDERBLUE = new Colour(176, 224, 230, 1.0);
    /** the colour purple with an RGB value of #800080. */
    Colour.PURPLE = new Colour(128, 0, 128, 1.0);
    /** the colour red with an RGB value of #FF0000. */
    Colour.RED = new Colour(255, 0, 0, 1.0);
    /** the colour rosybrown with an RGB value of #BC8F8F. */
    Colour.ROSYBROWN = new Colour(188, 143, 143, 1.0);
    /** the colour royalblue with an RGB value of #4169E1. */
    Colour.ROYALBLUE = new Colour(65, 105, 225, 1.0);
    /** the colour saddlebrown with an RGB value of #8B4513. */
    Colour.SADDLEBROWN = new Colour(139, 69, 19, 1.0);
    /** the colour salmon with an RGB value of #FA8072. */
    Colour.SALMON = new Colour(250, 128, 114, 1.0);
    /** the colour sandybrown with an RGB value of #F4A460. */
    Colour.SANDYBROWN = new Colour(244, 164, 96, 1.0);
    /** the colour seagreen with an RGB value of #2E8B57. */
    Colour.SEAGREEN = new Colour(46, 139, 87, 1.0);
    /** the colour seashell with an RGB value of #FFF5EE. */
    Colour.SEASHELL = new Colour(255, 245, 238, 1.0);
    /** the colour sienna with an RGB value of #A0522D. */
    Colour.SIENNA = new Colour(160, 82, 45, 1.0);
    /** the colour silver with an RGB value of #C0C0C0. */
    Colour.SILVER = new Colour(192, 192, 192, 1.0);
    /** the colour skyblue with an RGB value of #87CEEB. */
    Colour.SKYBLUE = new Colour(135, 206, 235, 1.0);
    /** the colour slateblue with an RGB value of #6A5ACD. */
    Colour.SLATEBLUE = new Colour(106, 90, 205, 1.0);
    /** the colour slategray with an RGB value of #708090. */
    Colour.SLATEGRAY = new Colour(112, 128, 144, 1.0);
    /** the colour slategrey with an RGB value of #708090. */
    Colour.SLATEGREY = new Colour(112, 128, 144, 1.0);
    /** the colour snow with an RGB value of #FFFAFA. */
    Colour.SNOW = new Colour(255, 250, 250, 1.0);
    /** the colour springgreen with an RGB value of #00FF7F. */
    Colour.SPRINGGREEN = new Colour(0, 255, 127, 1.0);
    /** the colour steelblue with an RGB value of #4682B4. */
    Colour.STEELBLUE = new Colour(70, 130, 180, 1.0);
    /** the colour tan with an RGB value of #D2B48C. */
    Colour.TAN = new Colour(210, 180, 140, 1.0);
    /** the colour teal with an RGB value of #008080. */
    Colour.TEAL = new Colour(0, 128, 128, 1.0);
    /** the colour thistle with an RGB value of #D8BFD8. */
    Colour.THISTLE = new Colour(216, 191, 216, 1.0);
    /** the colour tomato with an RGB value of #FF6347. */
    Colour.TOMATO = new Colour(255, 99, 71, 1.0);
    /** the colour turquoise with an RGB value of #40E0D0. */
    Colour.TURQUOISE = new Colour(64, 224, 208, 1.0);
    /** the colour violet with an RGB value of #EE82EE. */
    Colour.VIOLET = new Colour(238, 130, 238, 1.0);
    /** the colour wheat with an RGB value of #F5DEB3. */
    Colour.WHEAT = new Colour(245, 222, 179, 1.0);
    /** the colour white with an RGB value of #FFFFFF. */
    Colour.WHITE = new Colour(255, 255, 255, 1.0);
    /** the colour whitesmoke with an RGB value of #F5F5F5. */
    Colour.WHITESMOKE = new Colour(245, 245, 245, 1.0);
    /** the colour yellow with an RGB value of #FFFF00. */
    Colour.YELLOW = new Colour(255, 255, 0, 1.0);
    /** the colour yellowgreen with an RGB value of #9ACD32. */
    Colour.YELLOWGREEN = new Colour(154, 205, 50, 1.0);

    /**
     * A duration with a resolution of 1 millisecond.
     */
    class Duration {
        constructor(ms) {
            this.ms = ms;
        }
        /**
         * Duration given number of milliseconds.
         */
        static ofMilliseconds(ms) {
            return new Duration(ms);
        }
        /**
         * Duration given number of seconds.
         */
        static ofSeconds(secs) {
            return new Duration(secs * 1000);
        }
        /**
         * Duration given number of minutes.
         */
        static ofMinutes(mins) {
            return Duration.ofSeconds(mins * 60);
        }
        /**
         * Duration given number of hours.
         */
        static ofHours(hours) {
            return Duration.ofMinutes(hours * 60);
        }
        /**
         * Duration to milliseconds.
         */
        milliseconds() {
            return this.ms;
        }
        /**
         * Duration to seconds.
         */
        seconds() {
            return this.ms / 1000.0;
        }
    }

    class LatLong {
        constructor(latitude, longitude) {
            this._latitude = latitude;
            this._longitude = longitude;
        }
        static ofDegrees(latitude, longitude) {
            return new LatLong(Angle.ofDegrees(latitude), Angle.ofDegrees(longitude));
        }
        latitude() {
            return this._latitude;
        }
        longitude() {
            return this._longitude;
        }
    }

    /**
     * A length with a resolution of 0.1 millimetre.
     */
    class Length {
        constructor(tenthOfMm) {
            this.tenthOfMm = tenthOfMm;
        }
        static ofFeet(feet) {
            return new Length(Math.round(feet * 3048.0));
        }
        static ofMetres(metres) {
            return new Length(Math.round(metres * 10000.0));
        }
        static ofKilometres(kilometres) {
            return new Length(Math.round(kilometres * 10000000.0));
        }
        static ofNauticalMiles(nauticalMiles) {
            return new Length(Math.round(nauticalMiles * 18520000.0));
        }
        feet() {
            return this.tenthOfMm / 3048.0;
        }
        metres() {
            return this.tenthOfMm / 10000.0;
        }
        kilometres() {
            return this.tenthOfMm / 10000000.0;
        }
        nauticalMiles() {
            return this.tenthOfMm / 18520000.0;
        }
        scale(n) {
            return new Length(this.tenthOfMm * n);
        }
    }

    /**
     * Triangle defined by 3 vertices.
     */
    class Triangle {
        constructor(v1, v2, v3) {
            this._v1 = v1;
            this._v2 = v2;
            this._v3 = v3;
        }
        v1() {
            return this._v1;
        }
        v2() {
            return this._v2;
        }
        v3() {
            return this._v3;
        }
    }

    class Vector2d {
        constructor(x, y) {
            this._x = x;
            this._y = y;
        }
        x() {
            return this._x;
        }
        y() {
            return this._y;
        }
    }
    class Math2d {
        constructor() { }
        /**
         * Adds the 2 given vectors.
         */
        static add(v1, v2) {
            return new Vector2d(v1.x() + v2.x(), v1.y() + v2.y());
        }
        /**
         * Subtracts the 2 given vectors.
         */
        static sub(v1, v2) {
            return new Vector2d(v1.x() - v2.x(), v1.y() - v2.y());
        }
        /**
         * Computes the dot product of 2 vectors.
         */
        static dot(v1, v2) {
            return v1.x() * v2.x() + v1.y() * v2.y();
        }
        /**
         * Computes the norm of the given vector.
         */
        static norm(v) {
            return Math.sqrt(v.x() * v.x() + v.y() * v.y());
        }
        /**
         * Multiplies each component of the given vector by the given number.
         */
        static scale(v, s) {
            return new Vector2d(s * v.x(), s * v.y());
        }
        /**
         * Normalises the given vector (norm of return vector is 1).
         */
        static unit(v) {
            const s = 1.0 / Math2d.norm(v);
            return s == 1.0 ? v : Math2d.scale(v, s);
        }
    }
    class Geometry2d {
        constructor() { }
        /**
         * Determines whether p0 is right of the line from p1 to p2.
         */
        static right(p0, p1, p2) {
            return (p2.x() - p1.x()) * (p0.y() - p1.y()) - (p2.y() - p1.y()) * (p0.x() - p1.x()) <= 0;
        }
        /**
         * Determines whether the given position is inside the polygon defined by
         * the given list of positions.
         *
         * Notes:
         * - the polygon can be closedd or opened, i.e. first and last given positions
         *   can be equal.
         * - this method always returns false if the list contains less than 3 positions.
         */
        static insideSurface(p, ps) {
            const len = ps.length;
            if (len < 3) {
                return false;
            }
            // ray casting
            const x = p.x();
            const y = p.y();
            let inside = false;
            for (let i = 0, j = len - 1; i < len; j = i++) {
                const xi = ps[i].x();
                const yi = ps[i].y();
                const xj = ps[j].x();
                const yj = ps[j].y();
                const intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
                if (intersect) {
                    inside = !inside;
                }
            }
            return inside;
        }
        /**
         * Computes the 2D points that represent the circle defined
         * by the given centre and radius in pixels.
         */
        static discretiseCircle(centre, radius, nbPositions) {
            return Array.from(new Array(nbPositions), (_, i) => i)
                .map(i => 2 * i * Math.PI / nbPositions)
                /* circle at (0, 0), translated to centre */
                .map(a => new Vector2d(radius * Math.cos(a) + centre.x(), radius * Math.sin(a) + centre.y()));
        }
        /**
         * Extrudes the given polyline to a triangle strip of the given width.
         *
         * if (miterLength / halfWidth > miterLimit) the normal is used instead of
         * the miter. No bevel or square joints are produced in this case as it would
         * not be possible to replicate this in the GPU.
         */
        static extrude(points, width, miterLimit, closed) {
            const len = points.length;
            let ts = new Array();
            if (len < 2) {
                return ts;
            }
            const halfWidth = width / 2.0;
            const extruded = new Array();
            if (closed) {
                Geometry2d.extrudeUsingAdjs(points[0], points[len - 1], points[1], halfWidth, miterLimit, extruded);
            }
            else {
                Geometry2d.extrudeUsingAdj(points[0], points[1], halfWidth, extruded);
            }
            for (let i = 1; i < len - 1; i++) {
                Geometry2d.extrudeUsingAdjs(points[i], points[i - 1], points[i + 1], halfWidth, miterLimit, extruded);
            }
            if (closed) {
                Geometry2d.extrudeUsingAdjs(points[len - 1], points[len - 2], points[0], halfWidth, miterLimit, extruded);
            }
            else {
                Geometry2d.extrudeUsingAdj(points[len - 1], points[len - 2], -halfWidth, extruded);
            }
            const el = extruded.length;
            for (let i = 0; i < el - 2; i++) {
                ts.push(new Triangle(extruded[i], extruded[i + 1], extruded[i + 2]));
            }
            if (closed) {
                ts.push(new Triangle(extruded[el - 2], extruded[el - 1], extruded[0]));
                ts.push(new Triangle(extruded[el - 1], extruded[0], extruded[1]));
            }
            return ts;
        }
        static extrudeUsingAdjs(pt, prev, next, halfWidth, miterLimit, res) {
            /* line from prev to pt. */
            const lineTo = Geometry2d.direction(pt, prev);
            const normal = Geometry2d.normal(lineTo);
            /* line from pt to next. */
            const lineFrom = Geometry2d.direction(next, pt);
            /* miter. */
            const tangent = Math2d.unit(Math2d.add(lineTo, lineFrom));
            const miter = Geometry2d.normal(tangent);
            const miterLength = halfWidth / Math2d.dot(miter, normal);
            if (miterLength / halfWidth > miterLimit) {
                res.push(Math2d.add(pt, Math2d.scale(normal, halfWidth)));
                res.push(Math2d.add(pt, Math2d.scale(normal, -halfWidth)));
            }
            else {
                res.push(Math2d.add(pt, Math2d.scale(miter, miterLength)));
                res.push(Math2d.add(pt, Math2d.scale(miter, -miterLength)));
            }
        }
        static extrudeUsingAdj(pt, adj, halfWidth, res) {
            const normal = Geometry2d.normal(Geometry2d.direction(adj, pt));
            res.push(Math2d.add(pt, Math2d.scale(normal, halfWidth)));
            res.push(Math2d.add(pt, Math2d.scale(normal, -halfWidth)));
        }
        static normal(direction) {
            return new Vector2d(-direction.y(), direction.x());
        }
        static direction(a, b) {
            return Math2d.unit(Math2d.sub(a, b));
        }
    }

    class Vector3d {
        constructor(x, y, z) {
            this._x = x;
            this._y = y;
            this._z = z;
        }
        x() {
            return this._x;
        }
        y() {
            return this._y;
        }
        z() {
            return this._z;
        }
    }
    /** origin: (0, 0, 0). */
    Vector3d.ZERO = new Vector3d(0, 0, 0);
    class Math3d {
        /**
         * Adds the 2 given vectors.
         */
        static add(v1, v2) {
            return new Vector3d(v1.x() + v2.x(), v1.y() + v2.y(), v1.z() + v2.z());
        }
        /**
         * Subtracts the 2 given vectors.
         */
        static sub(v1, v2) {
            return new Vector3d(v1.x() - v2.x(), v1.y() - v2.y(), v1.z() - v2.z());
        }
        /**
         * Computes the cross product of 2 vectors: the vector perpendicular to given vectors.
         */
        static cross(v1, v2) {
            const x = v1.y() * v2.z() - v1.z() * v2.y();
            const y = v1.z() * v2.x() - v1.x() * v2.z();
            const z = v1.x() * v2.y() - v1.y() * v2.x();
            return new Vector3d(x, y, z);
        }
        /**
         * Computes the dot product of 2 vectors.
         */
        static dot(v1, v2) {
            return v1.x() * v2.x() + v1.y() * v2.y() + v1.z() * v2.z();
        }
        /**
         * Computes the norm of the given vector.
         */
        static norm(v) {
            return Math.sqrt(v.x() * v.x() + v.y() * v.y() + v.z() * v.z());
        }
        /**
         * Mutiplies given 3*3 matrix by given vector.
         */
        static multmv(m, v) {
            if (m.length != 3) {
                throw new RangeError("Rotation matrix must be 3*3");
            }
            return Math3d.a2v(m.map(r => Math3d.dot(v, r)));
        }
        /**
         * Mutiplies given 3*3 matrix by given 3*3 matrix.
         */
        static multmm(m1, m2) {
            if (m1.length != 3 || m2.length != 3) {
                throw new RangeError("Rotation matrix must be 3*3");
            }
            const t2 = Math3d.transpose(m2);
            return [
                Math3d.a2v(t2.map(t => Math3d.dot(m1[0], t))),
                Math3d.a2v(t2.map(t => Math3d.dot(m1[1], t))),
                Math3d.a2v(t2.map(t => Math3d.dot(m1[2], t)))
            ];
        }
        /**
         * Multiplies each component of the given vector by the given number.
         */
        static scale(v, s) {
            return new Vector3d(s * v.x(), s * v.y(), s * v.z());
        }
        /**
         * Normalises the given vector (norm of return vector is 1).
         */
        static unit(v) {
            const s = 1.0 / Math3d.norm(v);
            return s == 1.0 ? v : Math3d.scale(v, s);
        }
        /**
         * Transposes given 3*3 matrix.
         */
        static transpose(m) {
            const xs = m.map(Math3d.v2a);
            return [
                new Vector3d(xs[0][0], xs[1][0], xs[2][0]),
                new Vector3d(xs[0][1], xs[1][1], xs[2][1]),
                new Vector3d(xs[0][2], xs[1][2], xs[2][2])
            ];
        }
        /**  vector to array of numbers. */
        static v2a(v) {
            return [v.x(), v.y(), v.z()];
        }
        /** array of numbers to vector. */
        static a2v(a) {
            if (a.length != 3) {
                throw new RangeError("Array must contain 3 elements");
            }
            return new Vector3d(a[0], a[1], a[2]);
        }
    }
    /**
     * Geodetic calculations assuming a spherical earth model.
     */
    class Geometry3d {
        constructor() { }
        /**
         * Antipode of given position: the horizontal position on the surface of
         * the Earth which is diametrically opposite to given position.
         */
        static antipode(p) {
            return Math3d.scale(p, -1);
        }
        /**
         * Computes the destination position from given position having
         * travelled the given distance on the given initial bearing (compass angle) (bearing will normally vary
         * before destination is reached) and using the given earth radius.
         */
        static destination(p, b, distance, earthRadius) {
            const d = distance.metres();
            if (d === 0.0) {
                return p;
            }
            const r = earthRadius.metres();
            /* east direction vector at p */
            const ed = Math3d.unit(Math3d.cross(Geometry3d.NORTH_POLE, p));
            /* north direction vector at p */
            const nd = Math3d.cross(p, ed);
            /* central angle */
            const ta = Angle.central(d, r);
            /* unit vector in the direction of the azimuth */
            const de = Math3d.add(Math3d.scale(nd, Angle.cos(b)), Math3d.scale(ed, Angle.sin(b)));
            return Math3d.add(Math3d.scale(p, Angle.cos(ta)), Math3d.scale(de, Angle.sin(ta)));
        }
        /**
         * Determines whether the given position is inside the polygon defined by
         * the given list of positions.
         *
         * Notes:
         * - the polygon can be closed or opened, i.e. first and last given positions
         *   can be equal.
         * - this method uses the angle summation test: on a sphere, due to spherical
         *   excess, enclosed point angles
         *   will sum to less than 360°, and exterior point angles will be small but
         *   non-zero.
         * - this method always returns false if the list contains less than 3 positions.
         */
        static insideSurface(p, ps) {
            const len = ps.length;
            if (len == 0) {
                return false;
            }
            if (ps[0] === ps[len - 1]) {
                return Geometry3d.insideSurface(p, ps.slice(0, len - 1));
            }
            if (len < 3) {
                return false;
            }
            /* all vectors from p to each vertex */
            const edges = Geometry3d.edges(ps.map(pp => Math3d.sub(p, pp)));
            /* sum subtended angles of each edge (using vector p to determine sign) */
            const sum = edges
                .map(e => Geometry3d.signedAngleBetween(e[0], e[1], p))
                .reduce((acc, cur) => acc + cur, 0);
            return Math.abs(sum) > Math.PI;
        }
        /**
         * Determines whether p0 is right of the great arc from p1 to p2.
         */
        static right(p0, p1, p2) {
            return Math3d.dot(p0, Math3d.cross(p1, p2)) <= 0;
        }
        /**
         * Computes the positions (n-vectors) that represent the circle defined
         * by the given centre and radius according to the given earth radius.
         */
        static discretiseCircle(centre, radius, earthRadius, nbPositions) {
            const rm = radius.metres();
            const erm = earthRadius.metres();
            const z = Math.sqrt(erm * erm - rm * rm);
            const rya = (Math.PI / 2.0) - centre.latitude().radians();
            const cy = Math.cos(rya);
            const sy = Math.sin(rya);
            const ry = [
                new Vector3d(cy, 0, sy),
                new Vector3d(0, 1, 0),
                new Vector3d(-sy, 0, cy)
            ];
            const rza = centre.longitude().radians();
            const cz = Math.cos(rza);
            const sz = Math.sin(rza);
            const rz = [
                new Vector3d(cz, -sz, 0),
                new Vector3d(sz, cz, 0),
                new Vector3d(0, 0, 1)
            ];
            return Array.from(new Array(nbPositions), (_, i) => i)
                .map(i => 2 * i * Math.PI / nbPositions)
                /* circle at north pole */
                .map(a => new Vector3d(rm * Math.cos(a), rm * Math.sin(a), z))
                /* rotate each point to circle centre */
                .map(v => Math3d.multmv(rz, Math3d.multmv(ry, v)))
                /* unit. */
                .map(Math3d.unit);
        }
        /**
         * Computes the surface distance (length of geodesic) between the given positions.
         */
        static surfaceDistance(p1, p2, earthRadius) {
            const m = Geometry3d.signedAngleBetween(p1, p2, undefined) * earthRadius.metres();
            return Length.ofMetres(m);
        }
        /**
         * Computes the signed angle in radians between n-vectors p1 and p2.
         * If n is 'undefined', the angle is always in [0..pi], in [-pi, pi],
         * otherwise it is signed + if p1 is clockwise looking along n,
         * - in opposite direction.
         */
        static signedAngleBetween(p1, p2, n) {
            const p1xp2 = Math3d.cross(p1, p2);
            const sign = n === undefined ? 1 : Math.sign(Math3d.dot(p1xp2, n));
            const sinO = sign * Math3d.norm(p1xp2);
            const cosO = Math3d.dot(p1, p2);
            return Math.atan2(sinO, cosO);
        }
        /** [p1, p2, p3, p4] to [(p1, p2), (p2, p3), (p3, p4), (p4, p1)]. */
        static edges(ps) {
            const xs = ps.slice(0, ps.length - 1);
            const l = ps[ps.length - 1];
            xs.unshift(l);
            return ps.map((p, i) => [p, xs[i]]);
        }
    }
    Geometry3d.NORTH_POLE = new Vector3d(0, 0, 1);

    /**
     * Transformations between positions in different coordinate systems used when rendering shapes
     * defined by latitude/longitude into a canvas.
     *
     * The transformation flow is:
     * latitude/longitude (geodetic position) -> geocentric
     * geocentric -> stereographic
     * stereographic -> canvas (pixels)
     * canvas -> WebGL clipspace
     *
     * Transformations done on the CPU:
     *
     * Geocentric positions are represented as n-vectors: the normal vector to the sphere.
     * n-vector prientation: z-axis points to the North Pole along the Earth's
     * rotation axis, x-axis points towards the point where latitude = longitude = 0.
     * Note: on a spherical model earth, a n-vector is equivalent to a normalised
     * version of an (ECEF) cartesian coordinate.
     *
     * Transformations done on the GPU:
     *
     * Stereographic Coordinate System: the stereographic projection, projects points on
     * a sphere onto a plane with respect to a projection centre.
     * Note: x and y ordinates of a stereographic position are in metres.
     *
     * Canvas coordinate system: Allows transformation between positions in the stereographic
     * coordinate system and the canvas coordinate system.
     * Canvas coordinate system: origin is at top-left corner of the canvas, x axis is towards
     * the right and y-axis towards the bottom of the canvas.
     *
     * WebGL clipspace is x, y between (-1, 1), x axis is towards
     * the right and y-axis towards the bottom of the canvas.
     * Note: this transformation is always done in the GPU. The two last transformations
     * are not merged in order to allow for pixels to be offset in the GPU.
     *
     * Notes: all matrices are given in row major order, so in the shader vector * matrix
     * shall be used.
     */
    class CoordinateSystems {
        constructor() { }
        /*****************************************
         *** Latitude/Longitude <=> Geocentric ***
         *****************************************/
        /**
         * Converts the given latitude/longitude to a geocentric position (n-vector).
         */
        static latLongToGeocentric(ll) {
            const lat = ll.latitude();
            const lon = ll.longitude();
            const cl = Angle.cos(lat);
            const x = cl * Angle.cos(lon);
            const y = cl * Angle.sin(lon);
            const z = Angle.sin(lat);
            return new Vector3d(x, y, z);
        }
        /**
         * Converts the given geocentric position (n-vector) to a latitude/longitude.
         */
        static geocentricToLatLong(nv) {
            const lat = Angle.atan2(nv.z(), Math.sqrt(nv.x() * nv.x() + nv.y() * nv.y()));
            const lon = Angle.atan2(nv.y(), nv.x());
            return new LatLong(lat, lon);
        }
        /*****************************************
         ***    Geocentric <=> Stereographic   ***
         *****************************************/
        /**
         * Computes the attribues of a stereographic projection.
         */
        static computeStereographicProjection(centre, earthRadius) {
            const geoCentre = CoordinateSystems.latLongToGeocentric(centre);
            const sinPcLat = Angle.sin(centre.latitude());
            const cosPcLat = Angle.cos(centre.latitude());
            const sinPcLon = Angle.sin(centre.longitude());
            const cosPcLon = Angle.cos(centre.longitude());
            const r1 = new Vector3d(-sinPcLon, cosPcLon, 0.0);
            const r2 = new Vector3d(-sinPcLat * cosPcLon, -sinPcLat * sinPcLon, cosPcLat);
            const r3 = new Vector3d(cosPcLat * cosPcLon, cosPcLat * sinPcLon, sinPcLat);
            const dr = [r1, r2, r3];
            const ir = Math3d.transpose(dr);
            const drGl = Float32Array.of(dr[0].x(), dr[0].y(), dr[0].z(), dr[1].x(), dr[1].y(), dr[1].z(), dr[2].x(), dr[2].y(), dr[2].z());
            return new StereographicProjection(geoCentre, earthRadius.metres(), dr, drGl, ir);
        }
        static geocentricToStereographic(nv, sp) {
            const earthRadius = sp.earthRadius();
            // n-vector to system
            const translated = Math3d.scale(Math3d.sub(nv, sp.centre()), earthRadius);
            const system = Math3d.multmv(sp.directRotation(), translated);
            // system to stereo
            const k = (2.0 * earthRadius) / (2.0 * earthRadius + system.z());
            return new Vector2d(k * system.x(), k * system.y());
        }
        static stereographicToGeocentric(stereo, sp) {
            const earthRadius = sp.earthRadius();
            // stereo to system
            const tr = earthRadius * 2.0;
            const tr2 = tr * tr;
            const dxy2 = (stereo.x() * stereo.x()) + (stereo.y() * stereo.y());
            const z = (((tr2 - dxy2) / (tr2 + dxy2)) * (earthRadius)) - earthRadius;
            const k = tr / (tr + z);
            const system = new Vector3d(stereo.x() / k, stereo.y() / k, z);
            // system to n-vector
            const c = Math3d.scale(sp.centre(), earthRadius);
            return Math3d.unit(Math3d.add(c, Math3d.multmv(sp.inverseRotation(), system)));
        }
        /*****************************************
         *** Stereographic <=> Canvas (pixels) ***
         *****************************************/
        static computeCanvasAffineTransform(centre, hrange, rotation, canvas, sp) {
            const gc = CoordinateSystems.latLongToGeocentric(centre);
            const east = Angle.ofDegrees(90.0);
            const halfRange = hrange.scale(0.5);
            const er = Length.ofMetres(sp.earthRadius());
            const left = CoordinateSystems.geocentricToStereographic(Geometry3d.destination(gc, east, halfRange, er), sp);
            const ratio = canvas.height() / canvas.width();
            const sc = CoordinateSystems.geocentricToStereographic(gc, sp);
            const width = 2 * Math.abs(left.x() - sc.x());
            const height = width * ratio;
            const canvasWidth = canvas.width();
            const canvasHeight = canvas.height();
            const sx = canvasWidth / width;
            const sy = -canvasHeight / height;
            const worldTopLeftX = sc.x() - width / 2.0;
            const worldTopLeftY = sc.y() + height / 2.0;
            const tx = -sx * worldTopLeftX;
            const ty = -sy * worldTopLeftY;
            /*
             * translate to centre:
             * [   1    0    tx  ]
             * [   0    1    ty  ]
             * [   0    0    1   ]
             */
            let m = [
                new Vector3d(1, 0, tx),
                new Vector3d(0, 1, ty),
                new Vector3d(0, 0, 1)
            ];
            /*
             * scale:
             * [   sx   0    0   ]
             * [   0    sy   0   ]
             * [   0    0    1   ]
             */
            m = Math3d.multmm(m, [
                new Vector3d(sx, 0, 0),
                new Vector3d(0, sy, 0),
                new Vector3d(0, 0, 1)
            ]);
            /*
             * rotate by magDeclination at centre.
             * [   1    0    cx  ]    [   cos(a)   -sin(a)  0   ]    [   1    0   -cx ]
             * [   0    1    cy  ] T  [   sin(a)   cos(a)   0   ] T  [   0    1   -cy ]
             * [   0    0    1   ]    [   0          0      1   ]    [   0    0    1  ]
             */
            if (rotation.degrees() !== 0) {
                m = CoordinateSystems.rotate(m, rotation, sc.x(), sc.y());
            }
            /* we don't store m[2] as it is always [0,0,1] (2D transformation only). */
            const r0 = m[0];
            const r1 = m[1];
            const glMatrix = Float32Array.of(m[0].x(), m[0].y(), m[0].z(), m[1].x(), m[1].y(), m[1].z(), 0, 0, 1);
            return new CanvasAffineTransform(sc, r0, r1, glMatrix);
        }
        static stereographicToCanvas(p, at) {
            return new Vector2d(p.x() * at.r0().x() + p.y() * at.r0().y() + at.r0().z(), p.x() * at.r1().x() + p.y() * at.r1().y() + at.r1().z());
        }
        static canvasToStereographic(p, at) {
            let x = p.x() - at.r0().z();
            let y = p.y() - at.r1().z();
            const det = at.r0().x() * at.r1().y() - at.r0().y() * at.r1().x();
            x = (x * at.r1().y() - y * at.r0().y()) / det;
            y = (y * at.r0().x() - x * at.r1().x()) / det;
            return new Vector2d(x, y);
        }
        static canvasOffsetToStereographic(o, at) {
            return new Vector2d(o.x() / at.r0().x(), o.y() / at.r1().y());
        }
        /******************************************
         *** Canvas (pixels) => WebGL clipspace ***
         ******************************************/
        static canvasToClipspace(width, height) {
            return Float32Array.of(2 / width, 0, -1, 0, -2 / height, 1, 0, 0, 1);
        }
        static translate(m, tx, ty) {
            const t = [
                new Vector3d(1, 0, tx),
                new Vector3d(0, 1, ty),
                new Vector3d(0, 0, 1)
            ];
            return Math3d.multmm(m, t);
        }
        /*
         * rotation by a at (x, y).
         * [   1    0    x  ]    [   cos(a)   -sin(a)  0   ]    [   1    0   -x ]
         * [   0    1    y  ] T  [   sin(a)   cos(a)   0   ] T  [   0    1   -y ]
         * [   0    0    1  ]    [   0          0      1   ]    [   0    0    1 ]
         */
        static rotate(m, alpha, atX, atY) {
            const cosa = Angle.cos(alpha);
            const sina = Angle.sin(alpha);
            const r = [
                new Vector3d(cosa, -sina, 0),
                new Vector3d(sina, cosa, 0),
                new Vector3d(0, 0, 1)
            ];
            return CoordinateSystems.translate(Math3d.multmm(CoordinateSystems.translate(m, atX, atY), r), -atX, -atY);
        }
    }
    /**
     * Attributes of a stereographic projection at a given centre position.
     */
    class StereographicProjection {
        constructor(centre, earthRadius, dr, drGl, ir) {
            this._centre = centre;
            this._earthRadius = earthRadius;
            this._dr = dr;
            this._drGl = drGl;
            this._ir = ir;
        }
        centre() {
            return this._centre;
        }
        earthRadius() {
            return this._earthRadius;
        }
        directRotation() {
            return this._dr;
        }
        directRotationGl() {
            return this._drGl;
        }
        inverseRotation() {
            return this._ir;
        }
    }
    class CanvasDimension {
        constructor(width, height) {
            this._width = width;
            this._height = height;
        }
        width() {
            return this._width;
        }
        height() {
            return this._height;
        }
    }
    /**
     * Affine transform to convert from positions in
     * the stereographic coordinate system to positions
     * in the canvas coordinate system.
     */
    class CanvasAffineTransform {
        constructor(centre, r0, r1, glMatrix) {
            this._centre = centre;
            this._r0 = r0;
            this._r1 = r1;
            this._glMatrix = glMatrix;
        }
        centre() {
            return this._centre;
        }
        r0() {
            return this._r0;
        }
        r1() {
            return this._r1;
        }
        glMatrix() {
            return this._glMatrix;
        }
    }

    /**
     * A track represents the state of a vehicle by its current position, bearing and speed.
     */
    class Track {
        constructor(pos, bearing, speed) {
            this._pos = pos;
            this._bearing = bearing;
            this._speed = speed;
        }
        /**
         * position of the track.
         */
        pos() {
            return this._pos;
        }
        /**
         * bearing of the track.
         */
        bearing() {
            return this._bearing;
        }
        /**
         * speed of the track.
         */
        speed() {
            return this._speed;
        }
    }
    /**
     * Kinematics calculations assuming a spherical earth model.
     */
    // TODO: add closed point of approach and intercept
    class Kinematics {
        /**
         * Computes the position of given track after given duration has elapsed and using
         * the given earth radius.
         */
        static position(track, duration, earthRadius) {
            const c = Kinematics.course(track.pos(), track.bearing());
            const a = track.speed().metresPerSecond() / earthRadius.metres() * duration.seconds();
            const p0 = CoordinateSystems.latLongToGeocentric(track.pos());
            const pt = Math3d.add(Math3d.scale(p0, Math.cos(a)), Math3d.scale(c, Math.sin(a)));
            return CoordinateSystems.geocentricToLatLong(pt);
        }
        static course(p, b) {
            const lat = p.latitude();
            const lon = p.longitude();
            const _rx = Kinematics.rx(b);
            const _ry = Kinematics.ry(lat);
            const _rz = Kinematics.rz(Angle.ofDegrees(-lon.degrees()));
            const r = Math3d.multmm(Math3d.multmm(_rz, _ry), _rx);
            return new Vector3d(r[0].z(), r[1].z(), r[2].z());
        }
        static rx(a) {
            const c = Angle.cos(a);
            const s = Angle.sin(a);
            return [
                new Vector3d(1, 0, 0),
                new Vector3d(0, c, s),
                new Vector3d(0, -s, c)
            ];
        }
        static ry(a) {
            const c = Angle.cos(a);
            const s = Angle.sin(a);
            return [
                new Vector3d(c, 0, -s),
                new Vector3d(0, 1, 0),
                new Vector3d(s, 0, c)
            ];
        }
        static rz(a) {
            const c = Angle.cos(a);
            const s = Angle.sin(a);
            return [
                new Vector3d(c, s, 0),
                new Vector3d(-s, c, 0),
                new Vector3d(0, 0, 1)
            ];
        }
    }

    /**
     * Rendering options.
     */
    class RenderingOptions {
        constructor(fps, circlePositions, miterLimit) {
            this._fps = fps;
            this._circlePositions = circlePositions;
            this._miterLimit = miterLimit;
        }
        /**
         * Number of frame per seconds.
         */
        fps() {
            return this._fps;
        }
        /**
         * Number of positions when discretising a circle.
         */
        circlePositions() {
            return this._circlePositions;
        }
        /**
         * Value of the miter limit when rendering wide polylines. If the length
         * of the miter divide by the half width of the polyline is greater than this
         * value, the miter will be ignored and normal to the line segment is used.
         */
        miterLimit() {
            return this._miterLimit;
        }
    }

    /**
     * Offset in pixels from a point on the canvas.
     * x axis is right and y axis is down.
     */
    class Offset {
        constructor(x, y) {
            this._x = x;
            this._y = y;
        }
        x() {
            return this._x;
        }
        y() {
            return this._y;
        }
    }

    class Stroke {
        constructor(colour, width) {
            this._colour = colour;
            this._width = width;
        }
        colour() {
            return this._colour;
        }
        width() {
            return this._width;
        }
    }
    class Paint {
        constructor(stroke, fill) {
            this._stroke = stroke;
            this._fill = fill;
        }
        static stroke(stroke) {
            return new Paint(stroke, undefined);
        }
        static fill(fill) {
            return new Paint(undefined, fill);
        }
        /**
         * Paint with both a fill and stroke.
         */
        static complete(stroke, fill) {
            return new Paint(stroke, fill);
        }
        stroke() {
            return this._stroke;
        }
        fill() {
            return this._fill;
        }
    }
    // FIXME: add
    // - GeoArc
    // - GeoText
    // - GeoSymbol
    // - GeoRelativeArc
    // - GeoRelativeText
    // - GeoRelativeSymbol
    // - CanvasArc
    // - CanvasCircle
    // - CanvasPolygon
    // - CanvasPolyline
    // - CanvasText
    // - CanvasSymbol
    var ShapeType;
    (function (ShapeType) {
        ShapeType[ShapeType["GeoCircle"] = 0] = "GeoCircle";
        ShapeType[ShapeType["GeoPolygon"] = 1] = "GeoPolygon";
        ShapeType[ShapeType["GeoPolyline"] = 2] = "GeoPolyline";
        ShapeType[ShapeType["GeoRelativeCircle"] = 3] = "GeoRelativeCircle";
        ShapeType[ShapeType["GeoRelativePolygon"] = 4] = "GeoRelativePolygon";
        ShapeType[ShapeType["GeoRelativePolyline"] = 5] = "GeoRelativePolyline";
    })(ShapeType || (ShapeType = {}));
    /**
     * Circle whose centre is defined by latitude/longitude.
     */
    class GeoCircle {
        constructor(centre, radius, paint) {
            this.type = ShapeType.GeoCircle;
            this._centre = centre;
            this._radius = radius;
            this._paint = paint;
        }
        centre() {
            return this._centre;
        }
        radius() {
            return this._radius;
        }
        paint() {
            return this._paint;
        }
    }
    /**
     * Polygon whose vertices are latitude/longitude.
     */
    class GeoPolygon {
        constructor(vertices, paint) {
            this.type = ShapeType.GeoPolygon;
            this._vertices = vertices;
            this._paint = paint;
        }
        vertices() {
            return this._vertices;
        }
        paint() {
            return this._paint;
        }
    }
    /**
     * Polyline whose points are latitude/longitude
     */
    class GeoPolyline {
        constructor(points, stroke) {
            this.type = ShapeType.GeoPolyline;
            this._points = points;
            this._stroke = stroke;
        }
        points() {
            return this._points;
        }
        stroke() {
            return this._stroke;
        }
    }
    /**
     * Circle whose centre is defined as an offset in pixels from a
     * reference latitude/longitude and radius is in pixels.
     */
    class GeoRelativeCircle {
        constructor(centreRef, centreOffset, radius, paint) {
            this.type = ShapeType.GeoRelativeCircle;
            this._centreRef = centreRef;
            this._centreOffset = centreOffset;
            this._radius = radius;
            this._paint = paint;
        }
        centreRef() {
            return this._centreRef;
        }
        centreOffset() {
            return this._centreOffset;
        }
        radius() {
            return this._radius;
        }
        paint() {
            return this._paint;
        }
    }
    /**
     * Polygon whose vertices are defined as pixels offsets from a reference
     * latitude/longitude.
     */
    class GeoRelativePolygon {
        constructor(ref, vertices, paint) {
            this.type = ShapeType.GeoRelativePolygon;
            this._ref = ref;
            this._vertices = vertices;
            this._paint = paint;
        }
        ref() {
            return this._ref;
        }
        vertices() {
            return this._vertices;
        }
        paint() {
            return this._paint;
        }
    }
    /**
     * Polyline whose points are defined as pixels offsets from a reference
     * latitude/longitude.
     */
    class GeoRelativePolyline {
        constructor(ref, points, stroke) {
            this.type = ShapeType.GeoRelativePolyline;
            this._ref = ref;
            this._points = points;
            this._stroke = stroke;
        }
        ref() {
            return this._ref;
        }
        points() {
            return this._points;
        }
        stroke() {
            return this._stroke;
        }
    }

    /**
     * A speed with a resolution of 1 millimetre per hour.
     */
    class Speed {
        constructor(mmPerHour) {
            this.mmPerHour = mmPerHour;
        }
        /**
         * Speed from given amount of metres per second.
         */
        static ofMetresPerSecond(mps) {
            return new Speed(Math.round(mps * 3600000.0));
        }
        /**
         * Speed from given amount of kilometres per hour.
         */
        static ofKilometresPerHour(kph) {
            return new Speed(Math.round(kph * 1e+6));
        }
        /**
         * Speed from given amount of miles per hour.
         */
        static ofMilesPerHour(mph) {
            return new Speed(Math.round(mph * 1609344.0));
        }
        /**
         * Speed from given amount of knots.
         */
        static ofKnots(kt) {
            return new Speed(Math.round(kt * 1852000.0));
        }
        /**
         * Speed from given amount feet per second.
         */
        static feetPerSecond(fps) {
            return new Speed(Math.round(fps * 1097280.0));
        }
        /**
         * Speed to metres per second.
         */
        metresPerSecond() {
            return this.mmPerHour / 3600000.0;
        }
        /**
         * Speed to kilometres per hour.
         */
        kilometresPerHour() {
            return this.mmPerHour / 1e+6;
        }
        /**
         * Speed to miles per hour.
         */
        milesPerHour() {
            return this.mmPerHour / 1609344.0;
        }
        /**
         * Speed to knots.
         */
        knots() {
            return this.mmPerHour / 1852000.0;
        }
        /**
         * Speed to feet per second.
         */
        feetPerSecond() {
            return this.mmPerHour / 1097280.0;
        }
    }

    /**
     * Polygon triangulation.
     */
    class Triangulator {
        constructor(isRight, isInsideSurface) {
            this.isRight = isRight;
            this.isInsideSurface = isInsideSurface;
        }
        /**
         * Triangulates the given polygon which can be
         * convex or concave, self-intersecting or simple.
         */
        triangulate(polygon) {
            if (polygon.length < 3) {
                throw new RangeError("A polygon must contain at least 3 vertices");
            }
            if (polygon.length == 3) {
                return [new Triangle(polygon[0], polygon[1], polygon[2])];
            }
            let r = new Array();
            const sps = this.simplePolygons(polygon);
            // 'flatMap' the result of the triangulation of each simple polygon
            sps.forEach(sp => r = r.concat(this.triangulateSimple(sp), r));
            return r;
        }
        /**
         * Triangulates the given simple polygon which can be
         * convex or concave. Use this method if you the Polygon
         * is simple (i.e. not self-intersecting): this skips the
         * determination of the self-interection(s) which can be
         * costly.
         */
        triangulateSimple(vs) {
            if (vs.length < 3) {
                throw new RangeError("A polygon must contain at least 3 vertices");
            }
            if (vs.length == 3) {
                return [new Triangle(vs[0], vs[1], vs[2])];
            }
            if (vs.length == 4) {
                return [new Triangle(vs[0], vs[1], vs[2]), new Triangle(vs[2], vs[3], vs[0])];
            }
            return this.earClipping(vs);
        }
        /**
         * Splits the given polygon to a list of simple polygon - i.e. not self-intersecting.
         */
        simplePolygons(polygon) {
            // TODO implement
            return [polygon];
        }
        earClipping(vs) {
            const ovs = this.orient(vs);
            let triangles = new Array();
            while (true) {
                if (ovs.length == 3) {
                    triangles.push(new Triangle(ovs[0], ovs[1], ovs[2]));
                    return triangles;
                }
                const ei = this.findEar(ovs);
                if (ei === -1) {
                    throw new RangeError("Triangulation error, remaining vertices:\n" + ovs.length + "\ntriangles:\n" + triangles.length);
                }
                const pi = Triangulator.prev(ei, ovs.length);
                const ni = Triangulator.next(ei, ovs.length);
                triangles.push(new Triangle(ovs[pi], ovs[ei], ovs[ni]));
                ovs.splice(ei, 1);
            }
        }
        /**
         * Finds the index of the next ear in the given polygon (oriented clockwise).
         * Returns -1 if none found.
         */
        findEar(vs) {
            const len = vs.length;
            const c = this.classify(vs);
            for (let i = 0; i < len; i++) {
                const v = vs[i];
                if (!c[i]) {
                    /*
                     * i is a convex vertex, then i is an ear if
                     * triangle pi, i, ni contains no reflex.
                     */
                    const t = [vs[Triangulator.prev(i, len)], v, vs[Triangulator.next(i, len)]];
                    const ear = vs
                        .filter((_, j) => c[j])
                        .every(r => !this.isInsideSurface(r, t));
                    if (ear) {
                        return i;
                    }
                }
            }
            return -1;
        }
        /**
         * Classifies every vertex as either a reflex (true)
         * or a convex vertex (false) of the given polygon (oriented clockwise).
         * A reflex is a vertex where the polygon is concave.
         */
        classify(vs) {
            /* a vertex is a reflex if previous vertex is left
             * (assuming a clockwise polygon), otherwise it is a convex
             * vertex. */
            const len = vs.length;
            return vs
                .map((v, i) => this.isRight(vs[Triangulator.prev(i, len)], v, vs[(i + 1) % len]));
        }
        /**
         * Orients the given polygon in clockwise order. A new array is returned.
         */
        orient(vs) {
            // compute orientation of each vertex
            const len = vs.length;
            const vos = vs
                .map((v, i) => this.isRight(v, vs[(i + 1) % len], vs[(i + 2) % len]));
            // if more right than left then polygon is clockwise, otherwise counterclockwise
            const cw = vos.filter(o => o).length >= vos.filter(o => !o).length;
            const res = vs.slice(0);
            // if counterclockwise reverse
            if (cw) {
                res.reverse();
            }
            return res;
        }
        static prev(i, len) {
            return i === 0 ? len - 1 : i - 1;
        }
        static next(i, len) {
            return i === len - 1 ? 0 : i + 1;
        }
    }
    /**
     * Triangulator that handles spherical polygons whose vertices are defined as
     * geocentric positions.
     */
    Triangulator.SPHERICAL = new Triangulator(Geometry3d.right, Geometry3d.insideSurface);
    /**
     * Triangulator that handles polygons whose vertices are defined as 2D positions.
     */
    Triangulator.PLANAR = new Triangulator(Geometry2d.right, Geometry2d.insideSurface);

    var DrawMode;
    (function (DrawMode) {
        DrawMode[DrawMode["LINES"] = 0] = "LINES";
        DrawMode[DrawMode["TRIANGLES"] = 1] = "TRIANGLES";
    })(DrawMode || (DrawMode = {}));
    /**
     * Provides previous positions, next positions and signed half-width
     * to be used by the vertex shader to extrude geocentric positions when
     * drawing wide lines.
     */
    class Extrusion {
        constructor(prevGeos, nextGeos, halfWidths) {
            this._prevGeos = prevGeos;
            this._nextGeos = nextGeos;
            this._halfWidths = halfWidths;
        }
        prevGeos() {
            return this._prevGeos;
        }
        nextGeos() {
            return this._nextGeos;
        }
        halfWidths() {
            return this._halfWidths;
        }
    }
    /**
     * A mesh is defined by geocentric positions, extrusion, offsets, colours and a draw mode.
     */
    class Mesh {
        constructor(geos, extrusion, offsets, colours, drawMode) {
            this._geos = geos;
            this._extrusion = extrusion;
            this._offsets = offsets;
            this._colours = colours;
            this._drawMode = drawMode;
        }
        /**
         * Array of geocentric vertices (3 components each) or empty. If not empty
         * this determines the number of indices to be rendered. If empty the VBO must
         * be disabled.
         */
        geos() {
            return this._geos;
        }
        /**
         * Extrusion data to be used when drawing wide lines or undefined
         */
        extrusion() {
            return this._extrusion;
        }
        /**
         * Array of offsets vertices (2 components each) or empty. If geos is empty
         * this determines the number of indices to be rendered. If empty the VBO must
         * be disabled.
         */
        offsets() {
            return this._offsets;
        }
        /**
         * Array of colours (1 component each), never empty.
         */
        colours() {
            return this._colours;
        }
        drawMode() {
            return this._drawMode;
        }
    }
    class MeshGenerator {
        constructor() { }
        static mesh(s, earthRadius, options) {
            switch (s.type) {
                case ShapeType.GeoCircle:
                    return MeshGenerator.fromGeoCircle(s, earthRadius, options.circlePositions());
                case ShapeType.GeoPolygon:
                    return MeshGenerator.fromGeoPolygon(s);
                case ShapeType.GeoPolyline:
                    return MeshGenerator.fromGeoPolyline(s);
                case ShapeType.GeoRelativeCircle:
                    return MeshGenerator.fromGeoRelativeCircle(s, options.circlePositions(), options.miterLimit());
                case ShapeType.GeoRelativePolygon:
                    return MeshGenerator.fromGeoRelativePoygon(s, options.miterLimit());
                case ShapeType.GeoRelativePolyline:
                    return MeshGenerator.fromGeoRelativePoyline(s, options.miterLimit());
            }
        }
        static fromGeoCircle(c, earthRadius, circlePositions) {
            const gs = Geometry3d.discretiseCircle(c.centre(), c.radius(), earthRadius, circlePositions);
            const paint = c.paint();
            return MeshGenerator._fromGeoPolygon(gs, paint);
        }
        static fromGeoPolyline(l) {
            const gs = l.points().map(CoordinateSystems.latLongToGeocentric);
            return [MeshGenerator._fromGeoPoyline(gs, l.stroke(), false)];
        }
        static fromGeoPolygon(p) {
            const gs = p.vertices().map(CoordinateSystems.latLongToGeocentric);
            const paint = p.paint();
            return MeshGenerator._fromGeoPolygon(gs, paint);
        }
        static _fromGeoPolygon(gs, paint) {
            const stroke = paint.stroke();
            const fill = paint.fill();
            let res = new Array();
            if (fill !== undefined) {
                const ts = Triangulator.SPHERICAL.triangulate(gs);
                const vs = MeshGenerator.geoTrianglesToArray(ts);
                const cs = MeshGenerator.colours(fill, vs, 3);
                res.push(new Mesh(vs, undefined, [], cs, DrawMode.TRIANGLES));
            }
            if (stroke !== undefined) {
                res.push(MeshGenerator._fromGeoPoyline(gs, stroke, true));
            }
            return res;
        }
        static _fromGeoPoyline(points, stroke, closed) {
            if (stroke.width() === 1) {
                const vs = MeshGenerator.geoPointsToArray(points, closed);
                const cs = MeshGenerator.colours(stroke.colour(), vs, 3);
                return new Mesh(vs, undefined, [], cs, DrawMode.LINES);
            }
            const e = closed
                ? MeshGenerator.closedExtrusion(points, stroke.width())
                : MeshGenerator.openedExtrusion(points, stroke.width());
            const vs = e[0];
            const cs = MeshGenerator.colours(stroke.colour(), vs, 3);
            return new Mesh(vs, e[1], [], cs, DrawMode.TRIANGLES);
        }
        static fromGeoRelativeCircle(c, circlePositions, miterLimit) {
            const ref = c.centreRef();
            const centre = new Vector2d(c.centreOffset().x(), c.centreOffset().y());
            const ps = Geometry2d.discretiseCircle(centre, c.radius(), circlePositions);
            const paint = c.paint();
            return MeshGenerator._fromGeoRelativePoygon(ref, ps, paint, miterLimit);
        }
        static fromGeoRelativePoygon(p, miterLimit) {
            const ref = p.ref();
            const ps = p.vertices().map(v => new Vector2d(v.x(), v.y()));
            const paint = p.paint();
            return MeshGenerator._fromGeoRelativePoygon(ref, ps, paint, miterLimit);
        }
        static _fromGeoRelativePoygon(ref, vertices, paint, miterLimit) {
            const stroke = paint.stroke();
            const fill = paint.fill();
            let res = new Array();
            if (fill !== undefined) {
                const ts = Triangulator.PLANAR.triangulate(vertices);
                const os = MeshGenerator.offsetTrianglesToArray(ts);
                const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(ref), os);
                const cs = MeshGenerator.colours(fill, os, 2);
                res.push(new Mesh(vs, undefined, os, cs, DrawMode.TRIANGLES));
            }
            if (stroke !== undefined) {
                res.push(MeshGenerator._fromGeoRelativePoyline(ref, vertices, stroke, true, miterLimit));
            }
            return res;
        }
        static fromGeoRelativePoyline(l, miterLimit) {
            const ps = l.points().map(p => new Vector2d(p.x(), p.y()));
            return [
                MeshGenerator._fromGeoRelativePoyline(l.ref(), ps, l.stroke(), false, miterLimit)
            ];
        }
        static _fromGeoRelativePoyline(ref, points, stroke, closed, miterLimit) {
            if (stroke.width() === 1) {
                const os = MeshGenerator.offsetPointsToArray(points, closed);
                const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(ref), os);
                const cs = MeshGenerator.colours(stroke.colour(), os, 2);
                return new Mesh(vs, undefined, os, cs, DrawMode.LINES);
            }
            const ts = Geometry2d.extrude(points, stroke.width(), miterLimit, closed);
            const os = MeshGenerator.offsetTrianglesToArray(ts);
            const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(ref), os);
            const cs = MeshGenerator.colours(stroke.colour(), os, 2);
            return new Mesh(vs, undefined, os, cs, DrawMode.TRIANGLES);
        }
        static geoTrianglesToArray(ts) {
            let res = new Array();
            const len = ts.length;
            for (let i = 0; i < len; i++) {
                const t = ts[i];
                res.push(t.v1().x(), t.v1().y(), t.v1().z(), t.v2().x(), t.v2().y(), t.v2().z(), t.v3().x(), t.v3().y(), t.v3().z());
            }
            return res;
        }
        static offsetTrianglesToArray(ts) {
            let res = new Array();
            const len = ts.length;
            for (let i = 0; i < len; i++) {
                const t = ts[i];
                res.push(t.v1().x(), t.v1().y(), t.v2().x(), t.v2().y(), t.v3().x(), t.v3().y());
            }
            return res;
        }
        static geoPointsToArray(ps, closed) {
            /*
             * since we draw with LINES we need to repeat each intermediate point.
             * drawing with LINE_STRIP would not require this but would not allow
             * to draw multiple polylines at once.
             */
            let res = new Array();
            const len = ps.length;
            const last = len - 1;
            for (let i = 0; i < len; i++) {
                const p = ps[i];
                res.push(p.x(), p.y(), p.z());
                if (i !== 0 && i !== last) {
                    res.push(p.x(), p.y(), p.z());
                }
            }
            if (closed) {
                res.push(ps[last].x(), ps[last].y(), ps[last].z());
                res.push(ps[0].x(), ps[0].y(), ps[0].z());
            }
            return res;
        }
        static offsetPointsToArray(ps, closed) {
            /*
             * since we draw with LINES we need to repeat each intermediate point.
             * drawing with LINE_STRIP would not require this but would not allow
             * to draw multiple polylines at once.
             */
            let res = new Array();
            const len = ps.length;
            const last = len - 1;
            for (let i = 0; i < len; i++) {
                const p = ps[i];
                res.push(p.x(), p.y());
                if (i !== 0 && i !== last) {
                    res.push(p.x(), p.y());
                }
            }
            if (closed) {
                res.push(ps[last].x(), ps[last].y());
                res.push(ps[0].x(), ps[0].y());
            }
            return res;
        }
        static closedExtrusion(vs, width) {
            const halfWidth = width / 2.0;
            const len = vs.length;
            const curs = new Array();
            const prevs = new Array();
            const nexts = new Array();
            const halfWidths = new Array();
            for (let i = 0; i < len; i++) {
                const start = vs[i];
                const ei = i === len - 1 ? 0 : i + 1;
                const end = vs[ei];
                const pi = i === 0 ? len - 1 : i - 1;
                const prev = vs[pi];
                const ni = ei === len - 1 ? 0 : ei + 1;
                const next = vs[ni];
                /* first triangle. */
                MeshGenerator.pushV3(start, curs);
                MeshGenerator.pushV3(start, curs);
                MeshGenerator.pushV3(end, curs);
                MeshGenerator.pushV3(prev, prevs);
                MeshGenerator.pushV3(prev, prevs);
                MeshGenerator.pushV3(start, prevs);
                MeshGenerator.pushV3(end, nexts);
                MeshGenerator.pushV3(end, nexts);
                MeshGenerator.pushV3(next, nexts);
                halfWidths.push(halfWidth);
                halfWidths.push(-halfWidth);
                halfWidths.push(halfWidth);
                /* second triangle. */
                MeshGenerator.pushV3(start, curs);
                MeshGenerator.pushV3(end, curs);
                MeshGenerator.pushV3(end, curs);
                MeshGenerator.pushV3(prev, prevs);
                MeshGenerator.pushV3(start, prevs);
                MeshGenerator.pushV3(start, prevs);
                MeshGenerator.pushV3(end, nexts);
                MeshGenerator.pushV3(next, nexts);
                MeshGenerator.pushV3(next, nexts);
                halfWidths.push(-halfWidth);
                halfWidths.push(halfWidth);
                halfWidths.push(-halfWidth);
            }
            return [curs, new Extrusion(prevs, nexts, halfWidths)];
        }
        static openedExtrusion(vs, width) {
            const halfWidth = width / 2.0;
            const len = vs.length;
            const curs = new Array();
            const prevs = new Array();
            const nexts = new Array();
            const halfWidths = new Array();
            const zero = new Vector3d(0, 0, 0);
            for (let i = 0; i < len - 1; i++) {
                const start = vs[i];
                const end = vs[i + 1];
                const prev = i === 0 ? zero : vs[i - 1];
                const next = i + 1 === len - 1 ? zero : vs[i + 2];
                /* first triangle. */
                MeshGenerator.pushV3(start, curs);
                MeshGenerator.pushV3(start, curs);
                MeshGenerator.pushV3(end, curs);
                MeshGenerator.pushV3(prev, prevs);
                MeshGenerator.pushV3(prev, prevs);
                MeshGenerator.pushV3(start, prevs);
                MeshGenerator.pushV3(end, nexts);
                MeshGenerator.pushV3(end, nexts);
                MeshGenerator.pushV3(next, nexts);
                halfWidths.push(halfWidth);
                halfWidths.push(-halfWidth);
                halfWidths.push(halfWidth);
                /* second triangle. */
                MeshGenerator.pushV3(start, curs);
                MeshGenerator.pushV3(end, curs);
                MeshGenerator.pushV3(end, curs);
                MeshGenerator.pushV3(prev, prevs);
                MeshGenerator.pushV3(start, prevs);
                MeshGenerator.pushV3(start, prevs);
                MeshGenerator.pushV3(end, nexts);
                MeshGenerator.pushV3(next, nexts);
                MeshGenerator.pushV3(next, nexts);
                halfWidths.push(-halfWidth);
                halfWidths.push(halfWidth);
                halfWidths.push(-halfWidth);
            }
            if (len > 2) {
                /* 2 last triangles. */
                /* first triangle. */
                const last = vs[len - 1];
                const penultimate = vs[len - 2];
                const prev = vs[len - 3];
                MeshGenerator.pushV3(penultimate, curs);
                MeshGenerator.pushV3(penultimate, curs);
                MeshGenerator.pushV3(last, curs);
                MeshGenerator.pushV3(prev, prevs);
                MeshGenerator.pushV3(prev, prevs);
                MeshGenerator.pushV3(penultimate, prevs);
                MeshGenerator.pushV3(last, nexts);
                MeshGenerator.pushV3(last, nexts);
                MeshGenerator.pushV3(zero, nexts);
                halfWidths.push(halfWidth);
                halfWidths.push(-halfWidth);
                halfWidths.push(-halfWidth);
                /* second triangle. */
                MeshGenerator.pushV3(penultimate, curs);
                MeshGenerator.pushV3(last, curs);
                MeshGenerator.pushV3(last, curs);
                MeshGenerator.pushV3(prev, prevs);
                MeshGenerator.pushV3(penultimate, prevs);
                MeshGenerator.pushV3(penultimate, prevs);
                MeshGenerator.pushV3(last, nexts);
                MeshGenerator.pushV3(zero, nexts);
                MeshGenerator.pushV3(zero, nexts);
                halfWidths.push(-halfWidth);
                halfWidths.push(-halfWidth);
                halfWidths.push(+halfWidth);
            }
            return [curs, new Extrusion(prevs, nexts, halfWidths)];
        }
        static pushV3(v, vs) {
            vs.push(v.x(), v.y(), v.z());
        }
        /** vs is array of vertices, n is number of component per vertex. */
        static colours(colour, vs, n) {
            const rgba = colour.rgba();
            const len = vs.length / n;
            return new Array(len).fill(rgba);
        }
        static reference(v, offsets) {
            const n = offsets.length / 2;
            let arr = new Array();
            for (let i = 0; i < n; i++) {
                arr.push(v.x(), v.y(), v.z());
            }
            return arr;
        }
    }

    /**
     * Static utility methods for manipulation WebGL2 constructs.
     */
    class WebGL2 {
        constructor() { }
        static createShader(gl, type, source) {
            const shader = gl.createShader(type);
            if (shader === null) {
                throw new Error("Invalid shader type: " + type);
            }
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (success) {
                return shader;
            }
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error("Could not compile shader:" + log);
        }
        static createProgram(gl, vertexShader, fragmentShader) {
            const program = gl.createProgram();
            if (program === null) {
                throw new Error("WebGL is not supported");
            }
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            const success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (success) {
                return program;
            }
            gl.deleteProgram(program);
            throw new Error("Invalid shader(s)");
        }
    }

    class Drawing {
        constructor(batches) {
            this._batches = batches;
        }
        batches() {
            return this._batches;
        }
    }
    class Animator {
        constructor(callback, fps) {
            this.callback = callback;
            this.fps = fps;
            this.now = Date.now();
            this.then = Date.now();
            this.interval = 1000 / this.fps;
            this.delta = -1;
            this.handle = -1;
        }
        start() {
            this.render();
        }
        stop() {
            cancelAnimationFrame(this.handle);
        }
        render() {
            this.handle = requestAnimationFrame(() => this.render());
            this.now = Date.now();
            this.delta = this.now - this.then;
            if (this.delta > this.interval) {
                this.then = this.now - (this.delta % this.interval);
                this.callback();
            }
        }
    }
    /**
     * A scene contains all the drawings and required attributed to render them.
     */
    class Scene {
        constructor(drawings, bgColour, sp, at) {
            this._drawings = drawings;
            this._bgColour = bgColour;
            this._sp = sp;
            this._at = at;
        }
        drawings() {
            return this._drawings;
        }
        bgColour() {
            return this._bgColour;
        }
        sp() {
            return this._sp;
        }
        at() {
            return this._at;
        }
    }
    /**
     * WebGL renderer.
     */
    class Renderer {
        constructor(gl, miterLimit) {
            this.gl = gl;
            this.miterLimit = miterLimit;
            this.aGeoPos = new Attribute("a_geo_pos", 3, this.gl.FLOAT);
            this.aPrevGeoPos = new Attribute("a_prev_geo_pos", 3, this.gl.FLOAT);
            this.aNextGeoPos = new Attribute("a_next_geo_pos", 3, this.gl.FLOAT);
            this.aHalfWidth = new Attribute("a_half_width", 1, this.gl.FLOAT);
            this.aOffset = new Attribute("a_offset", 2, this.gl.FLOAT);
            this.aRgba = new Attribute("a_rgba", 1, this.gl.UNSIGNED_INT);
            const vertexShader = WebGL2.createShader(this.gl, this.gl.VERTEX_SHADER, Renderer.VERTEX_SHADER);
            const fragmentShader = WebGL2.createShader(this.gl, this.gl.FRAGMENT_SHADER, Renderer.FRAGMENT_SHADER);
            this.program = WebGL2.createProgram(this.gl, vertexShader, fragmentShader);
        }
        createDrawing(meshes) {
            const len = meshes.length;
            if (len === 0) {
                return new Drawing([]);
            }
            const attributes = [
                this.aGeoPos,
                this.aPrevGeoPos,
                this.aNextGeoPos,
                this.aHalfWidth,
                this.aOffset,
                this.aRgba
            ];
            let batches = new Array();
            let mesh = meshes[0];
            const state = new State(mesh, this.gl);
            let batch = this.createBatch(state, attributes);
            batches.push(batch);
            this.fillBatch(batch, state, mesh);
            for (let i = 1; i < len; i++) {
                mesh = meshes[i];
                // new batch if different drawing mode or any array changes from empty/non empty
                const newBatch = state.update(mesh, this.gl);
                if (newBatch) {
                    batch = this.createBatch(state, attributes);
                    batches.push(batch);
                }
                this.fillBatch(batch, state, mesh);
            }
            return new Drawing(batches.map(b => b.createGlArrays(this.gl, this.program)));
        }
        deleteDrawing(drawing) {
            this.gl.useProgram(this.program);
            drawing.batches().forEach(b => b.delete(this.gl));
        }
        draw(scene) {
            const bgColour = scene.bgColour();
            this.gl.clearColor(bgColour.red(), bgColour.green(), bgColour.blue(), bgColour.alpha());
            this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            const sp = scene.sp();
            const geoCentre = [sp.centre().x(), sp.centre().y(), sp.centre().z()];
            const geoToSys = sp.directRotationGl();
            const canvasToClipspace = CoordinateSystems.canvasToClipspace(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
            const drawings = scene.drawings();
            const earthRadiusMetres = sp.earthRadius();
            const gl = this.gl;
            const program = this.program;
            gl.useProgram(program);
            /* uniforms. */
            const earthRadiusUniformLocation = gl.getUniformLocation(program, "u_earth_radius");
            gl.uniform1f(earthRadiusUniformLocation, earthRadiusMetres);
            const miterLimitUniformLocation = gl.getUniformLocation(program, "u_miter_limit");
            gl.uniform1f(miterLimitUniformLocation, this.miterLimit);
            const geoCentreUniformLocation = gl.getUniformLocation(program, "u_geo_centre");
            gl.uniform3fv(geoCentreUniformLocation, geoCentre);
            const geoToSysUniformLocation = gl.getUniformLocation(program, "u_geo_to_system");
            gl.uniformMatrix3fv(geoToSysUniformLocation, false, geoToSys);
            const stereoToCanvasLocation = gl.getUniformLocation(program, "u_stereo_to_canvas");
            gl.uniformMatrix3fv(stereoToCanvasLocation, false, scene.at().glMatrix());
            const canvasToClipspaceLocation = gl.getUniformLocation(program, "u_canvas_to_clipspace");
            gl.uniformMatrix3fv(canvasToClipspaceLocation, false, canvasToClipspace);
            for (let i = 0; i < drawings.length; i++) {
                const bs = drawings[i].batches();
                for (let j = 0; j < bs.length; j++) {
                    bs[j].draw(this.gl);
                }
            }
        }
        createBatch(state, attributes) {
            /* count is driven by geos if not empty, offsets otherwise. */
            const attCount = state.emptyGeos ? this.aOffset : this.aGeoPos;
            return new Batch(state.drawMode, attributes, attCount);
        }
        fillBatch(batch, state, mesh) {
            if (!state.emptyGeos) {
                batch.addToArray(this.aGeoPos, mesh.geos());
            }
            const extrusion = mesh.extrusion();
            if (extrusion !== undefined) {
                batch.addToArray(this.aPrevGeoPos, extrusion.prevGeos());
                batch.addToArray(this.aNextGeoPos, extrusion.nextGeos());
                batch.addToArray(this.aHalfWidth, extrusion.halfWidths());
            }
            if (!state.emptyOffsets) {
                batch.addToArray(this.aOffset, mesh.offsets());
            }
            batch.addToArray(this.aRgba, mesh.colours());
        }
    }
    Renderer.VERTEX_SHADER = `#version 300 es

// rgba uint to vec4
vec4 rgba_to_colour(uint rgba) {
    float r = float((rgba >> 24u) & 255u) / 255.0;
    float g = float((rgba >> 16u) & 255u) / 255.0;
    float b = float((rgba >> 8u) & 255u) / 255.0;
    float a = float(rgba & 255u) / 100.0;
    return vec4(r, g, b, a);
}

// normal to given direction
vec2 normal(vec2 d) {
    return vec2(-d.y, d.x);
}

// direction from a to b
vec2 direction(vec2 a, vec2 b) {
    return normalize(a - b);
}

// extrudes given pos by given signed half width towards the miter at position.
vec2 extrude_using_adjs(vec2 pos, vec2 prev, vec2 next, float half_width, float miter_limit) {
    // line from prev to pt.
    vec2 line_to = direction(pos, prev);
    vec2 n = normal(line_to);
    // line from pt to next.
    vec2 line_from = direction(next, pos);
    // miter.
    vec2 tangent = normalize(line_to + line_from);
    vec2 miter = normal(tangent);
    float miter_length = half_width / dot(miter, n);
    vec2 res;
    if (miter_length / half_width > miter_limit) {
        res = pos + n * half_width;
    } else {
        res = pos + miter * miter_length;
    }
    return res;
}

// extrudes given pos by given signed half width towards the normal at position.
vec2 extrude_using_adj(vec2 pos, vec2 adj, float half_width) {
    return pos + (normal(direction(adj, pos)) * half_width);
}

// geocentric to stereographic conversion
vec2 geocentric_to_stereographic(vec3 geo, float er, vec3 centre, mat3 rotation) {
    // n-vector to system
    vec3 translated = (geo - centre) * er;
    vec3 system = translated * rotation;
    // system to stereo
    float k = (2.0 * er) / (2.0 * er + system.z);
    return (system * k).xy;
}

// geocentric to canvas
vec2 geocentric_to_canvas(vec3 geo, float er, vec3 centre, mat3 rotation, mat3 stereo_to_canvas, vec2 offset) {
    // geocentric to stereographic
    vec2 stereo = geocentric_to_stereographic(geo, er, centre, rotation);
    // stereographic to canvas
    vec3 c_pos = (vec3(stereo, 1) * stereo_to_canvas) + (vec3(offset, 0));
    return c_pos.xy;
}

// -------------------------- //
//  stereographic projection  //
// -------------------------- //

// earth radius (metres)
uniform float u_earth_radius;

// miter limit
uniform float u_miter_limit;

// centre of the stereographic projection
uniform vec3 u_geo_centre;

// geocentric to system tranformation matrix (row major)
uniform mat3 u_geo_to_system;

// ----------------------- //
//   stereo to clipspace   //
// ----------------------- //

// 3x3 affine transform matrix (row major): stereo -> canvas pixels
uniform mat3 u_stereo_to_canvas;

// 3x3 projection matrix (row major): canvas pixels to clipspace
uniform mat3 u_canvas_to_clipspace;

// geocentric position, (0, 0, 0) if none.
in vec3 a_geo_pos;

// previous geocentric position or (0, 0, 0) if none.
in vec3 a_prev_geo_pos;

// next geocentric position or (0, 0, 0) if none.
in vec3 a_next_geo_pos;

// half width for extrusion, when 0 no extrusion is to be done.
// if different from 0 at least one of a_prev_geo_pos or a_next_geo_pos
// is not (0, 0, 0).
in float a_half_width;

// offset in pixels, (0, 0) if none.
in vec2 a_offset;

// colour (rgba)
in uint a_rgba;

// colour for fragment shader
out vec4 v_colour;

void main() {
    vec2 c_pos;
    if (a_half_width == 0.0) {
        // geocentric to canvas
        c_pos = geocentric_to_canvas(a_geo_pos, u_earth_radius, u_geo_centre,
                                     u_geo_to_system, u_stereo_to_canvas, a_offset);
    } else {
        // a_geo_pos: geocentric to canvas
        vec2 c_c_pos =
            geocentric_to_canvas(a_geo_pos, u_earth_radius, u_geo_centre,
                                 u_geo_to_system, u_stereo_to_canvas, a_offset);

        if (length(a_prev_geo_pos) == 0.0) {
            // next: geocentric to canvas
            vec2 c_n_pos =
                geocentric_to_canvas(a_next_geo_pos, u_earth_radius, u_geo_centre,
                                     u_geo_to_system, u_stereo_to_canvas, a_offset);
            // extrude c_c_pos by signed half width
            c_pos = extrude_using_adj(c_c_pos, c_n_pos, a_half_width);
        } else if (length(a_next_geo_pos) == 0.0) {
            // prev: geocentric to canvas
            vec2 c_p_pos =
                geocentric_to_canvas(a_prev_geo_pos, u_earth_radius, u_geo_centre,
                                     u_geo_to_system, u_stereo_to_canvas, a_offset);
            // extrude c_c_pos by signed half width
            c_pos = extrude_using_adj(c_c_pos, c_p_pos, a_half_width);
        } else {
          // prev: geocentric to canvas
          vec2 c_p_pos =
              geocentric_to_canvas(a_prev_geo_pos, u_earth_radius, u_geo_centre,
                                   u_geo_to_system, u_stereo_to_canvas, a_offset);
          // next: geocentric to canvas
          vec2 c_n_pos =
              geocentric_to_canvas(a_next_geo_pos, u_earth_radius, u_geo_centre,
                                   u_geo_to_system, u_stereo_to_canvas, a_offset);
          c_pos = extrude_using_adjs(c_c_pos, c_p_pos, c_n_pos, a_half_width, u_miter_limit);
        }
    }

    // canvas pixels to clipspace
    // u_projection is row major so v * m
    gl_Position = vec4((vec3(c_pos, 1) * u_canvas_to_clipspace).xy, 0, 1);

    v_colour = rgba_to_colour(a_rgba);
}
`;
    Renderer.FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec4 v_colour;

out vec4 colour;

void main() {
  colour = v_colour;
}
`;
    /**
     * Characteristics of a WebGL attibute.
     */
    class Attribute {
        constructor(name, size, type) {
            this._name = name;
            this._size = size;
            this._type = type;
        }
        /**
         * Name of the attribute.
         */
        name() {
            return this._name;
        }
        /**
         * Number of components per vertex attribute.
         */
        size() {
            return this._size;
        }
        /**
         * Data type of each component in the array.
         */
        type() {
            return this._type;
        }
    }
    /**
     * VAO, VBOs and constant attributes to be rendered by one draw call.
     */
    class GlArrays {
        constructor(drawMode, vao, buffers, constants, count) {
            this.drawMode = drawMode;
            this.vao = vao;
            this.buffers = buffers;
            this.constants = constants;
            this.count = count;
        }
        draw(gl) {
            gl.bindVertexArray(this.vao);
            /*
             * disable the vertex array, the attribute will have
             * the default value which the shader can handle.
             */
            this.constants.forEach(c => gl.disableVertexAttribArray(c));
            gl.drawArrays(this.drawMode, 0, this.count);
        }
        delete(gl) {
            this.buffers.forEach(b => gl.deleteBuffer(b));
            gl.deleteVertexArray(this.vao);
        }
    }
    /**
     * Batch of meshes to be rendered with the same draw mode and enables VBOs.
     */
    class Batch {
        constructor(drawMode, attributes, attributeCount) {
            this.drawMode = drawMode;
            this.attributes = attributes;
            this.attributeCount = attributeCount;
            this.arrays = new Map();
        }
        addToArray(attribute, data) {
            let arr = this.arrays.get(attribute.name());
            if (arr === undefined) {
                arr = new Array();
                this.arrays.set(attribute.name(), arr);
            }
            const len = data.length;
            for (let i = 0; i < len; i++) {
                arr.push(data[i]);
            }
        }
        createGlArrays(gl, program) {
            gl.useProgram(program);
            const vao = gl.createVertexArray();
            if (vao === null) {
                throw new Error("Could not create vertex array");
            }
            gl.bindVertexArray(vao);
            let buffers = new Array();
            let constants = new Array();
            for (const a of this.attributes) {
                const attName = a.name();
                const attLocation = gl.getAttribLocation(program, attName);
                const arr = this.arrays.get(attName);
                if (arr === undefined) {
                    gl.disableVertexAttribArray(attLocation);
                    constants.push(attLocation);
                }
                else {
                    gl.enableVertexAttribArray(attLocation);
                    const attBuff = gl.createBuffer();
                    if (attBuff === null) {
                        throw new Error("Could not create buffer for attribute: " + attName);
                    }
                    buffers.push(attBuff);
                    gl.bindBuffer(gl.ARRAY_BUFFER, attBuff);
                    /* 0 = move forward size * sizeof(type) each iteration to get the next position */
                    const stride = 0;
                    /* start at the beginning of the buffer */
                    const offset = 0;
                    if (a.type() == gl.UNSIGNED_INT) {
                        gl.vertexAttribIPointer(attLocation, a.size(), a.type(), stride, offset);
                        gl.bufferData(gl.ARRAY_BUFFER, new Uint32Array(arr), gl.STATIC_DRAW, 0);
                    }
                    else {
                        gl.vertexAttribPointer(attLocation, a.size(), a.type(), false, stride, offset);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW, 0);
                    }
                }
            }
            gl.bindVertexArray(null);
            const refArray = this.arrays.get(this.attributeCount.name());
            if (refArray === undefined) {
                throw new Error("No array for attribute: " + this.attributeCount.name());
            }
            const count = refArray.length / this.attributeCount.size();
            return new GlArrays(this.drawMode, vao, buffers, constants, count);
        }
    }
    /**
     * Capture the state of the drawing to create batches.
     */
    class State {
        constructor(m, gl) {
            this.drawMode = State.drawMode(m, gl);
            this.emptyGeos = State.isEmpty(m.geos());
            this.emptyExtrusion = m.extrusion() === undefined;
            this.emptyOffsets = State.isEmpty(m.offsets());
        }
        update(m, gl) {
            const drawMode = State.drawMode(m, gl);
            const emptyGeos = State.isEmpty(m.geos());
            const emptyExtrusion = m.extrusion() === undefined;
            const emptyOffsets = State.isEmpty(m.offsets());
            const changed = this.drawMode !== drawMode
                || this.emptyGeos !== emptyGeos
                || this.emptyExtrusion !== emptyExtrusion
                || this.emptyOffsets !== emptyOffsets;
            if (changed) {
                this.drawMode = drawMode;
                this.emptyGeos = emptyGeos;
                this.emptyExtrusion = emptyExtrusion;
                this.emptyOffsets = emptyOffsets;
            }
            return changed;
        }
        static drawMode(m, gl) {
            return m.drawMode() == DrawMode.LINES ? gl.LINES : gl.TRIANGLES;
        }
        static isEmpty(a) {
            return a.length === 0;
        }
    }

    /**
     * Ad-hoc stack to order element uniquely identified by name
     * according to their z-index. Within a layer (i.e. a z-index)
     * elements are ordered as inserted.
     */
    class Stack {
        constructor() {
            this.stackOrder = new Map();
            this.elements = new Map();
        }
        get(name) {
            const zi = this.stackOrder.get(name);
            if (zi === undefined) {
                return undefined;
            }
            const layer = this.elements.get(zi);
            if (layer === undefined) {
                throw new Error("Unknown z-index: " + zi);
            }
            const e = layer.get(name);
            if (e === undefined) {
                throw new Error("Unknown name: " + name);
            }
            return e;
        }
        all() {
            const sorted = Array.from(this.elements.entries()).sort();
            const len = sorted.length;
            let res = new Array();
            for (let i = 0; i < len; i++) {
                const ds = Array.from(sorted[i][1].values());
                const dsl = ds.length;
                for (let i = 0; i < dsl; i++) {
                    res.push(ds[i]);
                }
            }
            return res;
        }
        insert(name, zi, e) {
            const czi = this.stackOrder.get(name);
            if (czi === undefined) {
                /* new element */
                this.stackOrder.set(name, zi);
            }
            else if (czi !== zi) {
                /* change of stack order */
                this.delete(name);
                this.stackOrder.set(name, zi);
            }
            this.add(name, zi, e);
        }
        delete(name) {
            const zi = this.stackOrder.get(name);
            if (zi === undefined) {
                return;
            }
            const layer = this.elements.get(zi);
            if (layer === undefined) {
                throw new Error("Unknown z-index: " + zi);
            }
            this.stackOrder.delete(name);
            layer.delete(name);
            if (layer.size === 0) {
                this.elements.delete(zi);
            }
        }
        add(name, zi, e) {
            let layer = this.elements.get(zi);
            if (layer === undefined) {
                /* new layer */
                layer = new Map();
                this.elements.set(zi, layer);
            }
            layer.set(name, e);
        }
    }

    class Graphic {
        constructor(name, zIndex, shapes) {
            this._name = name;
            this._zIndex = zIndex;
            this._shapes = shapes;
        }
        name() {
            return this._name;
        }
        /**
         * Return the stack order of this graphic. A graphic with greater stack order
         * is always in front of a graphic with a lower stack order.
         */
        zIndex() {
            return this._zIndex;
        }
        shapes() {
            return this._shapes;
        }
    }
    /**
     * Initial definition of the world to be rendered.
     */
    class WorldDefinition {
        constructor(centre, range, rotation, bgColour) {
            this._centre = centre;
            this._range = range;
            this._rotation = rotation;
            this._bgColour = bgColour;
        }
        centre() {
            return this._centre;
        }
        range() {
            return this._range;
        }
        rotation() {
            return this._rotation;
        }
        bgColour() {
            return this._bgColour;
        }
    }
    class World {
        constructor(gl, def, options = new RenderingOptions(60, 100, 5)) {
            this._centre = def.centre();
            this._range = def.range();
            this._rotation = def.rotation();
            this.bgColour = def.bgColour();
            this.options = options;
            this.cd = new CanvasDimension(gl.canvas.clientWidth, gl.canvas.clientHeight);
            this.sp = CoordinateSystems.computeStereographicProjection(this._centre, World.EARTH_RADIUS);
            this.at = CoordinateSystems.computeCanvasAffineTransform(this._centre, this._range, this._rotation, this.cd, this.sp);
            this.stack = new Stack();
            this.renderer = new Renderer(gl, options.miterLimit());
            this.animator = new Animator(() => {
                const scene = new Scene(this.stack.all(), this.bgColour, this.sp, this.at);
                this.renderer.draw(scene);
            }, options.fps());
        }
        startRendering() {
            this.animator.start();
        }
        stoptRendering() {
            this.animator.stop();
        }
        setBackground(colour) {
            this.bgColour = colour;
        }
        insert(graphic) {
            const name = graphic.name();
            const zi = graphic.zIndex();
            const shapes = graphic.shapes();
            let meshes = new Array();
            for (let i = 0; i < shapes.length; i++) {
                meshes = meshes.concat(MeshGenerator.mesh(shapes[i], World.EARTH_RADIUS, this.options));
            }
            let drawing = this.stack.get(name);
            if (drawing !== undefined) {
                this.renderer.deleteDrawing(drawing);
            }
            drawing = this.renderer.createDrawing(meshes);
            this.stack.insert(name, zi, drawing);
        }
        delete(graphicName) {
            let drawing = this.stack.get(name);
            if (drawing !== undefined) {
                this.stack.delete(graphicName);
                this.renderer.deleteDrawing(drawing);
            }
        }
        pan(deltaX, deltaY) {
            // pixels to stereographic
            const cd = CoordinateSystems.canvasOffsetToStereographic(new Vector2d(deltaX, deltaY), this.at);
            // new canvas centre in stereographic
            const newCentreStereo = Math2d.add(this.at.centre(), cd);
            // stereographic to geocentric
            const newCentreGeo = CoordinateSystems.stereographicToGeocentric(newCentreStereo, this.sp);
            // geocentric to latitude/longitude
            this._centre = CoordinateSystems.geocentricToLatLong(newCentreGeo);
            // recompute stereographic projection using new canvas centre
            this.sp = CoordinateSystems.computeStereographicProjection(this._centre, World.EARTH_RADIUS);
            // recompute affine transform
            this.at = CoordinateSystems.computeCanvasAffineTransform(this._centre, this._range, this._rotation, this.cd, this.sp);
        }
        setRange(range) {
            if (range.metres() <= 0) {
                return;
            }
            this._range = range;
            // recompute affine transform
            this.at = CoordinateSystems.computeCanvasAffineTransform(this._centre, this._range, this._rotation, this.cd, this.sp);
        }
        range() {
            return this._range;
        }
        centre() {
            return this._centre;
        }
    }
    // earth radius in metres: WGS-84 ellipsoid, mean radius of semi-axis (R1). */
    World.EARTH_RADIUS = Length.ofMetres(6371008.7714);

    class DemoApp {
        constructor(gl) {
            const linkoping = LatLong.ofDegrees(58.4108, 15.6214);
            const def = new WorldDefinition(linkoping, Length.ofKilometres(2000), Angle.ofDegrees(0), Colour.GAINSBORO);
            this.world = new World(gl, def);
            this.l = (_c, _r) => { };
        }
        setOnChange(l) {
            this.l = l;
            this.fireEvent();
        }
        run() {
            const ystad = LatLong.ofDegrees(55.4295, 13.82);
            const malmo = LatLong.ofDegrees(55.6050, 13.0038);
            const lund = LatLong.ofDegrees(55.7047, 13.1910);
            const helsingborg = LatLong.ofDegrees(56.0465, 12.6945);
            const kristianstad = LatLong.ofDegrees(56.0294, 14.1567);
            const jonkoping = LatLong.ofDegrees(57.7826, 14.1618);
            const linkoping = LatLong.ofDegrees(58.4108, 15.6214);
            const norrkoping = LatLong.ofDegrees(58.5877, 16.1924);
            const goteborg = LatLong.ofDegrees(57.7089, 11.9746);
            const stockholm = LatLong.ofDegrees(59.3293, 18.0686);
            // Gotland
            const visby = LatLong.ofDegrees(57.6349, 18.2948);
            const irevik = LatLong.ofDegrees(57.8371, 18.5866);
            const larbro = LatLong.ofDegrees(57.7844, 18.7890);
            const blase = LatLong.ofDegrees(57.8945, 18.8440);
            const farosund = LatLong.ofDegrees(57.8613, 19.0540);
            const slite = LatLong.ofDegrees(57.7182, 18.7923);
            const gothem = LatLong.ofDegrees(57.5790, 18.7298);
            const ljugarn = LatLong.ofDegrees(57.3299, 18.7084);
            const nar = LatLong.ofDegrees(57.2573, 18.6351);
            const vamlingbo = LatLong.ofDegrees(56.9691, 18.2319);
            const sundre = LatLong.ofDegrees(56.9364, 18.1834);
            const sanda = LatLong.ofDegrees(57.4295, 18.2223);
            const p = new GeoPolygon([ystad, malmo, lund, helsingborg, kristianstad], Paint.stroke(new Stroke(Colour.LIMEGREEN, 5)));
            const paint = Paint.fill(Colour.CORAL);
            const c2 = new GeoCircle(goteborg, Length.ofKilometres(10), paint);
            const c3 = new GeoCircle(jonkoping, Length.ofKilometres(5), paint);
            const c4 = new GeoCircle(norrkoping, Length.ofKilometres(5), paint);
            const c5 = new GeoCircle(linkoping, Length.ofKilometres(5), paint);
            const l1 = new GeoPolyline([jonkoping, linkoping, norrkoping, stockholm, goteborg], new Stroke(Colour.DODGERBLUE, 1));
            const l2 = new GeoPolyline([visby, irevik, larbro, blase,
                farosund, slite, gothem, ljugarn,
                nar, vamlingbo, sundre, sanda, visby], new Stroke(Colour.DODGERBLUE, 5));
            const rp = new GeoRelativePolygon(linkoping, [new Offset(50, 50), new Offset(50, 200), new Offset(70, 160),
                new Offset(90, 200), new Offset(110, 50)], Paint.complete(new Stroke(Colour.SLATEGRAY, 5), Colour.SNOW));
            const rl = new GeoRelativePolyline(norrkoping, [new Offset(50, 50), new Offset(50, 100), new Offset(75, 150)], new Stroke(Colour.NAVY, 3));
            this.world.insert(new Graphic("sak", 0, [p, c2, c3, l1, c4, c5, l2]));
            this.world.insert(new Graphic("andra", 0, [rp, rl]));
            DemoApp.parseCoastlines(this.world);
            this.simulateTrack(new Track(stockholm, Angle.ofDegrees(135), Speed.ofMetresPerSecond(555.5556)));
            this.world.startRendering();
        }
        handleKeyboardEvent(evt) {
            const delta = DemoApp.DELTA.get(evt.key);
            const factor = DemoApp.FACTOR.get(evt.key);
            if (delta !== undefined) {
                this.world.pan(delta[0], delta[1]);
            }
            else if (factor !== undefined) {
                this.world.setRange(this.world.range().scale(factor));
            }
            else {
                return;
            }
            this.fireEvent();
        }
        fireEvent() {
            const c = this.world.centre();
            const lat = c.latitude().degrees();
            const lon = c.longitude().degrees();
            const ll = Math.abs(lat).toFixed(4)
                + (lat < 0 ? 'S' : 'N')
                + ' ' + Math.abs(lon).toFixed(4)
                + (lon < 0 ? 'W' : 'E');
            const r = (this.world.range().kilometres()).toFixed(0) + " km";
            this.l(ll, r);
        }
        simulateTrack(track) {
            var elapsedSecs = 0;
            const h = () => {
                elapsedSecs = elapsedSecs + 1;
                const p = Kinematics.position(track, Duration.ofSeconds(elapsedSecs), World.EARTH_RADIUS);
                const offset = new Offset(0, 0);
                const radius = 16;
                const paint = Paint.complete(new Stroke(Colour.DEEPPINK, 12), Colour.LIGHTPINK);
                const c = [new GeoRelativeCircle(p, offset, radius, paint)];
                this.world.insert(new Graphic("Track", 1, c));
                setTimeout(h, 1000);
            };
            setTimeout(h, 1000);
        }
        static parseCoastlines(world) {
            DemoApp.load("./coastline.json", (data) => {
                const length = data.features.length;
                const shapes = new Array();
                for (let i = 0; i < length; i++) {
                    const feature = data.features[i];
                    if (feature.properties.featurecla == "Coastline") {
                        const coordinates = feature.geometry.coordinates;
                        const nb_coordinates = coordinates.length;
                        const positions = new Array();
                        for (let j = 0; j < nb_coordinates; j++) {
                            const coord = coordinates[j];
                            // Be careful : longitude first, then latitude in geoJSON files
                            const point = LatLong.ofDegrees(coord[1], coord[0]);
                            positions.push(point);
                        }
                        shapes.push(new GeoPolyline(positions, new Stroke(Colour.DIMGRAY, 1)));
                    }
                }
                world.insert(new Graphic("coastlines", -1, shapes));
            }, (_) => {
                /* damn. */
            });
        }
    }
    DemoApp.DELTA = new Map([
        ["ArrowUp", [0, -10]],
        ["ArrowDown", [0, 10]],
        ["ArrowLeft", [-10, 0]],
        ["ArrowRight", [10, 0]]
    ]);
    DemoApp.FACTOR = new Map([
        ["+", 0.95],
        ["-", 1.05],
    ]);
    DemoApp.load = (url, success, error) => {
        const xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                // done
                const status = xhr.status;
                if (status == 200) {
                    const data = JSON.parse(xhr.responseText);
                    success(data);
                }
                else {
                    error(status);
                }
            }
        };
        xhr.send();
    };

    exports.DemoApp = DemoApp;

    return exports;

}({}));

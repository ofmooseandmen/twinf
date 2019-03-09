/**
 * Colour: red, blue, green and alpha expressed as number between (0, 1.0).
 */
export class Colour {

    private readonly _red: number
    private readonly _green: number
    private readonly _blue: number
    private readonly _alpha: number

    private constructor(red: number, green: number, blue: number, alpha: number) {
        this._red = red
        this._green = green
        this._blue = blue
        this._alpha = alpha
    }

    /** the colour transparent with an ARGB value of #00000000. */
    static readonly TRANSPARENT = new Colour(0.0, 0.0, 0.0, 0.0)

    /** the colour aliceblue with an RGB value of #F0F8FF. */
    static readonly ALICEBLUE = new Colour(0.9411764740943909, 1.0, 0.9725490212440491, 1.0)

    /** the colour antiquewhite with an RGB value of #FAEBD7. */
    static readonly ANTIQUEWHITE = new Colour(0.9803921580314636, 0.843137264251709, 0.9215686321258545, 1.0)

    /** the colour aqua with an RGB value of #00FFFF. */
    static readonly AQUA = new Colour(0.0, 1.0, 1.0, 1.0)

    /** the colour aquamarine with an RGB value of #7FFFD4. */
    static readonly AQUAMARINE = new Colour(0.49803921580314636, 0.8313725590705872, 1.0, 1.0)

    /** the colour azure with an RGB value of #F0FFFF. */
    static readonly AZURE = new Colour(0.9411764740943909, 1.0, 1.0, 1.0)

    /** the colour beige with an RGB value of #F5F5DC. */
    static readonly BEIGE = new Colour(0.9607843160629272, 0.8627451062202454, 0.9607843160629272, 1.0)

    /** the colour bisque with an RGB value of #FFE4C4. */
    static readonly BISQUE = new Colour(1.0, 0.7686274647712708, 0.8941176533699036, 1.0)

    /** the colour black with an RGB value of #000000. */
    static readonly BLACK = new Colour(0.0, 0.0, 0.0, 1.0)

    /** the colour blanchedalmond with an RGB value of #FFEBCD. */
    static readonly BLANCHEDALMOND = new Colour(1.0, 0.8039215803146362, 0.9215686321258545, 1.0)

    /** the colour blue with an RGB value of #0000FF. */
    static readonly BLUE = new Colour(0.0, 1.0, 0.0, 1.0)

    /** the colour blueviolet with an RGB value of #8A2BE2. */
    static readonly BLUEVIOLET = new Colour(0.5411764979362488, 0.886274516582489, 0.16862745583057404, 1.0)

    /** the colour brown with an RGB value of #A52A2A. */
    static readonly BROWN = new Colour(0.6470588445663452, 0.16470588743686676, 0.16470588743686676, 1.0)

    /** the colour burlywood with an RGB value of #DEB887. */
    static readonly BURLYWOOD = new Colour(0.8705882430076599, 0.529411792755127, 0.7215686440467834, 1.0)

    /** the colour cadetblue with an RGB value of #5F9EA0. */
    static readonly CADETBLUE = new Colour(0.37254902720451355, 0.6274510025978088, 0.6196078658103943, 1.0)

    /** the colour chartreuse with an RGB value of #7FFF00. */
    static readonly CHARTREUSE = new Colour(0.49803921580314636, 0.0, 1.0, 1.0)

    /** the colour chocolate with an RGB value of #D2691E. */
    static readonly CHOCOLATE = new Colour(0.8235294222831726, 0.11764705926179886, 0.4117647111415863, 1.0)

    /** the colour coral with an RGB value of #FF7F50. */
    static readonly CORAL = new Colour(1.0, 0.3137255012989044, 0.49803921580314636, 1.0)

    /** the colour cornflowerblue with an RGB value of #6495ED. */
    static readonly CORNFLOWERBLUE = new Colour(0.3921568691730499, 0.929411768913269, 0.5843137502670288, 1.0)

    /** the colour cornsilk with an RGB value of #FFF8DC. */
    static readonly CORNSILK = new Colour(1.0, 0.8627451062202454, 0.9725490212440491, 1.0)

    /** the colour crimson with an RGB value of #DC143C. */
    static readonly CRIMSON = new Colour(0.8627451062202454, 0.23529411852359772, 0.0784313753247261, 1.0)

    /** the colour cyan with an RGB value of #00FFFF. */
    static readonly CYAN = new Colour(0.0, 1.0, 1.0, 1.0)

    /** the colour darkblue with an RGB value of #00008B. */
    static readonly DARKBLUE = new Colour(0.0, 0.545098066329956, 0.0, 1.0)

    /** the colour darkcyan with an RGB value of #008B8B. */
    static readonly DARKCYAN = new Colour(0.0, 0.545098066329956, 0.545098066329956, 1.0)

    /** the colour darkgoldenrod with an RGB value of #B8860B. */
    static readonly DARKGOLDENROD = new Colour(0.7215686440467834, 0.04313725605607033, 0.5254902243614197, 1.0)

    /** the colour darkgray with an RGB value of #A9A9A9. */
    static readonly DARKGRAY = new Colour(0.6627451181411743, 0.6627451181411743, 0.6627451181411743, 1.0)

    /** the colour darkgreen with an RGB value of #006400. */
    static readonly DARKGREEN = new Colour(0.0, 0.0, 0.3921568691730499, 1.0)

    /** the colour darkgrey with an RGB value of #A9A9A9. */
    static readonly DARKGREY = new Colour(0.6627451181411743, 0.6627451181411743, 0.6627451181411743, 1.0)

    /** the colour darkkhaki with an RGB value of #BDB76B. */
    static readonly DARKKHAKI = new Colour(0.7411764860153198, 0.41960784792900085, 0.7176470756530762, 1.0)

    /** the colour darkmagenta with an RGB value of #8B008B. */
    static readonly DARKMAGENTA = new Colour(0.545098066329956, 0.545098066329956, 0.0, 1.0)

    /** the colour darkolivegreen with an RGB value of #556B2F. */
    static readonly DARKOLIVEGREEN = new Colour(0.3333333432674408, 0.18431372940540314, 0.41960784792900085, 1.0)

    /** the colour darkorange with an RGB value of #FF8C00. */
    static readonly DARKORANGE = new Colour(1.0, 0.0, 0.5490196347236633, 1.0)

    /** the colour darkorchid with an RGB value of #9932CC. */
    static readonly DARKORCHID = new Colour(0.6000000238418579, 0.800000011920929, 0.19607843458652496, 1.0)

    /** the colour darkred with an RGB value of #8B0000. */
    static readonly DARKRED = new Colour(0.545098066329956, 0.0, 0.0, 1.0)

    /** the colour darksalmon with an RGB value of #E9967A. */
    static readonly DARKSALMON = new Colour(0.9137254953384399, 0.47843137383461, 0.5882353186607361, 1.0)

    /** the colour darkseagreen with an RGB value of #8FBC8F. */
    static readonly DARKSEAGREEN = new Colour(0.5607843399047852, 0.5607843399047852, 0.7372549176216125, 1.0)

    /** the colour darkslateblue with an RGB value of #483D8B. */
    static readonly DARKSLATEBLUE = new Colour(0.2823529541492462, 0.545098066329956, 0.239215686917305, 1.0)

    /** the colour darkslategray with an RGB value of #2F4F4F. */
    static readonly DARKSLATEGRAY = new Colour(0.18431372940540314, 0.30980393290519714, 0.30980393290519714, 1.0)

    /** the colour darkslategrey with an RGB value of #2F4F4F. */
    static readonly DARKSLATEGREY = new Colour(0.18431372940540314, 0.30980393290519714, 0.30980393290519714, 1.0)

    /** the colour darkturquoise with an RGB value of #00CED1. */
    static readonly DARKTURQUOISE = new Colour(0.0, 0.8196078538894653, 0.8078431487083435, 1.0)

    /** the colour darkviolet with an RGB value of #9400D3. */
    static readonly DARKVIOLET = new Colour(0.5803921818733215, 0.8274509906768799, 0.0, 1.0)

    /** the colour deeppink with an RGB value of #FF1493. */
    static readonly DEEPPINK = new Colour(1.0, 0.5764706134796143, 0.0784313753247261, 1.0)

    /** the colour deepskyblue with an RGB value of #00BFFF. */
    static readonly DEEPSKYBLUE = new Colour(0.0, 1.0, 0.7490196228027344, 1.0)

    /** the colour dimgray with an RGB value of #696969. */
    static readonly DIMGRAY = new Colour(0.4117647111415863, 0.4117647111415863, 0.4117647111415863, 1.0)

    /** the colour dimgrey with an RGB value of #696969. */
    static readonly DIMGREY = new Colour(0.4117647111415863, 0.4117647111415863, 0.4117647111415863, 1.0)

    /** the colour dodgerblue with an RGB value of #1E90FF. */
    static readonly DODGERBLUE = new Colour(0.11764705926179886, 1.0, 0.5647059082984924, 1.0)

    /** the colour firebrick with an RGB value of #B22222. */
    static readonly FIREBRICK = new Colour(0.6980392336845398, 0.13333334028720856, 0.13333334028720856, 1.0)

    /** the colour floralwhite with an RGB value of #FFFAF0. */
    static readonly FLORALWHITE = new Colour(1.0, 0.9411764740943909, 0.9803921580314636, 1.0)

    /** the colour forestgreen with an RGB value of #228B22. */
    static readonly FORESTGREEN = new Colour(0.13333334028720856, 0.13333334028720856, 0.545098066329956, 1.0)

    /** the colour fuchsia with an RGB value of #FF00FF. */
    static readonly FUCHSIA = new Colour(1.0, 1.0, 0.0, 1.0)

    /** the colour gainsboro with an RGB value of #DCDCDC. */
    static readonly GAINSBORO = new Colour(0.8627451062202454, 0.8627451062202454, 0.8627451062202454, 1.0)

    /** the colour ghostwhite with an RGB value of #F8F8FF. */
    static readonly GHOSTWHITE = new Colour(0.9725490212440491, 1.0, 0.9725490212440491, 1.0)

    /** the colour gold with an RGB value of #FFD700. */
    static readonly GOLD = new Colour(1.0, 0.0, 0.843137264251709, 1.0)

    /** the colour goldenrod with an RGB value of #DAA520. */
    static readonly GOLDENROD = new Colour(0.8549019694328308, 0.125490203499794, 0.6470588445663452, 1.0)

    /** the colour gray with an RGB value of #808080. */
    static readonly GRAY = new Colour(0.501960813999176, 0.501960813999176, 0.501960813999176, 1.0)

    /** the colour green with an RGB value of #008000. */
    static readonly GREEN = new Colour(0.0, 0.0, 0.501960813999176, 1.0)

    /** the colour greenyellow with an RGB value of #ADFF2F. */
    static readonly GREENYELLOW = new Colour(0.6784313917160034, 0.18431372940540314, 1.0, 1.0)

    /** the colour grey with an RGB value of #808080. */
    static readonly GREY = new Colour(0.501960813999176, 0.501960813999176, 0.501960813999176, 1.0)

    /** the colour honeydew with an RGB value of #F0FFF0. */
    static readonly HONEYDEW = new Colour(0.9411764740943909, 0.9411764740943909, 1.0, 1.0)

    /** the colour hotpink with an RGB value of #FF69B4. */
    static readonly HOTPINK = new Colour(1.0, 0.7058823704719543, 0.4117647111415863, 1.0)

    /** the colour indianred with an RGB value of #CD5C5C. */
    static readonly INDIANRED = new Colour(0.8039215803146362, 0.3607843220233917, 0.3607843220233917, 1.0)

    /** the colour indigo with an RGB value of #4B0082. */
    static readonly INDIGO = new Colour(0.29411765933036804, 0.5098039507865906, 0.0, 1.0)

    /** the colour ivory with an RGB value of #FFFFF0. */
    static readonly IVORY = new Colour(1.0, 0.9411764740943909, 1.0, 1.0)

    /** the colour khaki with an RGB value of #F0E68C. */
    static readonly KHAKI = new Colour(0.9411764740943909, 0.5490196347236633, 0.9019607901573181, 1.0)

    /** the colour lavender with an RGB value of #E6E6FA. */
    static readonly LAVENDER = new Colour(0.9019607901573181, 0.9803921580314636, 0.9019607901573181, 1.0)

    /** the colour lavenderblush with an RGB value of #FFF0F5. */
    static readonly LAVENDERBLUSH = new Colour(1.0, 0.9607843160629272, 0.9411764740943909, 1.0)

    /** the colour lawngreen with an RGB value of #7CFC00. */
    static readonly LAWNGREEN = new Colour(0.48627451062202454, 0.0, 0.9882352948188782, 1.0)

    /** the colour lemonchiffon with an RGB value of #FFFACD. */
    static readonly LEMONCHIFFON = new Colour(1.0, 0.8039215803146362, 0.9803921580314636, 1.0)

    /** the colour lightblue with an RGB value of #ADD8E6. */
    static readonly LIGHTBLUE = new Colour(0.6784313917160034, 0.9019607901573181, 0.8470588326454163, 1.0)

    /** the colour lightcoral with an RGB value of #F08080. */
    static readonly LIGHTCORAL = new Colour(0.9411764740943909, 0.501960813999176, 0.501960813999176, 1.0)

    /** the colour lightcyan with an RGB value of #E0FFFF. */
    static readonly LIGHTCYAN = new Colour(0.8784313797950745, 1.0, 1.0, 1.0)

    /** the colour lightgoldenrodyellow with an RGB value of #FAFAD2. */
    static readonly LIGHTGOLDENRODYELLOW = new Colour(0.9803921580314636, 0.8235294222831726, 0.9803921580314636, 1.0)

    /** the colour lightgray with an RGB value of #D3D3D3. */
    static readonly LIGHTGRAY = new Colour(0.8274509906768799, 0.8274509906768799, 0.8274509906768799, 1.0)

    /** the colour lightgreen with an RGB value of #90EE90. */
    static readonly LIGHTGREEN = new Colour(0.5647059082984924, 0.5647059082984924, 0.9333333373069763, 1.0)

    /** the colour lightgrey with an RGB value of #D3D3D3. */
    static readonly LIGHTGREY = new Colour(0.8274509906768799, 0.8274509906768799, 0.8274509906768799, 1.0)

    /** the colour lightpink with an RGB value of #FFB6C1. */
    static readonly LIGHTPINK = new Colour(1.0, 0.7568627595901489, 0.7137255072593689, 1.0)

    /** the colour lightsalmon with an RGB value of #FFA07A. */
    static readonly LIGHTSALMON = new Colour(1.0, 0.47843137383461, 0.6274510025978088, 1.0)

    /** the colour lightseagreen with an RGB value of #20B2AA. */
    static readonly LIGHTSEAGREEN = new Colour(0.125490203499794, 0.6666666865348816, 0.6980392336845398, 1.0)

    /** the colour lightskyblue with an RGB value of #87CEFA. */
    static readonly LIGHTSKYBLUE = new Colour(0.529411792755127, 0.9803921580314636, 0.8078431487083435, 1.0)

    /** the colour lightslategray with an RGB value of #778899. */
    static readonly LIGHTSLATEGRAY = new Colour(0.46666666865348816, 0.6000000238418579, 0.5333333611488342, 1.0)

    /** the colour lightslategrey with an RGB value of #778899. */
    static readonly LIGHTSLATEGREY = new Colour(0.46666666865348816, 0.6000000238418579, 0.5333333611488342, 1.0)

    /** the colour lightsteelblue with an RGB value of #B0C4DE. */
    static readonly LIGHTSTEELBLUE = new Colour(0.6901960968971252, 0.8705882430076599, 0.7686274647712708, 1.0)

    /** the colour lightyellow with an RGB value of #FFFFE0. */
    static readonly LIGHTYELLOW = new Colour(1.0, 0.8784313797950745, 1.0, 1.0)

    /** the colour lime with an RGB value of #00FF00. */
    static readonly LIME = new Colour(0.0, 0.0, 1.0, 1.0)

    /** the colour limegreen with an RGB value of #32CD32. */
    static readonly LIMEGREEN = new Colour(0.19607843458652496, 0.19607843458652496, 0.8039215803146362, 1.0)

    /** the colour linen with an RGB value of #FAF0E6. */
    static readonly LINEN = new Colour(0.9803921580314636, 0.9019607901573181, 0.9411764740943909, 1.0)

    /** the colour magenta with an RGB value of #FF00FF. */
    static readonly MAGENTA = new Colour(1.0, 1.0, 0.0, 1.0)

    /** the colour maroon with an RGB value of #800000. */
    static readonly MAROON = new Colour(0.501960813999176, 0.0, 0.0, 1.0)

    /** the colour mediumaquamarine with an RGB value of #66CDAA. */
    static readonly MEDIUMAQUAMARINE = new Colour(0.4000000059604645, 0.6666666865348816, 0.8039215803146362, 1.0)

    /** the colour mediumblue with an RGB value of #0000CD. */
    static readonly MEDIUMBLUE = new Colour(0.0, 0.8039215803146362, 0.0, 1.0)

    /** the colour mediumorchid with an RGB value of #BA55D3. */
    static readonly MEDIUMORCHID = new Colour(0.729411780834198, 0.8274509906768799, 0.3333333432674408, 1.0)

    /** the colour mediumpurple with an RGB value of #9370DB. */
    static readonly MEDIUMPURPLE = new Colour(0.5764706134796143, 0.8588235378265381, 0.43921568989753723, 1.0)

    /** the colour mediumseagreen with an RGB value of #3CB371. */
    static readonly MEDIUMSEAGREEN = new Colour(0.23529411852359772, 0.4431372582912445, 0.7019608020782471, 1.0)

    /** the colour mediumslateblue with an RGB value of #7B68EE. */
    static readonly MEDIUMSLATEBLUE = new Colour(0.48235294222831726, 0.9333333373069763, 0.40784314274787903, 1.0)

    /** the colour mediumspringgreen with an RGB value of #00FA9A. */
    static readonly MEDIUMSPRINGGREEN = new Colour(0.0, 0.6039215922355652, 0.9803921580314636, 1.0)

    /** the colour mediumturquoise with an RGB value of #48D1CC. */
    static readonly MEDIUMTURQUOISE = new Colour(0.2823529541492462, 0.800000011920929, 0.8196078538894653, 1.0)

    /** the colour mediumvioletred with an RGB value of #C71585. */
    static readonly MEDIUMVIOLETRED = new Colour(0.7803921699523926, 0.5215686559677124, 0.08235294371843338, 1.0)

    /** the colour midnightblue with an RGB value of #191970. */
    static readonly MIDNIGHTBLUE = new Colour(0.09803921729326248, 0.43921568989753723, 0.09803921729326248, 1.0)

    /** the colour mintcream with an RGB value of #F5FFFA. */
    static readonly MINTCREAM = new Colour(0.9607843160629272, 0.9803921580314636, 1.0, 1.0)

    /** the colour mistyrose with an RGB value of #FFE4E1. */
    static readonly MISTYROSE = new Colour(1.0, 0.8823529481887817, 0.8941176533699036, 1.0)

    /** the colour moccasin with an RGB value of #FFE4B5. */
    static readonly MOCCASIN = new Colour(1.0, 0.7098039388656616, 0.8941176533699036, 1.0)

    /** the colour navajowhite with an RGB value of #FFDEAD. */
    static readonly NAVAJOWHITE = new Colour(1.0, 0.6784313917160034, 0.8705882430076599, 1.0)

    /** the colour navy with an RGB value of #000080. */
    static readonly NAVY = new Colour(0.0, 0.501960813999176, 0.0, 1.0)

    /** the colour oldlace with an RGB value of #FDF5E6. */
    static readonly OLDLACE = new Colour(0.9921568632125854, 0.9019607901573181, 0.9607843160629272, 1.0)

    /** the colour olive with an RGB value of #808000. */
    static readonly OLIVE = new Colour(0.501960813999176, 0.0, 0.501960813999176, 1.0)

    /** the colour olivedrab with an RGB value of #6B8E23. */
    static readonly OLIVEDRAB = new Colour(0.41960784792900085, 0.13725490868091583, 0.5568627715110779, 1.0)

    /** the colour orange with an RGB value of #FFA500. */
    static readonly ORANGE = new Colour(1.0, 0.0, 0.6470588445663452, 1.0)

    /** the colour orangered with an RGB value of #FF4500. */
    static readonly ORANGERED = new Colour(1.0, 0.0, 0.2705882489681244, 1.0)

    /** the colour orchid with an RGB value of #DA70D6. */
    static readonly ORCHID = new Colour(0.8549019694328308, 0.8392156958580017, 0.43921568989753723, 1.0)

    /** the colour palegoldenrod with an RGB value of #EEE8AA. */
    static readonly PALEGOLDENROD = new Colour(0.9333333373069763, 0.6666666865348816, 0.9098039269447327, 1.0)

    /** the colour palegreen with an RGB value of #98FB98. */
    static readonly PALEGREEN = new Colour(0.5960784554481506, 0.5960784554481506, 0.9843137264251709, 1.0)

    /** the colour paleturquoise with an RGB value of #AFEEEE. */
    static readonly PALETURQUOISE = new Colour(0.686274528503418, 0.9333333373069763, 0.9333333373069763, 1.0)

    /** the colour palevioletred with an RGB value of #DB7093. */
    static readonly PALEVIOLETRED = new Colour(0.8588235378265381, 0.5764706134796143, 0.43921568989753723, 1.0)

    /** the colour papayawhip with an RGB value of #FFEFD5. */
    static readonly PAPAYAWHIP = new Colour(1.0, 0.8352941274642944, 0.9372549057006836, 1.0)

    /** the colour peachpuff with an RGB value of #FFDAB9. */
    static readonly PEACHPUFF = new Colour(1.0, 0.7254902124404907, 0.8549019694328308, 1.0)

    /** the colour peru with an RGB value of #CD853F. */
    static readonly PERU = new Colour(0.8039215803146362, 0.24705882370471954, 0.5215686559677124, 1.0)

    /** the colour pink with an RGB value of #FFC0CB. */
    static readonly PINK = new Colour(1.0, 0.7960784435272217, 0.7529411911964417, 1.0)

    /** the colour plum with an RGB value of #DDA0DD. */
    static readonly PLUM = new Colour(0.8666666746139526, 0.8666666746139526, 0.6274510025978088, 1.0)

    /** the colour powderblue with an RGB value of #B0E0E6. */
    static readonly POWDERBLUE = new Colour(0.6901960968971252, 0.9019607901573181, 0.8784313797950745, 1.0)

    /** the colour purple with an RGB value of #800080. */
    static readonly PURPLE = new Colour(0.501960813999176, 0.501960813999176, 0.0, 1.0)

    /** the colour red with an RGB value of #FF0000. */
    static readonly RED = new Colour(1.0, 0.0, 0.0, 1.0)

    /** the colour rosybrown with an RGB value of #BC8F8F. */
    static readonly ROSYBROWN = new Colour(0.7372549176216125, 0.5607843399047852, 0.5607843399047852, 1.0)

    /** the colour royalblue with an RGB value of #4169E1. */
    static readonly ROYALBLUE = new Colour(0.2549019753932953, 0.8823529481887817, 0.4117647111415863, 1.0)

    /** the colour saddlebrown with an RGB value of #8B4513. */
    static readonly SADDLEBROWN = new Colour(0.545098066329956, 0.07450980693101883, 0.2705882489681244, 1.0)

    /** the colour salmon with an RGB value of #FA8072. */
    static readonly SALMON = new Colour(0.9803921580314636, 0.4470588266849518, 0.501960813999176, 1.0)

    /** the colour sandybrown with an RGB value of #F4A460. */
    static readonly SANDYBROWN = new Colour(0.95686274766922, 0.3764705955982208, 0.6431372761726379, 1.0)

    /** the colour seagreen with an RGB value of #2E8B57. */
    static readonly SEAGREEN = new Colour(0.18039216101169586, 0.34117648005485535, 0.545098066329956, 1.0)

    /** the colour seashell with an RGB value of #FFF5EE. */
    static readonly SEASHELL = new Colour(1.0, 0.9333333373069763, 0.9607843160629272, 1.0)

    /** the colour sienna with an RGB value of #A0522D. */
    static readonly SIENNA = new Colour(0.6274510025978088, 0.1764705926179886, 0.32156863808631897, 1.0)

    /** the colour silver with an RGB value of #C0C0C0. */
    static readonly SILVER = new Colour(0.7529411911964417, 0.7529411911964417, 0.7529411911964417, 1.0)

    /** the colour skyblue with an RGB value of #87CEEB. */
    static readonly SKYBLUE = new Colour(0.529411792755127, 0.9215686321258545, 0.8078431487083435, 1.0)

    /** the colour slateblue with an RGB value of #6A5ACD. */
    static readonly SLATEBLUE = new Colour(0.4156862795352936, 0.8039215803146362, 0.3529411852359772, 1.0)

    /** the colour slategray with an RGB value of #708090. */
    static readonly SLATEGRAY = new Colour(0.43921568989753723, 0.5647059082984924, 0.501960813999176, 1.0)

    /** the colour slategrey with an RGB value of #708090. */
    static readonly SLATEGREY = new Colour(0.43921568989753723, 0.5647059082984924, 0.501960813999176, 1.0)

    /** the colour snow with an RGB value of #FFFAFA. */
    static readonly SNOW = new Colour(1.0, 0.9803921580314636, 0.9803921580314636, 1.0)

    /** the colour springgreen with an RGB value of #00FF7F. */
    static readonly SPRINGGREEN = new Colour(0.0, 0.49803921580314636, 1.0, 1.0)

    /** the colour steelblue with an RGB value of #4682B4. */
    static readonly STEELBLUE = new Colour(0.27450981736183167, 0.7058823704719543, 0.5098039507865906, 1.0)

    /** the colour tan with an RGB value of #D2B48C. */
    static readonly TAN = new Colour(0.8235294222831726, 0.5490196347236633, 0.7058823704719543, 1.0)

    /** the colour teal with an RGB value of #008080. */
    static readonly TEAL = new Colour(0.0, 0.501960813999176, 0.501960813999176, 1.0)

    /** the colour thistle with an RGB value of #D8BFD8. */
    static readonly THISTLE = new Colour(0.8470588326454163, 0.8470588326454163, 0.7490196228027344, 1.0)

    /** the colour tomato with an RGB value of #FF6347. */
    static readonly TOMATO = new Colour(1.0, 0.27843138575553894, 0.38823530077934265, 1.0)

    /** the colour turquoise with an RGB value of #40E0D0. */
    static readonly TURQUOISE = new Colour(0.250980406999588, 0.8156862854957581, 0.8784313797950745, 1.0)

    /** the colour violet with an RGB value of #EE82EE. */
    static readonly VIOLET = new Colour(0.9333333373069763, 0.9333333373069763, 0.5098039507865906, 1.0)

    /** the colour wheat with an RGB value of #F5DEB3. */
    static readonly WHEAT = new Colour(0.9607843160629272, 0.7019608020782471, 0.8705882430076599, 1.0)

    /** the colour white with an RGB value of #FFFFFF. */
    static readonly WHITE = new Colour(1.0, 1.0, 1.0, 1.0)

    /** the colour whitesmoke with an RGB value of #F5F5F5. */
    static readonly WHITESMOKE = new Colour(0.9607843160629272, 0.9607843160629272, 0.9607843160629272, 1.0)

    /** the colour yellow with an RGB value of #FFFF00. */
    static readonly YELLOW = new Colour(1.0, 0.0, 1.0, 1.0)

    /** the colour yellowgreen with an RGB value of #9ACD32. */
    static readonly YELLOWGREEN = new Colour(0.6039215922355652, 0.19607843458652496, 0.8039215803146362, 1.0)

    /**
     * Colour from red, green, blue (0, 255). Colour will be fully opaque.
     */
    static rgb(red: number, green: number, blue: number): Colour {
        return Colour.rgba(red, green, blue, 1.0)
    }

    /**
     * Colour from red, green, blue (0, 255) and opacity (0, 1.0).
     */
    static rgba(red: number, green: number, blue: number, alpha: number): Colour {
        return new Colour(red / 255, green / 255, blue / 255, alpha)
    }

    /**
     * Colour from hex string (#ff1540). Colour will be fully opaque.
     */
    static hex(hex: string): Colour | undefined {
        return Colour.hexa(hex, 1.0)
    }

    /**
     * Colour from hex string (#ff1540) and opacity (0, 1.0).
     */
    static hexa(hex: string, alpha: number): Colour | undefined {
        if (!hex.startsWith("#")) {
            return undefined
        }
        const c = hex.substring(1)
        if (c.length !== 6) {
            return undefined
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
     * @param saturation percentage value (0, 1.0), where 0.0 means a shade of gray, and 1.0 is the full colour
     * @param lightness percentagevalue (0, 1.0), where 0.0 is black, 0.5 is neither light or dark, 1.0 is white
     */
    static hsl(hue: number, saturation: number, lightness: number): Colour {
        return Colour.hsla(hue, saturation, lightness, 1.0)
    }

    /**
     * Colour from hue, saturation, lightness and opacity.
     *
     * @param hue degree on the colour wheel from 0 to 360. 0 is red, 120 is green, and 240 is blue
     * @param saturation percentage value (0, 1.0), where 0.0 means a shade of gray, and 1.0 is the full colour
     * @param lightness percentagevalue (0, 1.0), where 0.0 is black, 0.5 is neither light or dark, 1.0 is white
     * @param alpha opacity (0, 1.0), where 0.0 is fully transparent and 1.0 is fully opaque
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

    /** intensity of red between 0 and 1.0. */
    red(): number {
        return this._red
    }

    /** intensity of green between 0 and 1.0. */
    green(): number {
        return this._green
    }

    /** intensity of blue between 0 and 1.0. */
    blue(): number {
        return this._blue
    }

    /** opacity as a number between 0.0 (fully transparent) and 1.0 (fully opaque). */
    alpha(): number {
        return this._alpha
    }

}

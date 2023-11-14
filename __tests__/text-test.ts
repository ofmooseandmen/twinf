import { Offset } from '../src/pixels'
import {
    Sprites,
    SpriteGeometry,
    SpriteInRaster
} from '../src/rendering'

describe('text', () => {

    describe('Sprites', () => {
        test('fromLiteral', () => {
            const m: SpriteGeometry = {}
            m['a'] = new SpriteInRaster(
                new Offset(10, 0),
                20,
                10
            )
            const s = new Sprites(m)
            const data = JSON.parse(JSON.stringify(s))
            expect(Sprites.fromLiteral(data)).toEqual(s)
        })
    })

    /* TODO: macking opentype, probably should update typescript first! */

})

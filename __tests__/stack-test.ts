import { Stack } from "../src/stack"

describe("stack", () => {

    describe("insert", () => {

        test("insert in empty stack", () => {
            let s = new Stack<string>()
            s.insert("wire", 1, "pink flag")
            expect(s.get("wire")).toEqual("pink flag")
            expect(s.all()).toEqual(["pink flag"])
        })

        test("insert replaces element with same name", () => {
            let s = new Stack<string>()
            s.insert("wire", 1, "pink flag")
            s.insert("wire", 1, "chairs missing")
            expect(s.get("wire")).toEqual("chairs missing")
            expect(s.all()).toEqual(["chairs missing"])
        })

        test("insert retains the stack order", () => {
            let s = new Stack<string>()
            s.insert("1978", 2, "chairs missing")
            s.insert("1977", 1, "pink flag")
            expect(s.get("1977")).toEqual("pink flag")
            expect(s.get("1978")).toEqual("chairs missing")
            expect(s.all()).toEqual(["pink flag", "chairs missing"])
        })

        test("insert handles stack order change", () => {
            let s = new Stack<string>()
            s.insert("1977", 1, "pink flag")
            s.insert("1978", 2, "chairs missing")
            s.insert("1977", 3, "pink flag")
            expect(s.get("1977")).toEqual("pink flag")
            expect(s.get("1978")).toEqual("chairs missing")
            expect(s.all()).toEqual(["chairs missing", "pink flag"])
        })

    })

    describe("delete", () => {

        test("deleting an element from an empty stack returns an empty stack", () => {
            let s = new Stack<string>()
            s.delete("1977")
            expect(s.all()).toEqual([])
        })

        test("deleting an unknown element does not change the stack", () => {
            let s = new Stack<string>()
            s.insert("1977", 1, "pink flag")
            s.delete("1978")
            expect(s.get("1977")).toEqual("pink flag")
            expect(s.all()).toEqual(["pink flag"])
        })

        test("deleting the last element returns an empty stack", () => {
            let s = new Stack<string>()
            s.insert("1977", 1, "pink flag")
            s.delete("1977")
            expect(s.get("1977")).toBeUndefined()
            expect(s.all()).toEqual([])
        })

        test("deleting the last element of a layer deletes that layer", () => {
            let s = new Stack<string>()
            s.insert("1977", 1, "pink flag")
            s.insert("1978", 2, "chairs missing")
            s.delete("1977")
            expect(s.get("1977")).toBeUndefined()
            expect(s.get("1978")).toEqual("chairs missing")
            expect(s.all()).toEqual(["chairs missing"])
        })

    })

})

import { Test } from "./../src/index"

describe("test suite", () => {
    test("addition", () => {
        expect(Test.add(1, 1)).toBe(2);
    })
});
import columnAccessor from './columnAccessor';

describe('Util:columnAccessor', () => {
    it('should run this test', () => {
        const accessor = columnAccessor({ column: 'foo' });
        const d = { foo: 5 };
        expect(accessor(d)).toEqual(5);
    });
});

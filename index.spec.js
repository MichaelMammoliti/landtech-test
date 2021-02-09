const {
  getTree,
  createMessagePrefix,
  createMessage,
  getMessageFromTree,
  getArgs,
  getOwnedLands,
  getOwnedLandsCount,
  extendWithLandCount,
} = require('./index');

describe('getTree', () => {
  it('should return the correct data', () => {
    const companies = [
      { id: '1', name: 'a', parentId: '' },
      { id: '2', name: 'b', parentId: '1' },
      { id: '3', name: 'c', parentId: '2' },
    ];

    const lands = [
      { id: '1', companyId: '1' },
      { id: '2', companyId: '2' },
      { id: '3', companyId: '2' },
      { id: '4', companyId: '3' },
      { id: '5', companyId: '3' },
    ];

    const expected = [
      { id: '1', name: 'a', parentId: '', ownedLandsCount: 5, found: false, items: [
        { id: '2', name: 'b', parentId: '1', ownedLandsCount: 4, found: false, items: [
          { id: '3', name: 'c', parentId: '2', found: true, ownedLandsCount: 2 },
        ] },
      ] },
    ];

    const options = {
      mode: 'from_root',
      id: companies[2].id
    };

    const received = getTree(companies[2], companies, lands, options);

    expect(received).toEqual(expected);
  });
});

describe('createMessage', () => {
  describe('when level is 0', () => {
    it('should return the correct data', () => {
      const received = createMessage(0, {
        id: '1',
        name: 'FOO',
        ownedLandsCount: 4,
      });

      const expected = '1; FOO; owner of 4 land parcels';

      expect(received).toEqual(expected);
    });
  });

  describe('when level is NOT 0', () => {
    it('should return the correct data', () => {
      const received = createMessage(3, {
        id: '1',
        name: 'FOO',
        ownedLandsCount: 4,
      });

      const expected = ' | | | - 1; FOO; owner of 4 land parcels';

      expect(received).toEqual(expected);
    });
  });

  describe('when item has found key set to true', () => {
    it('should return the correct data', () => {
      const received = createMessage(3, {
        id: '1',
        name: 'FOO',
        ownedLandsCount: 4,
        found: true,
      });

      const expected = ' | | | - 1; FOO; owner of 4 land parcels ***';

      expect(received).toEqual(expected);
    });
  });
});

describe('getMessageFromTree', () => {
  it('should return the correct data', () => {
    const tree = [
      { id: '1', name: 'a', parentId: '', ownedLandsCount: 5, items: [
        { id: '2', name: 'b', parentId: '1', ownedLandsCount: 4, items: [
          { id: '3', name: 'c', parentId: '2', ownedLandsCount: 0 },
        ] },
      ] },
    ];

    const received = getMessageFromTree(tree);
    const expected = '1; a; owner of 5 land parcels\n | - 2; b; owner of 4 land parcels\n | | - 3; c; owner of 0 land parcels';

    expect(received).toEqual(expected);
  });
});

describe('createMessagePrefix', () => {
  describe('when level is 0', () => {
    it('should return the correct data', () => {
      const received = createMessagePrefix(0);
      const expected = '';

      expect(received).toEqual(expected);
    });
  });

  describe('when level is not 0', () => {
    it('should return the correct data', () => {
      const received = createMessagePrefix(3);
      const expected = ' | | | - ';

      expect(received).toEqual(expected);
    });
  });
});

describe('getArgs', () => {
  it('should return the correct data', () => {
    const received = getArgs(['', '', '--mode=something', 'foo']);
    const expected = { options: { mode: 'something' }, values: ['foo'] };

    expect(received).toMatchObject(expected);
  });
});

describe('getOwnedLands', () => {
  it('should return the correct value', () => {
    const company = { id: '3', name: 'c', parentId: '2' };

    const lands = [
      { id: '1', companyId: '1' },
      { id: '2', companyId: '2' },
      { id: '3', companyId: '2' },
      { id: '4', companyId: '3' },
      { id: '5', companyId: '3' },
    ];

    const received = getOwnedLands(company, lands);
    const expected = [
      { id: '4', companyId: '3' },
      { id: '5', companyId: '3' },
    ];

    expect(received).toEqual(expected);
  });
});

describe('getOwnedLandsCount', () => {
  it('should return the correct data', () => {
    const company = { id: '1', name: 'a', parentId: '', items: [
        { id: '2', name: 'b', parentId: '1', ownedLandsCount: 9, items: [
          { id: '3', name: 'c', parentId: '2', ownedLandsCount: 5 },
        ] },
      ],
    };

    const lands = [
      { id: '1', companyId: '1' },
      { id: '2', companyId: '1' },
      { id: '3', companyId: '1' },
      { id: '4', companyId: '1' },
      { id: '5', companyId: '1' },
    ];

    const expected = 14;

    const received = getOwnedLandsCount(company, lands);

    expect(received).toEqual(expected);
  });
});

describe('extendWithLandCount', () => {
  describe('when the value passed is an array', () => {
    it('should return the correct data', () => {
      const companies = [
        { id: '1', name: 'a', parentId: '' },
        { id: '2', name: 'b', parentId: '1' },
        { id: '3', name: 'c', parentId: '2' },
      ];

      const lands = [
        { id: '1', companyId: '1' },
        { id: '2', companyId: '2' },
        { id: '3', companyId: '2' },
        { id: '4', companyId: '3' },
        { id: '5', companyId: '3' },
      ];

      const received = extendWithLandCount(companies, lands);
      const expected =  [
        { id: '1', name: 'a', ownedLandsCount: 1, parentId: '' },
        { id: '2', name: 'b', ownedLandsCount: 2, parentId: '1' },
        { id: '3', name: 'c', ownedLandsCount: 2, parentId: '2' },
      ];

      expect(received).toEqual(expected);
    });
  });

  describe('when the value passed is an object', () => {
    it('should return the correct data', () => {
      const companies = [
        { id: '1', name: 'a', parentId: '' },
        { id: '2', name: 'b', parentId: '1' },
        { id: '3', name: 'c', parentId: '2' },
      ];

      const lands = [
        { id: '1', companyId: '1' },
        { id: '2', companyId: '2' },
        { id: '3', companyId: '2' },
        { id: '4', companyId: '3' },
        { id: '5', companyId: '3' },
      ];

      const received = extendWithLandCount(companies[1], lands);
      const expected = { id: '2', name: 'b', ownedLandsCount: 2, parentId: '1' };

      expect(received).toMatchObject(expected);
    });
  });
});

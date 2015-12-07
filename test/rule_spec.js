import chai from 'chai';
let assert = chai.assert;
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe('RuleLeaf', () => {
    const {RuleLeaf} = require('../src/styles/rule');

    it('returns an new instanceof', () => {
        let subject = new RuleLeaf({name: 'test'});
        assert.instanceOf(subject, RuleLeaf);
        assert.propertyVal(subject, 'name', 'test');
    });

});

describe('RuleGroup', () => {
    const {RuleTree} = require('../src/styles/rule');

    it('returns an new instanceof', () => {
        let subject = new RuleTree({name: 'test'});
        assert.instanceOf(subject, RuleTree);
        assert.propertyVal(subject, 'name', 'test');
    });
});

describe('.mergeTrees()', () => {
    let subject = [
        [ { group: { a: 0.001 } }, { group: { b: 2 } }, { group: { c: 3 } }, { group: { d: 4 } } ],
        [ { group: { a: 3.14 } }, { group: { d: 3 } }, { group: { a: 1 } }, { group: { b: 2 } } ],
        [ { group: { b: 'y' } }, { group: { a: 'x' } }, { group:{ b: 0.0003 } }, { group: { c: 10 } } ],
        [ { group: { b: 3.14 } }, { group: { a: 2.71828 } }, { group:{ b: 0.0001 } }, { group: { d: 'x' } } ]
    ];

    const {mergeTrees} = require('../src/styles/rule');

    describe('when given an array of arrays to merged', () => {

        it('returns a single object', () => {
            let result = mergeTrees(subject, 'group', {});
            let compare = {
                visible: true,
                a: 1,
                b: 2,
                c: 10,
                d: 'x',
                layers: []
            };
            assert.deepEqual(result, compare);
        });
    });

    describe('when given a array that is similar to real data', () => {
        const parent = {
            group: {
                "width": 10,
                "order": 1,
                "color": [1, 2, 3],
                "a": "x"
            }
        };

        const subject = [
            [
                parent,
                {
                    group: {
                        "order": 3,
                        "a": "y"
                    }
                }
            ],
            [
                parent,
                {
                    group: {
                        "b": "z",
                        "color": [7, 8, 9]
                    }
                }
            ]
        ];

        it('returns the correct object', () => {
            assert.deepEqual(mergeTrees(subject, 'group', {}), {
                visible: true,
                width: 10,
                order: 3,
                a: 'y',
                b: 'z',
                color: [7, 8, 9],
                layers: []
            });
        });

    });

    describe('when given layers with ambiguous properties', () => {

        const subject = [
            [ { group: { a: 1, full_name: 'x' } } ],
            [ { group: { a: 2, full_name: 'z' } } ],
            [ { group: { a: 3, full_name: 'y' } } ]
        ];

        it('the lexically sorted highest rule wins', () => {
            assert.deepEqual(mergeTrees(subject, 'group', {}), {
                a: 2,
                layers: ['x', 'z', 'y'],
                visible: true
            });
        });

    });

});

describe('.parseRules(rules)', () => {

    const {parseRules, walkDown}= require('../src/styles/rule');
    const ruleTree   = require('./fixtures/sample-style');

    describe('when given a raw ruleTree', () => {

        it('returns a RuleGroup', () => {
            assert.instanceOf(parseRules(ruleTree), Object);
        });

        it('returns the correct number of children rules', () => {
            let tree = parseRules(ruleTree).root;
            let number = 0;

            walkDown(tree, (rule) => {
                number += 1;
            });
            assert.equal(number, 4);
        });
    });
});


describe('.groupProps()', () => {
    let {groupProps} = require('../src/styles/rule');

    describe('given an object ', () => {
        let subject = {
            draw: { group: { a: 1 } },
            filter: 'I am a filter',
            a: 'b',
            b: 'c'
        };

        it('groups the properties by white listing', () => {
            assert.deepEqual(groupProps(subject),
                [
                    {
                        draw: { group: { a: 1 } },
                        filter: 'I am a filter'
                    },
                    {
                        a: 'b',
                        b: 'c'
                    }
                ]);
        });
    });
});

describe('.calculateDraw()', () => {
    const {calculateDraw} = require('../src/styles/rule');


    let b = {
        calculatedDraw: [
            { group: { a: true } },
            { group: { b: true } }
        ]
    };

    let c = {
        parent: b,
        draw: {
            group: {
                c: true
            }
        }
    };

    it('calculates a rules inherited draw group', () => {
        assert.deepEqual(
            calculateDraw(c),
            [{ group: { a: true } }, { group: { b: true } }, { group: { c: true } }]
        );
    });
});


describe('RuleTree.buildDrawGroups(context)', () => {
    let subject;
    const {parseRules} = require('../src/styles/rule');
    const {RuleTree}   = require('../src/styles/rule');

    beforeEach(() => {
        subject = parseRules(
            {
                root: {
                    filter: {
                        kind: 'highway'
                    },
                    draw: {
                        group: {
                            width: 10,
                            color: [1, 2, 3]
                        }
                    },
                    fillA: {
                        filter: {
                            name: 'FDR'
                        },
                        draw: {
                            group: {
                                order: 1,
                                color: [3.14, 3.14, 3.14]
                            }
                        },
                        a: {
                            filter: {
                                name: 'FDR'
                            },
                            draw: {
                                group: {
                                    width: 20,
                                    color: [2.71828, 2.71828, 2.71828]
                                }
                            }
                        }
                    },
                    roads: {
                        filter: {
                            '$zoom': { min: 3}
                        },
                        draw: {
                            group: {
                                width: 10,
                                color: [7, 8, 9]
                            }
                        },
                        fillB: {
                            filter: {
                                id: 10
                             },
                            draw: {
                                group: {
                                    color: [10, 11, 12]
                                }
                            },
                            b: {
                                filter: {
                                    id: 10
                                },
                                draw: {
                                    group: {
                                        color: [1, 2, 3]
                                    }
                                }
                            }

                        },
                    }

                }
            }
        );
    });

    afterEach(() => {
        subject = null;
    });

    describe('when the context matches and we ask to merge the sibling rules', () => {
        let context = {
            feature: {
                properties: {
                    kind: 'highway',
                    name: 'FDR',
                    id: 10
                }
            },
            zoom: 3
        };

        it('returns a single object', () => {
            let rule = subject.root.buildDrawGroups(context);
            assert.equal(Object.keys(rule).length, 1);
            assert.deepEqual(rule.group.color, [1, 2, 3]);
            assert.equal(rule.group.width, 20);
            assert.equal(rule.group.order, 1);
        });
    });

    describe('when the feature is a highway and is named FDR', () => {
        let context = {
            feature: {
                properties: {
                    kind: 'highway',
                    name: 'FDR',
                    id: 10
                }
            },
            zoom: 3
        };

        it('returns the correct number of matching rules', () => {
            let rule = subject.root.buildDrawGroups(context);
            assert.equal(Object.keys(rule).length, 1);
            assert.deepEqual(rule.group.color, [1, 2, 3]);
            assert.equal(rule.group.width, 20);
            assert.equal(rule.group.order, 1);
        });
    });

    describe('when the feature is not a road', () => {
        let context = {
            feature: {
                properties: {
                    kind: 'aeroway'
                }
            }
        };

        it('returns undefined', () => {
            const rule = subject.root.buildDrawGroups(context);
            assert.isUndefined(rule);
        });
    });


    describe('parseRules', () => {

        it('returns a tree', () => {
            let subject = parseRules({
                root: {
                    filter: {
                        id: 10
                    },
                    draw: {
                        group: {
                            color: [3.14, 3.14, 3.14]
                        }
                    }
                }
            });
            assert.instanceOf(subject.root, RuleTree);
        });

        describe('when there no draw groups on the parent', () => {
            let subject = parseRules({
                root: {
                    filter: {
                        name: 'ivan'
                    },
                    a: {
                        filter: {
                            id: 10
                        },
                        draw: {
                            group: {
                                color: [1, 2, 3]
                            }
                        }
                    }
                }
            });
            let context = {
                feature: {
                    properties: {
                        name: 'ivan',
                        id: 10
                    }
                }
            };

            it('returns only the child\'s draw', () => {
                let rule = subject.root.buildDrawGroups(context);
                assert.equal(Object.keys(rule).length, 1);
                assert.deepEqual(rule.group.color, [1, 2, 3]);
            });

        });

    });

});



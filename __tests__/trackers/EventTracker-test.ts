const mockDelegate = jest.fn();
const tracker = jest.fn().mockImplementation(() => {
    return Promise.resolve();
});

jest.mock('dom-utils-amplify', () => {
    return {
        delegate: mockDelegate
    }
});

import EventTracker from '../../src/trackers/EventTracker';

describe('EventTracer test', () => {
    describe('environment test', () => {
        test('not in the web env', () => {
            let eventListener = window.addEventListener;
            window.addEventListener = null;
            const eventTracker = new EventTracker(tracker, {
                enable: true
            });

            const spyon = jest.spyOn(eventTracker, 'configure').mockImplementationOnce(() => {
                return;
            });

            expect(spyon).not.toBeCalled();

            spyon.mockClear();
            window.addEventListener = eventListener;
        });

        test('in the web env', () => {
            const spyon = jest.spyOn(EventTracker.prototype, 'configure').mockImplementationOnce(() => {
                return;
            });

            const eventTracker = new EventTracker(tracker, {
                enable: true
            });

            expect(spyon).toBeCalled();

            spyon.mockClear();
        });
        
    });

    describe('configure test', () => {
        test('happy case', () => {
            const eventTracker = new EventTracker(tracker, {
                enable: true
            });

            expect(eventTracker.configure({
                enable: true,
                selectorPrefix: 'prefix',
                events: ['click', 'mouseover'],
                provider: 'myProvider'
            })).toEqual({
                enable: true,
                selectorPrefix: 'prefix',
                events: ['click', 'mouseover'],
                provider: 'myProvider'
            });

            expect(mockDelegate).toBeCalled();

            mockDelegate.mockClear();
        });
    });

    describe('track function test', () => {
        test('happy case', () => {
            const ele = {
                getAttribute(params) {
                    if (params.indexOf('on') >= 0) return 'click';
                    if (params.indexOf('name') >= 0) return 'name';
                    if (params.indexOf('attrs') >= 0) return 'attrs:val';
                }
            }
            
            const eventTracker = new EventTracker(tracker, {
                enable: true
            });

            const event = {
                type: 'click',
                target: {
                    localName: 'localName',
                    id: 'xxxxx'
                }
            }
            eventTracker._trackFunc(event, ele);

            expect(tracker).toBeCalledWith(
                {
                    "attributes": {
                        "attrs": "val", 
                        "target": "localName with id xxxxx", 
                        "type": "click"
                    }, 
                    "name": "name"
                },
                'AWSPinpoint'
            );
        })
    });
});